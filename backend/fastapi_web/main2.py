from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import boto3
import json
import psycopg2
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# -----------------------------------------------------
# FastAPI setup
# -----------------------------------------------------
app = FastAPI()
load_dotenv()

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
AWS_REGION = "us-west-2"
MODEL_ID = "global.anthropic.claude-sonnet-4-20250514-v1:0"

bedrock = boto3.client(
    'bedrock-runtime',
    region_name='us-west-2'
)

# -----------------------------------------------------
# Pydantic model pentru input
# -----------------------------------------------------
class ChatInput(BaseModel):
    message: str

# -----------------------------------------------------
# Funcția care apelează modelul Claude
# -----------------------------------------------------
def ask_claude(message: str) -> str:
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 500,
        "temperature": 0.7,
        "messages": [{"role": "user", "content": message}],
    }

    try:
        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps(body)
        )
        result = json.loads(response["body"].read())
        return result["content"][0]["text"].strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bedrock/Claude error: {str(e)}")

# -----------------------------------------------------
# PostgreSQL connection helper
# -----------------------------------------------------
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

# -----------------------------------------------------
# Endpoint de chat
# -----------------------------------------------------
@app.post("/chat")
def chat_endpoint(input: ChatInput):
    reply = ask_claude(input.message)
    return {"response": reply}

# -----------------------------------------------------
# Endpoint GET /investments
# -----------------------------------------------------
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