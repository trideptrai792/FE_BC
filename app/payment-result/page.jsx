"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

function parsePayDate(s) {
  if (!s || s.length !== 14) return null;
  const y = s.slice(0, 4);
  const mo = s.slice(4, 6);
  const d = s.slice(6, 8);
  const h = s.slice(8, 10);
  const mi = s.slice(10, 12);
  const se = s.slice(12, 14);
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${se}`);
}

function formatVndFromVnpAmount(vnpAmount) {
  const n = Number(vnpAmount);
  if (!Number.isFinite(n)) return null;
  const vnd = Math.round(n / 100);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(vnd);
}

function IconSuccess() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm-1.1 13.6-3.3-3.3 1.4-1.4 1.9 1.9 4.9-4.9 1.4 1.4-6.3 6.3Z"
      />
    </svg>
  );
}

function IconFail() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm3.3 13.9L14 17.2 12 15.2l-2 2-1.3-1.3 2-2-2-2 1.3-1.3 2 2 2-2 1.3 1.3-2 2 2 2Z"
      />
    </svg>
  );
}

export default function PaymentResultPage() {
  const sp = useSearchParams();

  const txnRef = sp.get("vnp_TxnRef") || "";
  const responseCode = sp.get("vnp_ResponseCode") || "";
  const transStatus = sp.get("vnp_TransactionStatus") || "";
  const bankCode = sp.get("vnp_BankCode") || "";
  const cardType = sp.get("vnp_CardType") || "";
  const transNo = sp.get("vnp_TransactionNo") || "";
  const orderInfo = sp.get("vnp_OrderInfo") || "";
  const payDateRaw = sp.get("vnp_PayDate") || "";
  const amountRaw = sp.get("vnp_Amount") || "";

  const ok = responseCode === "00" && transStatus === "00";
  const amountText = formatVndFromVnpAmount(amountRaw);
  const payDate = parsePayDate(payDateRaw);
  const payDateText = payDate ? payDate.toLocaleString("vi-VN") : "";

  const title = ok ? "Thanh toán thành công" : "Thanh toán thất bại";
  const subtitle = ok
    ? "Đơn hàng của bạn đã được ghi nhận. Bạn có thể quay lại trang chủ hoặc xem đơn hàng."
    : responseCode === "15"
      ? "Giao dịch đã quá thời gian chờ. Vui lòng tạo lại thanh toán."
      : "Vui lòng thử lại hoặc chọn phương thức thanh toán khác.";

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div className={`p-6 sm:p-8 ${ok ? "bg-green-50" : "bg-rose-50"}`}>
            <div className="flex items-start gap-4">
              <div className={`${ok ? "text-green-600" : "text-rose-600"}`}>
                {ok ? <IconSuccess /> : <IconFail />}
              </div>

              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-700">{subtitle}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      ok ? "bg-green-600 text-white" : "bg-rose-600 text-white"
                    }`}
                  >
                    ResponseCode: {responseCode || "--"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                    TxStatus: {transStatus || "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Mã giao dịch (TxnRef)</p>
                <p className="mt-1 font-semibold text-gray-900 break-all">{txnRef || "--"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Số tiền</p>
                <p className="mt-1 font-semibold text-gray-900">{amountText || "--"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Ngân hàng</p>
                <p className="mt-1 font-semibold text-gray-900">{bankCode || "--"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Thời gian thanh toán</p>
                <p className="mt-1 font-semibold text-gray-900">{payDateText || "--"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Loại thẻ</p>
                <p className="mt-1 font-semibold text-gray-900">{cardType || "--"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Mã giao dịch VNPay</p>
                <p className="mt-1 font-semibold text-gray-900 break-all">{transNo || "--"}</p>
              </div>
            </div>

            {orderInfo ? (
              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Nội dung đơn</p>
                <p className="mt-1 text-sm text-gray-900 break-words">{orderInfo}</p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black"
              >
                Về trang chủ
              </Link>

              <Link
                href="/cart"
                className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Quay lại giỏ hàng
              </Link>

              <Link
                href="/checkout"
                className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Thanh toán lại
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Nếu bạn thấy trạng thái hiển thị đúng nhưng đơn hàng chưa cập nhật, cần xử lý IPN/Return ở backend để cập nhật payment_status.
        </p>
      </div>
    </div>
  );
}
