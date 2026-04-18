# WorkflowStore (Next.js + Supabase)

WorkflowStore bán workflow số với flow thanh toán:
- VN => Sepay (chuyển khoản QR)
- Global => PayPal

Sau khi thanh toán thành công:
- Ghi nhận payment idempotent
- Đánh dấu order paid
- Tạo download token có TTL + số lần tải tối đa
- Người dùng tải qua /api/download?token=...

## 1) Cài đặt

```bash
npm install
cp .env.example .env.local
# điền đầy đủ biến trong .env.local
npm run dev
```

## 2) Biến môi trường

Xem `.env.example`.

Bắt buộc tối thiểu:
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- PAYPAL_CLIENT_ID
- PAYPAL_SECRET
- PAYPAL_WEBHOOK_ID
- SEPAY_WEBHOOK_SECRET
- ADMIN_API_KEY

## 3) Supabase schema/migration

File migration chính:
- `supabase/migrations/001_init.sql`

Cách chạy nhanh:
1. Vào Supabase SQL Editor
2. Paste toàn bộ SQL trong `001_init.sql`
3. Run

Hoặc dùng psql/supabase CLI tùy môi trường.

## 4) API chính

- `GET /api/health`
- `GET /api/products`
- `GET /api/locale?forceCountry=VN|US|...`
- `POST /api/orders/create`
- `GET /api/orders/:id/status?accessToken=...`
- `POST /api/webhook/sepay`
- `POST /api/webhook/paypal`
- `GET /api/download?token=...`
- `POST /api/admin/mark-paid` (header `x-admin-key`)

## 5) Webhook endpoints (Vercel)

Khi deploy Vercel (ví dụ `https://xxx.vercel.app`):
- Sepay webhook URL: `https://xxx.vercel.app/api/webhook/sepay`
- PayPal webhook URL: `https://xxx.vercel.app/api/webhook/paypal`

## 6) Build check

```bash
npm run build
```

## 7) Bảo mật

- Tuyệt đối không commit `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng server-side
- PayPal webhook phải verify signature (đã bật qua API verify-webhook-signature)
- Sepay webhook xác thực qua header `Authorization: Apikey <SEPAY_WEBHOOK_SECRET>`
- Admin API key tách riêng (`ADMIN_API_KEY`)
