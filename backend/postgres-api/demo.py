# demo.py — Bedrock Tool Use + doar /query (schema corectă + toolResult în mesaje)
import os
import requests
import boto3
import json

REGION   = os.getenv("AWS_REGION", "us-west-2")
MODEL_ID = os.getenv("BEDROCK_MODEL_ID")
API_BASE = os.getenv("PG_API_BASE", "http://localhost:8080")  # serverul tău Flask cu /query

# --- Tools în schema cerută de Bedrock (toolSpec) ---
tools = [
  {
    "toolSpec": {
      "name": "list_tables",
      "description": "Listează tabelele din Postgres folosind SQL pe /query.",
      "inputSchema": {
        "json": {
          "type": "object",
          "properties": {},
          "additionalProperties": False
        }
      }
    }
  },
  {
    "toolSpec": {
      "name": "describe_table",
      "description": "Afișează coloanele (nume, tip, nullable) pentru o anumită tabelă.",
      "inputSchema": {
        "json": {
          "type": "object",
          "properties": {
            "table": { "type": "string", "description": "Numele tabelei din schema public." }
          },
          "required": ["table"],
          "additionalProperties": False
        }
      }
    }
  },
  {
    "toolSpec": {
      "name": "execute_query",
      "description": "Execută un SQL read-only pe Postgres (folosește /query). Returnează max 100 rânduri.",
      "inputSchema": {
        "json": {
          "type": "object",
          "properties": {
            "sql": { "type": "string", "description": "Doar SELECT/EXPLAIN. LIMIT <= 100." }
          },
          "required": ["sql"],
          "additionalProperties": False
        }
      }
    }
  }
]

SYSTEM_PROMPT = (
  "Ești un asistent care poate folosi tool-uri pentru a interoga o bază de date Postgres. "
  "Folosește DOAR SELECT/EXPLAIN (read-only). Dacă lipsește LIMIT, adaugă LIMIT 100. "
  "Când primești rezultate de forma {'rows': [...]}, randă-le ca tabel Markdown cu antete din cheile obiectelor, "
  "păstrând ordinea cheilor. Dacă sunt 0 rânduri, spune 'Nicio înregistrare'. "
  "Nu executa INSERT/UPDATE/DELETE/DDL."
)

br = boto3.client("bedrock-runtime", region_name=REGION)

# -------- helperi ce FOLOSESC DOAR /query ----------
def _post_query(sql: str):
  r = requests.post(f"{API_BASE}/query", json={"sql": sql}, timeout=30)
  r.raise_for_status()
  return r.json()

def call_list_tables():
  sql = """
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
    LIMIT 100;
  """
  data = _post_query(sql)
  tables = [row.get("table_name") for row in data] if isinstance(data, list) else []
  return {"tables": tables}

def call_describe_table(table: str):
  # simplu (atenție: aici nu interpolăm inputul în SQL real în producție; folosește parametri!)
  table = table.strip()
  sql = f"""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = '{table}'
    ORDER BY ordinal_position;
  """
  rows = _post_query(sql)
  return {"rows": rows}

def call_execute_query(sql: str):
  s = (sql or "").strip().lower()
  if not (s.startswith("select") or s.startswith("explain")):
    return {"error": "Allowed only SELECT/EXPLAIN."}
  if "limit" not in s:
    sql = sql.rstrip(" ;") + " LIMIT 100"
  rows = _post_query(sql)
  return {"rows": rows}

def handle_tool_use(tool_use):
  name = tool_use["name"]
  args = tool_use.get("input") or {}
  print("[TOOL USE]", name, args)

  if name == "list_tables":
    data = call_list_tables()                       # dict
  elif name == "describe_table":
    data = call_describe_table(args.get("table",""))# dict {"rows":[...]}
  elif name == "execute_query":
    data = call_execute_query(args.get("sql",""))   # dict {"rows":[...]} sau {"error":...}
  else:
    data = {"error": f"Unsupported tool: {name}"}

  # Bedrock cere obiect JSON în toolResult.content.json (nu listă)
  payload = data if isinstance(data, dict) else {"rows": data}
  print("[TOOL RES]", json.dumps(payload)[:600])

  return {
    "toolUseId": tool_use["toolUseId"],
    "content": [{"json": payload}]   # ✅ mereu obiect JSON
  }

# -------- bucla corectă de Tool Use (FĂRĂ param 'toolResults') ----------
def converse_with_tools(user_text: str):
  messages = [{"role": "user", "content": [{"text": user_text}]}]

  response = br.converse(
    modelId=MODEL_ID,
    system=[{"text": SYSTEM_PROMPT}],
    messages=messages,
    toolConfig={"tools": tools},
  )

  while True:
    out = response.get("output", {})
    msg = out.get("message") or {}
    content = msg.get("content", [])

    tool_uses = [c["toolUse"] for c in content if "toolUse" in c]
    if not tool_uses:
      final_texts = [c["text"] for c in content if "text" in c]
      return "\n".join(final_texts).strip()

    # 1) executăm tool-urile
    results = [handle_tool_use(tu) for tu in tool_uses]

    # 2) actualizăm istoricul:
    #    a) adăugăm mesajul assistant (cel care conține toolUse)
    messages.append(msg)
    #    b) adăugăm mesajul user care conține toolResult-urile (UNU sau MAI MULTE)
    messages.append({
      "role": "user",
      "content": [{"toolResult": r} for r in results]
    })

    # 3) cerem continuarea modelului
    response = br.converse(
      modelId=MODEL_ID,
      system=[{"text": SYSTEM_PROMPT}],
      messages=messages,
      toolConfig={"tools": tools},
    )

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
        print(converse_with_tools(prompt))
    else:
        # fallback la mod interactiv
        try:
            while True:
                q = input("\n📝 Prompt > ").strip()
                if not q:
                    continue
                if q.lower() in {"exit", "quit"}:
                    break
                print("\n" + converse_with_tools(q))
        except KeyboardInterrupt:
            pass

