# Persistent Websites Deployment

Target host: Ubuntu server with repos checked out under `/home/ubuntu/repos`.

## Port Map

| Hostname | Local target |
| --- | --- |
| `estate.nakanodigital.com` | `127.0.0.1:3006` |
| `signal.nakanodigital.com` | `127.0.0.1:3005` |
| `yellowpanther.nakanodigital.com` | `127.0.0.1:3217` |
| `fractional.nakanodigital.com` | `127.0.0.1:3008` |
| `hands.nakanodigital.com` | `127.0.0.1:3009` |
| `admin.nakanodigital.com` | `127.0.0.1:4100` |
| `estate-admin.nakanodigital.com` | `127.0.0.1:4101` |

Signal Noise FalkorDB browser is intentionally moved to `3036` so it does not collide with the estate app on `3006`.

## Build Apps

Run these on the server after pulling the repos and filling server-side env files:

```bash
cd /home/ubuntu/repos/estate-planning
npm ci
npm run build
python3 -m venv services/parlant-estate/.venv
services/parlant-estate/.venv/bin/pip install -r services/parlant-estate/requirements.txt
docker compose up -d
npm run db:chat:migrate

cd /home/ubuntu/repos/panther_chat
npm ci
npm run build

cd /home/ubuntu/repos/panther_chat/apps/signal-noise-app
npm ci
npm run build
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements-runtime.txt
python3 -m venv services/signal-graph/.venv
services/signal-graph/.venv/bin/pip install -r services/signal-graph/requirements.txt
FALKORDB_BROWSER_PORT=3036 docker compose -f docker-compose.graphiti.yml up -d falkordb

cd /home/ubuntu/repos/fractional_delivery
npm ci
npm run build

cd /home/ubuntu/repos/made_with_these_hands
npm ci
npm run build

cd /home/ubuntu/repos/nakano-rebuild
npm ci
npm run validate:manifests
```

## Install Services

```bash
sudo cp /home/ubuntu/repos/estate-planning/deploy/estate-planning.service /etc/systemd/system/
sudo cp /home/ubuntu/repos/estate-planning/deploy/parlant-estate.service /etc/systemd/system/
sudo cp /home/ubuntu/repos/panther_chat/apps/signal-noise-app/deploy/signal-noise-web.service /etc/systemd/system/
sudo cp /home/ubuntu/repos/panther_chat/apps/signal-noise-app/deploy/signal-noise-backend.service /etc/systemd/system/
sudo cp /home/ubuntu/repos/panther_chat/apps/signal-noise-app/deploy/signal-noise-worker.service /etc/systemd/system/
sudo cp /home/ubuntu/repos/panther_chat/apps/signal-noise-app/deploy/signal-graph.service /etc/systemd/system/
sudo cp /home/ubuntu/repos/panther_chat/deploy/yellow-panther.service /etc/systemd/system/
sudo cp /home/ubuntu/repos/fractional_delivery/deploy/fractional-delivery.service /etc/systemd/system/
sudo cp /home/ubuntu/repos/made_with_these_hands/deploy/made-with-these-hands.service /etc/systemd/system/
sudo cp /home/ubuntu/repos/nakano-rebuild/deploy/nakano-admin.service /etc/systemd/system/
sudo cp /home/ubuntu/repos/nakano-rebuild/deploy/nakano-estate-admin.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now \
  estate-planning parlant-estate \
  signal-noise-web signal-noise-backend signal-noise-worker signal-graph \
  yellow-panther fractional-delivery made-with-these-hands \
  nakano-admin nakano-estate-admin
```

## Install Caddy Routes

```bash
sudo cp /home/ubuntu/repos/estate-planning/deploy/Caddyfile /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Verify

```bash
curl -fsS http://127.0.0.1:3006 >/dev/null
curl -fsS http://127.0.0.1:8800/health >/dev/null
curl -fsS http://127.0.0.1:3005/api/health >/dev/null
curl -fsS http://127.0.0.1:8002/health >/dev/null
curl -fsS http://127.0.0.1:8810/health >/dev/null
curl -fsS http://127.0.0.1:3217 >/dev/null
curl -fsS http://127.0.0.1:3008 >/dev/null
curl -fsS http://127.0.0.1:3009 >/dev/null
curl -fsS http://127.0.0.1:4100/health >/dev/null
curl -fsS http://127.0.0.1:4101/health >/dev/null
```

If a service fails, inspect it with:

```bash
systemctl status <service>
journalctl -u <service> -n 100 --no-pager
```
