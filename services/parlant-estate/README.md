# Pathway Parlant Estate Service

Private localhost service for the estate-planning chat. The Next.js site keeps the browser-facing Vercel AI SDK stream shape; this service owns the guarded estate-planning knowledge, handoff capture, and Parlant dependency boundary.

Run locally:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ESTATE_ROOT=/home/ubuntu/repos/estate-planning .venv/bin/uvicorn app:app --host 127.0.0.1 --port 8800
```

Native Parlant NLP routing:

- The public Next.js chat route can answer simple turns with `AI_SDK_FAST_MODEL` and the generated site graph before escalating to this service.
- `PARLANT_NLP_SERVICE=auto` prefers Emcie when `EMCIE_API_KEY` is set, otherwise uses OpenAI.
- For local OpenAI runs, `PARLANT_OPENAI_SCHEMATIC_MODEL=gpt-4.1-nano` keeps Parlant's schema-heavy internal calls on a tested stable nano model.
- `PARLANT_NLP_SERVICE=openai` uses Parlant's built-in OpenAI service and model routing directly.
- `PARLANT_NLP_SERVICE=emcie` requires `EMCIE_API_KEY`.
- `EMCIE_MODEL_TIER=bison` can be used for higher-assurance, legal/tax-adjacent conversations.

Health:

```bash
curl http://127.0.0.1:8800/health
```
