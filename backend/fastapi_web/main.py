from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import boto3
import json
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import re
from typing import Any, Dict, Optional, List, Union
from psycopg2.extras import RealDictCursor
import psycopg2
import requests
from datetime import datetime

# from testul_xxx import SYSTEM_INSTRUCTIONS

# -----------------------------------------------------
# FastAPI setup
# -----------------------------------------------------
app = FastAPI()
load_dotenv()

Reasoning_instructions = "You are a helpful financial assistant. Your goal is to decide how you can orchestrate tool calls to answer the user's questions and give them financial advice. Decide whether to call one of the following tools: database information extraction, transaction history extraction, investment packages information extraction. If no tool is needed, use the function skip_tool_use. IMPORTANT: Clients and investment packages both have a discrete risk category: 'usor' (low), 'mediu' (medium), 'ridicat' (high). When recommending or querying packages, prefer aligning the package risk to the client's risk category whenever known."

Question_instructions = "You are a helpful financial assistant. Answer the user's questions and give them financial advice. Mentor them as much as possible. Respond only in English. Your final goal is to sell investment packages. You can function-call to access a database to extract client information and their transactions. IMPORTANT: Use the discrete risk categories 'usor', 'mediu', 'ridicat' shared by both clients and packages, and align recommendations accordingly."

@app.get("/health")
def health():
    return {"status": "ok"}

# -----------------------------------------------------
# CORS (permite frontend-ul local)
# -----------------------------------------------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------
# AWS Bedrock Config
# -----------------------------------------------------
# Credentials come from the environment (see .env.example), never from code:
# either AWS_BEARER_TOKEN_BEDROCK (Bedrock API key) or the standard
# AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY credential chain.
AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "global.anthropic.claude-sonnet-4-20250514-v1:0")

bedrock = boto3.client("bedrock-runtime", region_name=AWS_REGION)

# -----------------------------------------------------
# Generic Bedrock caller for custom system prompts
# -----------------------------------------------------
def ask_model(system_text: str, user_message: str, *, max_tokens: int = 500, temperature: float = 0.7) -> str:
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "temperature": temperature,
        "messages": [
            {"role": "user", "content": user_message}
        ],
        "system": [
            {
                "type": "text",
                "text": system_text
            }
        ]
    }
    try:
        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps(body)
        )
        result = json.loads(response["body"].read())
        reply = result["content"][0]["text"].strip()
        return reply
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bedrock/Claude error: {str(e)}")

# -----------------------------------------------------
# Pydantic model pentru input
# -----------------------------------------------------
class ChatInput(BaseModel):
    message: str

class PromptIn(BaseModel):
    prompt: str
    table_hint: Optional[str] = None  # optional: e.g., "cv"

def get_conn():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB", "skepyadb"),
        user=os.getenv("POSTGRES_USER", "admin"),
        password=os.getenv("POSTGRES_PASSWORD", "Paroladb"),
        host=os.getenv("POSTGRES_HOST", "postgres"),
        port=os.getenv("POSTGRES_PORT", "5432"),
    )

# ---------- SQL guard & helpers (migrated from bd.py) ----------
_DANGEROUS = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|MERGE|CALL|COPY|DO)\b",
    re.I,
)

