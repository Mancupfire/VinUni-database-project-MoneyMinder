# Testing Guide

## Quick API smoke (curl)
1) Health:
```bash
curl http://localhost:5000/api/health
```
2) Login (demo data):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"Demo@2024"}'
```
3) Authenticated accounts list:
```bash
TOKEN=<paste_token>
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/accounts
```

## New analytics endpoint
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/analytics/rolling-expense
```

## Browser/UI smoke
- Frontend at `http://localhost:8080` (via `run.sh`).
- Verify login, add transaction (rejects negative amounts), budgets, recurring, and analytics pages load.

## Optional automated baseline
- Add `pytest` + `requests` to venv; create `tests/test_smoke.py` hitting health/login/accounts.
- Run with: `pytest -q`.
