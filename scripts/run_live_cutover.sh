#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SECRETS_FILE="${SECRETS_FILE:-/mnt/l/1. SUPABASE.txt}"
LIVE_ENV_FILE="${REPO_DIR}/scripts/paypal_live.env"

if [[ ! -f "$LIVE_ENV_FILE" ]]; then
  echo "Missing $LIVE_ENV_FILE"
  echo "Create it from scripts/paypal_live.env.example"
  exit 1
fi

if [[ ! -f "$SECRETS_FILE" ]]; then
  echo "Missing SECRETS_FILE: $SECRETS_FILE"
  echo "Set SECRETS_FILE=/path/to/secrets.txt then rerun."
  exit 1
fi

set -a
source "$LIVE_ENV_FILE"
set +a

python3 "$REPO_DIR/scripts/cutover_paypal_live.py" \
  --repo-dir "$REPO_DIR" \
  --secrets-file "$SECRETS_FILE" \
  --paypal-client-id-live "${PAYPAL_CLIENT_ID_LIVE:-}" \
  --paypal-secret-live "${PAYPAL_SECRET_LIVE:-}" \
  --paypal-webhook-id-live "${PAYPAL_WEBHOOK_ID_LIVE:-}"

SEPAY_SECRET="$({
python3 - "$SECRETS_FILE" <<'PY'
import re, sys
p=sys.argv[1]
s=open(p,'r',encoding='utf-8',errors='ignore').read()
for pat in [
    r'SEPAY_WEBHOOK_SECRET \(hoặc API key\):\s*(\S+)',
    r'SEPAY_WEBHOOK_SECRET\s*[:=]\s*(\S+)',
]:
    m=re.search(pat,s,re.I)
    if m:
        print(m.group(1))
        raise SystemExit(0)
print('')
PY
} )"

ADMIN_KEY="$({
python3 - "$REPO_DIR/.env.local" <<'PY'
import re, sys
p=sys.argv[1]
try:
    s=open(p,'r',encoding='utf-8',errors='ignore').read()
except FileNotFoundError:
    print('')
    raise SystemExit(0)
m=re.search(r'^ADMIN_API_KEY=(.+)$', s, re.M)
print(m.group(1).strip().strip('"').strip("'") if m else '')
PY
} )"

if [[ -z "$SEPAY_SECRET" ]]; then
  echo "Missing Sepay webhook secret (SEPAY_WEBHOOK_SECRET)."
  exit 1
fi

if [[ -z "$ADMIN_KEY" ]]; then
  echo "Missing ADMIN_API_KEY in $REPO_DIR/.env.local"
  exit 1
fi

python3 "$REPO_DIR/scripts/smoke_test_production_payments.py" \
  --base-url https://workflowstore.vercel.app \
  --secrets-file "$SECRETS_FILE" \
  --sepay-webhook-secret "$SEPAY_SECRET" \
  --admin-api-key "$ADMIN_KEY" \
  --paypal-client-id "${PAYPAL_CLIENT_ID_LIVE:-}" \
  --paypal-secret "${PAYPAL_SECRET_LIVE:-}" \
  --paypal-mode-expected live \
  --cleanup