def _get_schema_brief(max_cols_per_table: int = 8) -> str:
    """Minimal context about public schema (tables + first columns) to help LLM."""
    try:
        with get_conn() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT table_name, column_name
                FROM information_schema.columns
                WHERE table_schema='public'
                ORDER BY table_name, ordinal_position
            """)
            rows = cur.fetchall()
    except Exception:
        return ""
    tables = {}
    for r in rows:
        t = r["table_name"]
        tables.setdefault(t, [])
        if len(tables[t]) < max_cols_per_table:
            tables[t].append(r["column_name"])
    parts = []
    for t, cols in tables.items():
        parts.append(f"- {t}({', '.join(cols)})")
    return "Known tables (schema=public):\n" + "\n".join(parts) if parts else ""

def _sanitize_sql(sql: str, default_limit: int = 100) -> str:
    s = sql.strip()
    low = s.lower()
    # accept only SELECT/WITH
    if not (low.startswith("select") or low.startswith("with")):
        return "SELECT 'unsupported' AS error"
    # disallow dangerous keywords
    if _DANGEROUS.search(s):
        return "SELECT 'unsupported' AS error"
    # disallow multiple statements (allow optional trailing ;)
    if ";" in s[:-1]:
        return "SELECT 'unsupported' AS error"
    # append LIMIT if missing (simple check)
    if " limit " not in low:
        s = s.rstrip(" ;") + f" LIMIT {default_limit}"
    return s

SYSTEM_INSTRUCTIONS = """You are a careful PostgreSQL SQL writer.
Return ONLY one read-only SQL statement that begins with SELECT or WITH.
No markdown, no comments, no explanations — only the SQL.
Use schema 'public' for tables. Prefer adding a LIMIT when not specified.
If the request cannot be answered with a single read-only SELECT/WITH, output:
SELECT 'unsupported' AS error;
"""

def nl_to_sql(prompt: str, table_hint: Optional[str]) -> str:
    # Build a more informed system prompt with the current schema (improves SQL quality)
    schema_ctx = _get_schema_brief()
    sys_text = SYSTEM_INSTRUCTIONS if not schema_ctx else (SYSTEM_INSTRUCTIONS + "\n\n" + schema_ctx)

    # Lightly enrich the user prompt without changing meaning (improves clarity)
    user_text = prompt.strip()
    if table_hint:
        user_text += f"\nMain table (hint): {table_hint}"
    # mini few-shot in Romanian
    user_text += """
Examples (RO):
- "cate inregistrari are &lt;tabel&gt;?" -> SELECT COUNT(*) AS total FROM public.&lt;tabel&gt;;
- "arata 5 randuri din &lt;tabel&gt;" -> SELECT * FROM public.&lt;tabel&gt; LIMIT 5;
- "toate inregistrarile din &lt;tabel&gt; pentru user_id=3" -> SELECT * FROM public.&lt;tabel&gt; WHERE user_id=3;
"""

    # Use the existing ask_model wrapper (keeps prompts intact; avoids a second Bedrock client)
    raw_sql = ask_model(sys_text, user_text, max_tokens=500, temperature=0.0)
    return _sanitize_sql(raw_sql, default_limit=100)

# -----------------------------------------------------
# Tool-call stubs (replace with real implementations)
# -----------------------------------------------------
def tool_database_info(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Stub: fetch client metadata / KYC profile from DB.
    Expected args: {"client_id": "..."} (extend as needed)
    """
    client_id = args.get("client_id", "unknown")
    # TODO [integration]: If you want to use real DB data, uncomment the lines below and adapt mapping as needed.
    # from bd import build_sql_client_risk, _pg_query
    # try:
    #     sql = build_sql_client_risk(int(client_id))
    #     rows = _pg_query(sql)
    #     if isinstance(rows, list) and rows:
    #         r = rows[0]
    #         return {
    #             "client_id": client_id,
    #             "name": r.get("name"),
    #             "risk_profile": r.get("risk_rating") or "mediu",
    #             "goals": [],
    #             "currency": "RON"
    #         }
    # except Exception as _e:
    #     # fall back to stub below if DB call fails
    #     pass
    return {
        "client_id": client_id,
        "name": "John / Jane Doe",
        "risk_profile": "mediu",
        "goals": ["retirement", "emergency_fund"],
        "currency": "RON"
    }

