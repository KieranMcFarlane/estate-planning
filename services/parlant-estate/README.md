# Pathway Parlant Estate Service

Private localhost service for the estate-planning chat. The Next.js site keeps the browser-facing Vercel AI SDK stream shape; this service owns the guarded estate-planning knowledge, handoff capture, and Parlant dependency boundary.

Run locally:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ESTATE_ROOT=/home/ubuntu/repos/estate-planning .venv/bin/uvicorn app:app --host 127.0.0.1 --port 8800
```

Health:

```bash
curl http://127.0.0.1:8800/health
```
