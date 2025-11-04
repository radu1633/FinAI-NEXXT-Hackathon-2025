from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from psycopg2.extras import RealDictCursor
import psycopg2
import os
import boto3

app = FastAPI()
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware

@app.get("/health")
def health():
    return {"status": "ok"}

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # nu "*" — pune explicit frontend-ul
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "us.anthropic.claude-sonnet-4-20250514-v1:0")

bedrock = boto3.client("bedrock", region_name=AWS_REGION)

def get_conn():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB", "skepyadb"),
        user=os.getenv("POSTGRES_USER", "admin"),
        password=os.getenv("POSTGRES_PASSWORD", "Paroladb"),
        host=os.getenv("POSTGRES_HOST", "postgres"),
        port=os.getenv("POSTGRES_PORT", "5432"),
    )

class PromptIn(BaseModel):
    prompt: str
    table_hint: Optional[str] = None  # opțional: sugerezi tabela (ex: "cv")

SYSTEM_INSTRUCTIONS = """You are a careful SQL writer for PostgreSQL.
Return ONLY a single SQL statement that is READ-ONLY (must start with SELECT).
No comments, no markdown, no explanations, just the SQL.
Tables live in the 'public' schema. Use double quotes only if needed.
If the request cannot be answered with a single SELECT, produce:
SELECT 'unsupported' AS error;
"""

def nl_to_sql(prompt: str, table_hint: Optional[str]) -> str:
    user_text = prompt
    if table_hint:
        user_text += f"\n\nHint: the main table is '{table_hint}'."

    resp = bedrock.converse(
        modelId=MODEL_ID,
        messages=[{"role": "user", "content": [{"text": user_text}]}],
        system=[{"text": SYSTEM_INSTRUCTIONS}],
        inferenceConfig={"temperature": 0}
    )

    parts = resp["output"]["message"]["content"]
    sql = "\n".join(p.get("text", "") for p in parts if "text" in p).strip()

    if not sql.lower().lstrip().startswith("select"):
        sql = "SELECT 'unsupported' AS error;"
    return sql

@app.post("/prompt")
def run_prompt(body: PromptIn):
    sql = nl_to_sql(body.prompt, body.table_hint)

    if not sql.lower().lstrip().startswith("select"):
        raise HTTPException(status_code=400, detail="Generated query is not a SELECT.")

    try:
        with get_conn() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql)
            rows = cur.fetchall()
        return {"sql": sql, "rows": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e), "sql": sql})