def tool_transaction_history(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Stub: fetch recent transactions / holdings.
    Expected args: {"client_id": "...", "limit": 50}
    """
    client_id = args.get("client_id", "unknown")
    limit = int(args.get("limit", 20))
    # TODO [integration]: Use real transactions via SQL builder and PG API gateway.
    # from bd import TxRequest, build_sql_client_transactions, _pg_query
    # try:
    #     req = TxRequest(client_id=int(client_id), limit=limit)
    #     sql = build_sql_client_transactions(req)
    #     rows = _pg_query(sql)
    #     # Map your DB rows to the expected payload below (recent_transactions/holdings_estimate).
    #     # Example mapping (adjust to your schema):
    #     # recent = [{"date": r["transaction_date"], "type": r.get("type",""), "symbol": r.get("symbol",""), "qty": r.get("qty", 0), "price": r.get("price", 0.0)} for r in rows]
    #     # return {"client_id": client_id, "recent_transactions": recent, "holdings_estimate": []}
    # except Exception as _e:
    #     pass
    return {
        "client_id": client_id,
        "recent_transactions": [
            {"date": "2025-10-01", "type": "BUY", "symbol": "TLV", "qty": 10, "price": 27.4},
            {"date": "2025-09-15", "type": "SELL", "symbol": "SNP", "qty": 50, "price": 0.58}
        ][:limit],
        "holdings_estimate": [
            {"symbol": "TLV", "qty": 120},
            {"symbol": "SNP", "qty": 0}
        ]
    }

def tool_investment_packages(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Stub: fetch curated investment packages.
    Expected args: {"risk": "usor|mediu|ridicat"}
    """
    risk = normalize_risk(args.get("risk", "mediu"))
    # TODO: replace with real catalog lookup
    catalog = {
        "usor": [
            {"name": "Safety Net (Usor)", "mix": {"Bonds": 80, "Equities": 15, "Cash": 5}, "fees": 0.35, "risk": "usor"}
        ],
        "mediu": [
            {"name": "Core Balanced (Mediu)", "mix": {"Bonds": 50, "Equities": 45, "Cash": 5}, "fees": 0.40, "risk": "mediu"}
        ],
        "ridicat": [
            {"name": "Equity Growth (Ridicat)", "mix": {"Bonds": 15, "Equities": 80, "Cash": 5}, "fees": 0.45, "risk": "ridicat"}
        ]
    }
    return {"risk": risk, "packages": catalog.get(risk, catalog["mediu"])}

def skip_tool_use(args: Dict[str, Any]) -> Dict[str, Any]:
    """Explicit no-op tool to keep the interface uniform."""
    return {"skipped": True}

# Map router tool names to functions
TOOL_REGISTRY = {
    "database_info": tool_database_info,
    "transaction_history": tool_transaction_history,
    "investment_packages": tool_investment_packages,
    "skip": skip_tool_use
}

# Human-readable tool specs (used to brief the router LLM)
TOOL_SPECS: Dict[str, Dict[str, Any]] = {
    "database_info": {
        "description": "Fetch client metadata / KYC profile to tailor advice.",
        "args_schema": {"client_id": "string (client identifier)"}
    },
    "transaction_history": {
        "description": "Fetch recent transactions and current rough holdings.",
        "args_schema": {"client_id": "string", "limit": "integer (default 20)"}
    },
    "investment_packages": {
        "description": "Fetch curated investment packages aligned to the client's risk.",
        "args_schema": {"risk": "one of {usor, mediu, ridicat}"}
    },
    "skip": {
        "description": "No tool calls are needed.",
        "args_schema": {}
    }
}

# -----------------------------------------------------
# JSON parsing helper (tolerant to extra text)
# -----------------------------------------------------
def parse_router_json(text: str) -> Optional[Dict[str, Any]]:
    """
    Try json.loads; if it fails, attempt to extract the first balanced {...} block.
    """
    try:
        return json.loads(text)
    except Exception:
        pass
    start = text.find("{")
    if start == -1:
        return None
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                candidate = text[start:i+1]
                try:
                    return json.loads(candidate)
                except Exception:
                    return None
    return None

# -----------------------------------------------------
# Multi-step planner and executor helpers
# -----------------------------------------------------
def _deep_get(obj: Any, path: str) -> Any:
    """
    Resolve dotted placeholder like 'database_info.risk_profile' or 'last.client_id' from a nested dict.
    """
    cur: Any = obj
    for part in path.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return None
    return cur

def _resolve_placeholders(value: Any, context: Dict[str, Any]) -> Any:
    """
    Replace Jinja-like placeholders {{...}} inside strings using keys from `context`.
    If the whole string is a single placeholder and resolves to non-string, return the raw value.
    Supports dotted paths like {{database_info.risk_profile}} or {{last.risk_profile}}.
    """
    if not isinstance(value, str):
        return value
    s = value.strip()
    # single placeholder case
    if s.startswith("{{") and s.endswith("}}"):
        key = s[2:-2].strip()
        if "." in key:
            top, rest = key.split(".", 1)
            base = context.get(top)
            resolved = _deep_get(base, rest) if base is not None else None
        else:
            resolved = context.get(key)
        return resolved if resolved is not None else value

    # embedded placeholders
    out = value
    start = 0
    while True:
        i = out.find("{{", start)
        if i == -1:
            break
        j = out.find("}}", i + 2)
        if j == -1:
            break
        key = out[i+2:j].strip()
        if "." in key:
            top, rest = key.split(".", 1)
            base = context.get(top)
            resolved = _deep_get(base, rest) if base is not None else None
        else:
            resolved = context.get(key)
        rep = str(resolved) if resolved is not None else ""
        out = out[:i] + rep + out[j+2:]
        start = i + len(rep)
    return out

def _resolve_args(args: Any, context: Dict[str, Any]) -> Any:
    """
    Recursively resolve placeholders in dict/list structures.
    """
    if isinstance(args, dict):
        return {k: _resolve_args(v, context) for k, v in args.items()}
    if isinstance(args, list):
        return [_resolve_args(v, context) for v in args]
    return _resolve_placeholders(args, context)

def _tools_catalog_text() -> str:
    lines = []
    for name, spec in TOOL_SPECS.items():
        args_schema = json.dumps(spec.get("args_schema", {}), ensure_ascii=False)
        lines.append(f"- {name}: {spec.get('description','')} | args: {args_schema}")
    return "\n".join(lines)

def route_tool_plan(user_message: str) -> Dict[str, Any]:
    """
    Agent 1 (planner): produce a multi-step plan (0..3 steps) of tool calls.
    Returns a dict: {"plan": [{"tool":..., "args": {...}}, ...], "why": "...", "confidence": float}
    Use 'skip' with an empty plan when no tools are needed.
    """
    tools_text = _tools_catalog_text()
    router_user_prompt = f'''
You are a tool-routing planner.

TOOLS AVAILABLE:
{tools_text}

Return STRICT JSON only, no prose, matching this schema:
{{
  "plan": [{{"tool": "database_info" | "transaction_history" | "investment_packages" | "skip", "args": {{}} }}],
  "why": "short reason",
  "confidence": 0.0
}}

Rules:
- Prefer the minimal set of steps (0..3).
- Use "skip" (and an empty plan) when the user's question can be answered without tools.
- If risk alignment is needed and unknown, first call "database_info" to fetch the client's risk_profile, then call "investment_packages" with {{"risk": "{{database_info.risk_profile}}"}}.
- Only include tools listed above. Keep args concise; omit defaults.
- Do NOT include any explanations outside the JSON.

User message:
"""{user_message}"""
    '''.strip()

    raw = ask_model(Reasoning_instructions, router_user_prompt, max_tokens=400, temperature=0.0)
    parsed = parse_router_json(raw)
    if not isinstance(parsed, dict) or "plan" not in parsed:
        parsed = {"plan": [], "why": "fallback", "confidence": 0.0}
    plan = parsed.get("plan") or []
    # basic validation
    clean_plan: List[Dict[str, Any]] = []
    for step in plan[:3]:
        if not isinstance(step, dict):
            continue
        tool = step.get("tool", "skip")
        args = step.get("args", {})
        if tool not in TOOL_REGISTRY:
            continue
        if tool == "skip":
            continue  # skip steps that explicitly say skip
        if not isinstance(args, dict):
            args = {}
        clean_plan.append({"tool": tool, "args": args})
    return {
        "plan": clean_plan,
        "why": parsed.get("why", ""),
        "confidence": float(parsed.get("confidence", 0.0)) if str(parsed.get("confidence", "")).replace('.', '', 1).isdigit() else 0.0
    }

def run_agentic_flow_v2(user_message: str) -> Dict[str, Any]:
    """
    Execute a multi-step plan from Agent 1, collect results, then have Agent 2 answer.
    - Executes steps sequentially with simple placeholder resolution between steps.
    - Attaches all tool outputs as supplemental context for the final answerer.
    """
    decision = route_tool_plan(user_message)
    plan: List[Dict[str, Any]] = decision.get("plan", [])
    results: List[Dict[str, Any]] = []
    context: Dict[str, Any] = {}  # exposes keys by tool name and "last"

    for step in plan:
        tool_name = step["tool"]
        raw_args = step.get("args", {})
        args = _resolve_args(raw_args, {**context, "last": context.get("last")})
        try:
            payload = TOOL_REGISTRY[tool_name](args)
        except Exception as e:
            payload = {"error": f"Tool '{tool_name}' failed: {e}", "args": args}
        results.append({"tool": tool_name, "args": args, "output": payload})
        # update context
        context[tool_name] = payload
        context["last"] = payload

    supplemental = ""
    if results:
        supplemental = "\n\n[Supplemental data extracted via tools]\n" + json.dumps(
            {"plan": plan, "results": results},
            ensure_ascii=False, indent=2
        )

    answerer_user_prompt = f"""\
Answer the next user's question. Mentor them and be specific. If supplemental data is provided, use it to tailor the answer; otherwise proceed normally.

User question:
\"\"\"{user_message}\"\"\"
{supplemental}
"""
    final_text = ask_model(Question_instructions, answerer_user_prompt, max_tokens=900, temperature=0.7)

    return {
        "plan": plan,
        "results": results,
        "final_answer": final_text,
        "why": decision.get("why", ""),
        "confidence": decision.get("confidence", 0.0)
    }

# -----------------------------------------------------
# Agentic orchestration: Router (Agent 1) + Answerer (Agent 2)
@app.post("/prompt")
def run_prompt(body: PromptIn):
    sql = nl_to_sql(body.prompt, body.table_hint)

    low = sql.lower().lstrip()
    if not (low.startswith("select") or low.startswith("with")):
        # enforce read-only contract: run only SELECT/WITH
        raise HTTPException(status_code=400, detail="Generated query is not read-only (SELECT/WITH).")

    try:
        with get_conn() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
            # session-level safety
            cur.execute("SET LOCAL default_transaction_read_only = on;")
            cur.execute("SET LOCAL statement_timeout = 5000;")  # 5s
            cur.execute(sql)
            rows = cur.fetchall()
        return {"sql": sql, "rows": rows}
    except Exception as e:
        # return error + sql for debugging
        raise HTTPException(status_code=500, detail={"error": str(e), "sql": sql})


# -----------------[ Local DB toolkit (decoupled from bd.py) ]-----------------
# Baza corectă (service name din Docker). Poți suprascrie cu .env: PG_API_BASE=http://skepya-api:8080
PG_API_BASE = os.getenv("PG_API_BASE", "http://skepya-api:8080")

# helper: escape pentru string literal SQL
def _sqlesc(s: str) -> str:
    return s.replace("'", "''")

# helper: parse ISO (acceptă '2025-10-01' sau '2025-10-01T00:00:00Z')
def _date_iso(dt: Optional[str]) -> Optional[str]:
    if not dt:
        return None
    try:
        # păstrăm doar data (DATE) conform coloanei tale transaction_date (de tip DATE)
        return datetime.fromisoformat(dt.replace("Z", "+00:00")).date().isoformat()
    except Exception:
        return None

def _pg_query(sql: str):
    # încearcă în ordine câteva baze (ENV > service name > localhost)
    bases = [
        PG_API_BASE,
        "http://skepya-api:8080",
        "http://localhost:8080",
    ]
    last_err = None
    for base in bases:
        try:
            r = requests.post(f"{base}/query", json={"sql": sql}, timeout=10)
            if r.status_code == 200:
                return r.json()
            last_err = f"{r.status_code} {r.text}"
        except Exception as e:
            last_err = str(e)
    raise HTTPException(status_code=500, detail={"error": last_err, "sql": sql})

# ----------------- MODELE INPUT -----------------

class TxRequest(BaseModel):
    client_id: int
    date_from: Optional[str] = None   # ISO Date, ex: "2025-08-01"
    date_to:   Optional[str] = None   # ISO Date, ex: "2025-10-31" (inclusiv)
    category:  Optional[str] = None   # filtrare după categorie (parțial, ILIKE)
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    limit: int = 100

class RiskRequest(BaseModel):
    client_id: int

# ----------------- SQL BUILDERS -----------------

def build_sql_client_transactions(p: TxRequest) -> str:
    # Coloane reale: public.transactions(client_id, transaction_date, amount, category)
    where = [f"t.client_id = {int(p.client_id)}"]

    df = _date_iso(p.date_from)
    dt = _date_iso(p.date_to)
    if df:
        where.append(f"t.transaction_date >= '{_sqlesc(df)}'")
    if dt:
        where.append(f"t.transaction_date <= '{_sqlesc(dt)}'")  # inclusiv

    if p.category:
        where.append(f"t.category ILIKE '%{_sqlesc(p.category)}%'")

    if p.min_amount is not None:
        where.append(f"t.amount >= {float(p.min_amount)}")

    if p.max_amount is not None:
        where.append(f"t.amount <= {float(p.max_amount)}")

    where_sql = " AND ".join(where)

    return f"""
    SELECT
      t.id,
      t.transaction_date,
      t.amount,
      t.category
    FROM public.transactions t
    WHERE {where_sql}
    ORDER BY t.transaction_date DESC, t.id DESC
    LIMIT {int(p.limit)}
    """.strip()

def build_sql_client_risk(client_id: int) -> str:
    # Coloane reale: public.clients(id, name, risk_rating, ...)
    cid = int(client_id)
    return f"""
    SELECT
      c.id AS client_id,
      c.name,
      c.risk_rating
    FROM public.clients c
    WHERE c.id = {cid}
    LIMIT 1
    """.strip()

@app.post("/fn/transactions")
def fn_transactions(body: TxRequest):
    sql = build_sql_client_transactions(body)
    try:
        rows = _pg_query(sql)
        return {"sql": sql, "rows": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e), "sql": sql})

