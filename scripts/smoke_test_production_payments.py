#!/usr/bin/env python3
import argparse
import base64
from datetime import UTC, datetime
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional


def parse_kv_file(path: str) -> Dict[str, str]:
    if not path or not os.path.exists(path):
        return {}
    data: Dict[str, str] = {}
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue

            m = re.match(r"^-\s*([A-Z0-9_\(\) /-]+):\s*(.+)$", line)
            if m:
                data[m.group(1).strip()] = m.group(2).strip()

            m2 = re.match(r"^([A-Z0-9_]+)=(.*)$", line)
            if m2:
                data[m2.group(1)] = m2.group(2)
    return data


def get_first(config: Dict[str, str], *keys: str) -> Optional[str]:
    for k in keys:
        v = config.get(k)
        if v and str(v).strip():
            return str(v).strip().strip('"').strip("'")
    return None


def load_value(args_val: str, env_key: str, file_data: Dict[str, str], *file_keys: str) -> Optional[str]:
    return args_val or os.getenv(env_key) or get_first(file_data, *file_keys)


def http_post_json(url: str, payload: Dict[str, Any], headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=h, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            body = r.read().decode()
            return {"status": r.status, "json": json.loads(body), "raw": body}
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {"raw": body}
        return {"status": e.code, "json": parsed, "raw": body}


def http_get_json(url: str) -> Dict[str, Any]:
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            body = r.read().decode()
            return {"status": r.status, "json": json.loads(body), "raw": body}
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {"raw": body}
        return {"status": e.code, "json": parsed, "raw": body}


def paypal_live_oauth(client_id: str, secret: str) -> str:
    basic = base64.b64encode(f"{client_id}:{secret}".encode()).decode()
    data = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode()
    req = urllib.request.Request(
        "https://api-m.paypal.com/v1/oauth2/token",
        data=data,
        headers={
            "Authorization": f"Basic {basic}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        body = json.loads(r.read().decode())
        return str(body["access_token"])


def supabase_rest_get(base: str, service_key: str, path_q: str) -> Any:
    req = urllib.request.Request(
        f"{base}/rest/v1/{path_q}",
        headers={"apikey": service_key, "Authorization": f"Bearer {service_key}"},
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode() or "[]")


def supabase_rest_delete(base: str, service_key: str, path_q: str) -> Any:
    req = urllib.request.Request(
        f"{base}/rest/v1/{path_q}",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Prefer": "return=representation",
        },
        method="DELETE",
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode() or "[]")


def cleanup_smoke_orders(supabase_url: str, service_key: str, email_prefix: str) -> Dict[str, Any]:
    rows = supabase_rest_get(
        supabase_url,
        service_key,
        f"orders?select=id,email&email=like.{urllib.parse.quote(email_prefix)}*",
    )
    ids = [r["id"] for r in rows]
    result = {"found": len(ids), "ids": ids}
    if not ids:
        return result

    in_list = ",".join(ids)
    dt = supabase_rest_delete(supabase_url, service_key, f"download_tokens?order_id=in.({in_list})")
    pays = supabase_rest_delete(supabase_url, service_key, f"payments?order_id=in.({in_list})")
    items = supabase_rest_delete(supabase_url, service_key, f"order_items?order_id=in.({in_list})")
    orders = supabase_rest_delete(supabase_url, service_key, f"orders?id=in.({in_list})")
    result["deleted_counts"] = {
        "download_tokens": len(dt),
        "payments": len(pays),
        "order_items": len(items),
        "orders": len(orders),
    }
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke test WorkflowStore production payments (sepay + paypal).")
    parser.add_argument("--base-url", default="https://workflowstore.vercel.app")
    parser.add_argument("--secrets-file", default="")
    parser.add_argument("--supabase-url", default="")
    parser.add_argument("--supabase-service-role-key", default="")
    parser.add_argument("--sepay-webhook-secret", default="")
    parser.add_argument("--admin-api-key", default="")
    parser.add_argument("--paypal-client-id", default="")
    parser.add_argument("--paypal-secret", default="")
    parser.add_argument("--paypal-mode-expected", default="live")
    parser.add_argument("--cleanup", action="store_true")
    parser.add_argument("--email-prefix", default="smoke+")
    args = parser.parse_args()

    file_data = parse_kv_file(args.secrets_file) if args.secrets_file else {}

    supabase_url = load_value(args.supabase_url, "SUPABASE_URL", file_data, "SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
    service_key = load_value(
        args.supabase_service_role_key,
        "SUPABASE_SERVICE_ROLE_KEY",
        file_data,
        "SUPABASE_SERVICE_ROLE_KEY",
    )
    sepay_secret = load_value(
        args.sepay_webhook_secret,
        "SEPAY_WEBHOOK_SECRET",
        file_data,
        "SEPAY_WEBHOOK_SECRET",
        "SEPAY_WEBHOOK_SECRET (hoặc API key)",
    )
    admin_key = load_value(args.admin_api_key, "ADMIN_API_KEY", file_data, "ADMIN_API_KEY")
    paypal_client_id = load_value(args.paypal_client_id, "PAYPAL_CLIENT_ID", file_data, "PAYPAL_CLIENT_ID")
    paypal_secret = load_value(args.paypal_secret, "PAYPAL_SECRET", file_data, "PAYPAL_SECRET")

    missing = []
    for k, v in [
        ("SUPABASE_URL", supabase_url),
        ("SUPABASE_SERVICE_ROLE_KEY", service_key),
        ("SEPAY_WEBHOOK_SECRET", sepay_secret),
        ("ADMIN_API_KEY", admin_key),
        ("PAYPAL_CLIENT_ID", paypal_client_id),
        ("PAYPAL_SECRET", paypal_secret),
    ]:
        if not v:
            missing.append(k)
    if missing:
        print(json.dumps({"ok": False, "error": f"Missing required values: {', '.join(missing)}"}, ensure_ascii=False, indent=2))
        return 1

    base = args.base_url.rstrip("/")
    ts = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
    report: Dict[str, Any] = {
        "timestamp_utc": datetime.now(UTC).isoformat(),
        "base": base,
        "tests": {},
    }

    # Baseline endpoints
    report["tests"]["health"] = http_get_json(base + "/api/health")
    report["tests"]["locale_vn"] = http_get_json(base + "/api/locale?forceCountry=VN")
    products = http_get_json(base + "/api/products")

    products_json = products.get("json")
    items = []
    if products["status"] == 200:
        if isinstance(products_json, list):
            items = products_json
        elif isinstance(products_json, dict):
            items = products_json.get("items", [])

    report["tests"]["products"] = {"status": products["status"], "count": len(items) if products["status"] == 200 else None}

    # choose product ids
    if not items:
        print(json.dumps({"ok": False, "error": "No products available for smoke test", "report": report}, ensure_ascii=False, indent=2))
        return 1
    make_id = next((p.get("catalogId") for p in items if p.get("platform") == "make"), items[0].get("catalogId"))
    n8n_id = next((p.get("catalogId") for p in items if p.get("platform") == "n8n"), items[-1].get("catalogId"))

    # Sepay path
    email_vn = f"{args.email_prefix}vn-{ts}@example.com"
    vn_create = http_post_json(base + "/api/orders/create", {"productIds": [make_id], "email": email_vn, "forceCountry": "VN"})
    report["tests"]["vn_create"] = vn_create

    if vn_create["status"] == 200:
        order_id = vn_create["json"].get("orderId")
        access_token = vn_create["json"].get("accessToken")
        amount = vn_create["json"].get("amountVnd")
        txid = f"SEPAY_SMOKE_{ts}"
        sepay_payload = {"order_id": order_id, "status": "paid", "amount": amount, "provider_txn_id": txid}
        report["tests"]["sepay_webhook_first"] = http_post_json(
            base + "/api/webhook/sepay", sepay_payload, headers={"Authorization": f"Apikey {sepay_secret}"}
        )
        report["tests"]["sepay_webhook_second"] = http_post_json(
            base + "/api/webhook/sepay", sepay_payload, headers={"Authorization": f"Apikey {sepay_secret}"}
        )
        report["tests"]["sepay_bad_auth"] = http_post_json(
            base + "/api/webhook/sepay", sepay_payload, headers={"Authorization": "Apikey wrong-secret"}
        )
        report["tests"]["vn_status"] = http_get_json(base + f"/api/orders/{order_id}/status?accessToken={access_token}")

    # Admin + download cap
    email_admin = f"{args.email_prefix}admin-{ts}@example.com"
    adm_create = http_post_json(base + "/api/orders/create", {"productIds": [n8n_id], "email": email_admin, "forceCountry": "VN"})
    report["tests"]["admin_create"] = adm_create
    if adm_create["status"] == 200:
        order_id = adm_create["json"].get("orderId")
        access_token = adm_create["json"].get("accessToken")
        mark = http_post_json(base + "/api/admin/mark-paid", {"orderId": order_id}, headers={"x-admin-key": admin_key})
        report["tests"]["admin_mark_paid"] = mark
        report["tests"]["admin_status"] = http_get_json(base + f"/api/orders/{order_id}/status?accessToken={access_token}")

        attempts = []
        guide = http_get_json(base + f"/api/orders/{order_id}/download-guide?accessToken={access_token}")
        report["tests"]["admin_download_guide"] = {
            "status": guide.get("status"),
            "items": len((guide.get("json") or {}).get("items", [])) if guide.get("status") == 200 else 0,
        }

        guide_items = (guide.get("json") or {}).get("items", []) if guide.get("status") == 200 else []
        if guide_items:
            token = guide_items[0].get("token", "")
            password = guide_items[0].get("password", "")
            if token and password:
                for i in range(1, 5):
                    req = urllib.request.Request(
                        base + f"/api/download?token={urllib.parse.quote(token)}&password={urllib.parse.quote(password)}",
                        method="GET",
                    )
                    try:
                        with urllib.request.urlopen(req, timeout=90) as r:
                            attempts.append({"attempt": i, "status": r.status})
                    except urllib.error.HTTPError as e:
                        attempts.append({"attempt": i, "status": e.code, "body": e.read().decode()[:200]})
        report["tests"]["download_attempts"] = attempts

    # PayPal order create + approve url host check
    email_us = f"{args.email_prefix}us-{ts}@example.com"
    us_create = http_post_json(base + "/api/orders/create", {"productIds": [make_id], "email": email_us, "forceCountry": "US"})
    report["tests"]["us_create"] = us_create

    approve_url = us_create.get("json", {}).get("approveUrl") if us_create.get("status") == 200 else ""

    # PayPal mode check via OAuth endpoint using provided credentials
    paypal_live_ok = False
    paypal_live_error = None
    try:
        _ = paypal_live_oauth(paypal_client_id, paypal_secret)
        paypal_live_ok = True
    except Exception as e:
        paypal_live_ok = False
        paypal_live_error = str(e)

    report["tests"]["paypal_live_oauth_check"] = {"ok": paypal_live_ok, "error": paypal_live_error}

    # Negative signature path
    fake_payload = {
        "id": f"WH-FAKE-{ts}",
        "event_type": "PAYMENT.CAPTURE.COMPLETED",
        "resource": {
            "id": "2GG279541U471931P",
            "supplementary_data": {"related_ids": {"order_id": "8U481631H66031715"}},
            "custom_id": "00000000-0000-0000-0000-000000000000",
        },
    }
    report["tests"]["paypal_bad_sig"] = http_post_json(
        base + "/api/webhook/paypal",
        fake_payload,
        headers={
            "paypal-transmission-id": "test-id",
            "paypal-transmission-time": "2020-01-01T00:00:00Z",
            "paypal-cert-url": "https://api-m.sandbox.paypal.com/v1/notifications/certs/CERT-123",
            "paypal-auth-algo": "SHA256withRSA",
            "paypal-transmission-sig": "bad-sig",
        },
    )

    checks = {
        "health_200": report["tests"].get("health", {}).get("status") == 200,
        "products_200": products.get("status") == 200,
        "locale_vn_200": report["tests"].get("locale_vn", {}).get("status") == 200,
        "vn_create_200": report["tests"].get("vn_create", {}).get("status") == 200,
        "sepay_first_200": report["tests"].get("sepay_webhook_first", {}).get("status") == 200,
        "sepay_second_idempotent": report["tests"].get("sepay_webhook_second", {}).get("json", {}).get("idempotent") is True,
        "sepay_bad_auth_401": report["tests"].get("sepay_bad_auth", {}).get("status") == 401,
        "vn_status_paid": report["tests"].get("vn_status", {}).get("json", {}).get("status") == "paid",
        "admin_mark_paid_200": report["tests"].get("admin_mark_paid", {}).get("status") == 200,
        "download_4th_410": len(report["tests"].get("download_attempts", [])) >= 4 and report["tests"]["download_attempts"][3].get("status") == 410,
        "admin_download_guide_200": report["tests"].get("admin_download_guide", {}).get("status") == 200,
        "us_create_200": us_create.get("status") == 200,
        "paypal_bad_sig_401": report["tests"].get("paypal_bad_sig", {}).get("status") == 401,
    }

    expected_mode = args.paypal_mode_expected.lower().strip()
    approve_url_l = (approve_url or "").lower()
    if expected_mode == "live":
        checks["approve_url_live"] = "paypal.com/checkoutnow" in approve_url_l and "sandbox.paypal.com" not in approve_url_l
        checks["paypal_live_oauth_ok"] = paypal_live_ok
    else:
        checks["approve_url_sandbox"] = "sandbox.paypal.com/checkoutnow" in approve_url_l

    report["summary_checks"] = checks
    report["pass_count"] = sum(1 for v in checks.values() if v)
    report["total_checks"] = len(checks)
    report["approve_url"] = approve_url

    if args.cleanup:
        report["cleanup"] = cleanup_smoke_orders(supabase_url, service_key, args.email_prefix)

    print(json.dumps(report, ensure_ascii=False, indent=2))

    return 0 if report["pass_count"] == report["total_checks"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
