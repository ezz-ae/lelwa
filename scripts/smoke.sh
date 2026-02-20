#!/usr/bin/env bash
set -euo pipefail

API_BASE=${API_BASE:-http://127.0.0.1:8000}

curl -sf "$API_BASE/health" | python3 -m json.tool >/dev/null

curl -sf -X POST "$API_BASE/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test lead: buy 1BR Dubai Marina budget 1.4M","session_id":"test"}' \
  | python3 -m json.tool >/dev/null

echo "Done"
