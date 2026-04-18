"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  catalogId: string;
  dbId: string;
  slug: string;
  name: string;
  description: string;
  platform: "make" | "n8n";
  category: string;
  complexity: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  price_usd: number;
  price_vnd: number;
};

type LocalePayload = {
  countryCode: string;
  isVN: boolean;
  currency: "VND" | "USD";
  provider: "sepay" | "paypal";
};

type CheckoutResponse = {
  orderId: string;
  accessToken: string;
  provider: "sepay" | "paypal";
  currency: "VND" | "USD";
  amountVnd?: number;
  amountUsd?: number;
  paypalOrderId?: string;
  approveUrl?: string | null;
  transferContent?: string;
  qrText?: string;
  bank?: {
    code: string;
    accountNo: string;
    accountName: string;
  };
};

export function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [locale, setLocale] = useState<LocalePayload>({
    countryCode: "US",
    isVN: false,
    currency: "USD",
    provider: "paypal",
  });
  const [forceCountry, setForceCountry] = useState("");
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const [pRes, lRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/locale"),
        ]);
        const pJson = await pRes.json();
        const lJson = await lRes.json();
        setProducts(pJson.items || []);
        setLocale(lJson);
      } catch {
        setMessage("Không tải được dữ liệu ban đầu");
      }
    })();
  }, []);

  useEffect(() => {
    if (!checkout?.orderId || !checkout?.accessToken) return;
    if (checkout.provider !== "sepay") return;

    let timer: NodeJS.Timeout | undefined;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/orders/${checkout.orderId}/status?accessToken=${encodeURIComponent(checkout.accessToken)}`
        );
        const json = await res.json();
        if (res.ok) {
          setOrderStatus(json.status || "unknown");
        }
      } catch {
        // ignore
      }
    };

    poll();
    timer = setInterval(poll, 5000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [checkout]);

  const total = useMemo(() => {
    const rows = products.filter((p) => selected.includes(p.catalogId));
    if (locale.currency === "VND") {
      return rows.reduce((s, p) => s + p.price_vnd, 0);
    }
    return Math.round(rows.reduce((s, p) => s + p.price_usd, 0) * 100) / 100;
  }, [products, selected, locale.currency]);

  const totalLabel =
    locale.currency === "VND"
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)
      : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total);

  const toggleProduct = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCheckout = async () => {
    if (!selected.length) {
      setMessage("Vui lòng chọn ít nhất 1 workflow");
      return;
    }
    if (!email || !email.includes("@")) {
      setMessage("Vui lòng nhập email hợp lệ");
      return;
    }

    setLoading(true);
    setMessage("");
    setCheckout(null);
    setOrderStatus("");

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productIds: selected,
          email,
          forceCountry: forceCountry || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || "Checkout lỗi");
        return;
      }

      const data = json as CheckoutResponse;
      setCheckout(data);

      if (data.provider === "paypal" && data.approveUrl) {
        window.location.href = data.approveUrl;
        return;
      }

      setMessage("Đơn hàng đã tạo. Vui lòng chuyển khoản theo QR/nội dung bên dưới.");
    } catch {
      setMessage("Không thể tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container grid" style={{ gap: 20 }}>
      <div className="card" style={{ padding: 16 }}>
        <h1 style={{ marginTop: 0 }}>WorkflowStore</h1>
        <p style={{ marginTop: 8, color: "#c4c7d7" }}>
          GeoIP: {locale.countryCode} • Provider mặc định: {locale.provider.toUpperCase()} ({locale.currency})
        </p>
        <div style={{ display: "grid", gap: 10, maxWidth: 360 }}>
          <label>
            Email nhận link tải
            <input
              className="input"
              placeholder="master@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Force country (test)
            <select
              className="input"
              value={forceCountry}
              onChange={(e) => setForceCountry(e.target.value.toUpperCase())}
            >
              <option value="">Auto theo GeoIP</option>
              <option value="VN">VN (Sepay)</option>
              <option value="US">US (PayPal)</option>
              <option value="SG">SG (PayPal)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-3">
        {products.map((p) => {
          const checked = selected.includes(p.catalogId);
          return (
            <label key={p.catalogId} className="card" style={{ padding: 14, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong>{p.name}</strong>
                <input type="checkbox" checked={checked} onChange={() => toggleProduct(p.catalogId)} />
              </div>
              <div style={{ color: "#a1a1aa", fontSize: 14 }}>{p.description}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge">{p.platform.toUpperCase()}</span>
                <span className="badge">{p.complexity}</span>
                <span className="badge">{p.estimatedTime}</span>
              </div>
              <div style={{ fontWeight: 700 }}>
                {locale.currency === "VND"
                  ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price_vnd)
                  : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.price_usd)}
              </div>
            </label>
          );
        })}
      </div>

      <div className="card" style={{ padding: 16, display: "grid", gap: 10 }}>
        <div>Tổng: <strong>{totalLabel}</strong></div>
        <div>
          <button className="btn btn-primary" disabled={loading} onClick={handleCheckout}>
            {loading ? "Đang tạo đơn..." : "Checkout"}
          </button>
        </div>
        {!!message && <div style={{ color: "#22d3ee" }}>{message}</div>}
      </div>

      {checkout && checkout.provider === "sepay" && (
        <div className="card" style={{ padding: 16, display: "grid", gap: 10 }}>
          <h3 style={{ margin: 0 }}>Thanh toán Sepay</h3>
          <div>Order: {checkout.orderId}</div>
          <div>Bank: {checkout.bank?.code} • {checkout.bank?.accountNo} • {checkout.bank?.accountName}</div>
          <div>Nội dung chuyển khoản: <strong>{checkout.transferContent}</strong></div>
          <div style={{ color: "#a1a1aa", wordBreak: "break-all" }}>QR text: {checkout.qrText}</div>
          <div>Trạng thái realtime: <strong>{orderStatus || "pending"}</strong></div>
        </div>
      )}
    </div>
  );
}