@app.post("/fn/risk")
def fn_risk(body: RiskRequest):
    sql = build_sql_client_risk(body.client_id)
    try:
        rows = _pg_query(sql)
        return {"sql": sql, "rows": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e), "sql": sql})

def normalize_risk(value: Optional[str]) -> str:
    """
    Normalize various risk labels to {usor, mediu, ridicat}.
    Accepts common English synonyms too.
    """
    if not value:
        return "mediu"
    v = str(value).strip().lower()
    mapping = {
        "usor": "usor", "ușor": "usor", "low": "usor", "conservative": "usor",
        "mediu": "mediu", "medium": "mediu", "balanced": "mediu", "moderate": "mediu",
        "ridicat": "ridicat", "înalt": "ridicat", "high": "ridicat", "aggressive": "ridicat", "growth": "ridicat"
    }
    return mapping.get(v, "mediu")
# -----------------------------------------------------

def route_tool_decision(user_message: str) -> Dict[str, Any]:
    """
    Agent 1: decides whether a function call is needed and with what args.
    Returns a dict: {"tool": "...", "args": {...}, "why": "...", "confidence": float}
    """
    router_user_prompt = f'''
You are a tool-routing planner.

Return STRICT JSON only, no prose, matching this schema:
{{
  "tool": "database_info" | "transaction_history" | "investment_packages" | "skip",
  "args": {{ }},
  "why": "short reason",
  "confidence": 0.0
}}

The decision rule:
- If the user's question can be properly answered without up-to-date client data, choose "skip".
- Choose "database_info" to fetch client profile / KYC needed to tailor advice.
- Choose "transaction_history" if you need recent activity/holdings to answer precisely.
- Choose "investment_packages" if the user is asking what packages exist or wants product details.
- When choosing investment packages, if the client's risk category is known or provided by the user, include args like {"risk": "usor|mediu|ridicat"} to align with it.

User message:
"""{user_message}"""
    '''.strip()

    raw = ask_model(Reasoning_instructions, router_user_prompt, max_tokens=300, temperature=0.0)
    parsed = parse_router_json(raw) or {"tool": "skip", "args": {}, "why": "fallback", "confidence": 0.0}
    # Validate keys
    tool = parsed.get("tool", "skip")
    args = parsed.get("args", {}) if isinstance(parsed.get("args", {}), dict) else {}
    why = parsed.get("why", "")
    conf = float(parsed.get("confidence", 0.0)) if str(parsed.get("confidence", "")).replace('.', '', 1).isdigit() else 0.0
    return {"tool": tool, "args": args, "why": why, "confidence": conf}

