FROM python:3.12-slim

WORKDIR /app

COPY server.py .

RUN pip install flask psycopg2-binary

EXPOSE 8080

CMD ["python", "server.py"]