def run_agentic_flow(user_message: str) -> Dict[str, Any]:
    """
    Orchestrates the two-agent flow. Agent 1 picks a tool (or skip),
    its output (if any) is appended as context for Agent 2 to craft the final answer.
    """
    decision = route_tool_decision(user_message)
    tool_name = decision["tool"]
    tool_args = decision["args"]

    tool_payload: Optional[Dict[str, Any]] = None
    if tool_name in TOOL_REGISTRY:
        try:
            tool_payload = TOOL_REGISTRY[tool_name](tool_args)
        except Exception as e:
            tool_payload = {"error": f"Tool '{tool_name}' failed: {e}"}
    else:
        tool_payload = {"warning": f"Unknown tool '{tool_name}', skipping."}

    # Prepare the final user message for Agent 2 (Answerer)
    supplemental = ""
    if tool_name != "skip" and tool_payload is not None:
        supplemental = "\n\n[Supplemental data extracted via tool-call]\n" + json.dumps(tool_payload, ensure_ascii=False, indent=2)

    answerer_user_prompt = f"""\
Answer the next user's question. Mentor them and be specific. If supplemental data is provided, use it to tailor the answer, otherwise proceed normally.

User question:
\"\"\"{user_message}\"\"\"
{supplemental}
"""
    final_text = ask_model(Question_instructions, answerer_user_prompt, max_tokens=700, temperature=0.7)

    return {
        "decision": decision,
        "tool_output": tool_payload,
        "final_answer": final_text
    }
# -----------------------------------------------------
# Funcția care apelează modelul Claude
# -----------------------------------------------------

def ask_claude(message: str) -> str:
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 500,
        "temperature": 0.7,
        "messages": [
            {"role": "user", "content": message}
        ],
        "system": [
        {
            "type": "text",
            "text": Question_instructions
        }
    ]
    }

    try:
        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps(body)
        )
        result = json.loads(response["body"].read())
        reply = result["content"][0]["text"].strip()
        return reply
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bedrock/Claude error: {str(e)}")
# -----------------------------------------------------
# Endpoint de chat
# -----------------------------------------------------

@app.post("/chat")
def chat_endpoint(input: ChatInput):
    reply = ask_claude(input.message)
    return {"response": reply}
# -----------------------------------------------------
# Agentic chat endpoint (Router + Answerer)
# -----------------------------------------------------

@app.post("/agent_chat")
def agent_chat(input: ChatInput):
    """
    Runs the two-agent orchestration:
    - Agent 1: decides whether to call a tool (or skip).
    - Agent 2: crafts the final response (always).
    Returns both the decision and the final answer for transparency.
    """
    result = run_agentic_flow(input.message)
    return {
        "response": result["final_answer"],
        "tool_decision": result["decision"],
        "tool_output_preview": result["tool_output"]
    }
# -----------------------------------------------------
# Agentic chat endpoint v2 (Planner with multi-step plan + Answerer)
# -----------------------------------------------------

# -----------------[ DB endpoints migrated from bd.py ]-----------------

@app.post("/agent_chat_v2")
def agent_chat_v2(input: ChatInput):
    """
    Runs the enhanced orchestration:
    - Agent 1 (planner): returns a multi-step plan (0..3 steps).
    - Executor: runs each tool with placeholder resolution between steps.
    - Agent 2 (answerer): crafts the final response using all collected data.
    Returns the plan, the per-step results, and the final answer.
    """
    result = run_agentic_flow_v2(input.message)
    return {
        "response": result["final_answer"],
        "tool_plan": result["plan"],
        "tool_results": result["results"],
        "why": result["why"],
        "confidence": result["confidence"]
    }

def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("POSTGRES_DB", "skepyadb"),
            user=os.getenv("POSTGRES_USER", "admin"),
            password=os.getenv("POSTGRES_PASSWORD", "Paroladb"),
            host=os.getenv("POSTGRES_HOST", "host.docker.internal"),  # schimbat aici
            port=os.getenv("POSTGRES_PORT", "5432"),
        )
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")


@app.get("/investments")
def get_investments():
    """
    Returnează lista investițiilor din tabelul 'invesments'
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, investment, risk_score, description
            FROM invesments
            ORDER BY id ASC;
        """)

        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        results = [dict(zip(columns, row)) for row in rows]

        cur.close()
        conn.close()

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")

@app.get("/top-clients")
def get_top_clients():
    """
    Returnează clienții cu cele mai multe tranzacții.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT c.id, c.name, COUNT(t.id) AS transaction_count
            FROM clients c
            LEFT JOIN transactions t ON t.client_id = c.id
            GROUP BY c.id, c.name
            ORDER BY transaction_count DESC
            LIMIT 10;
        """)

        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        results = [dict(zip(columns, row)) for row in rows]

        cur.close()
        conn.close()

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")

@app.get("/transactions")
def get_all_transactions():
    """
    Returnează toate tranzacțiile din baza de date.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, client_id, transaction_date, amount, category
            FROM transactions
            ORDER BY transaction_date DESC;
        """)

        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        results = [dict(zip(columns, row)) for row in rows]

        cur.close()
        conn.close()

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")

@app.get("/clients")
def get_clients():
    """
    Returnează toți clienții din baza de date.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM clients;")
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        results = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {e}")