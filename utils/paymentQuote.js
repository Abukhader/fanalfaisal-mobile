export const isInstallmentMethod = (method) => ["Tamara", "Tabby"].includes(method);

export function amount(value) {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

// Totals and fees are supplied by the backend. Never apply the percentage locally.
export function paymentQuote(method, amountDue, fallbackAmount) {
  if (!method) return null;
  const installment = isInstallmentMethod(method.method || method.name);
  const total = amount(method.totalAmount);
  const fee = amount(method.surchargeAmount);
  const percent = amount(method.surchargePercent);
  if (installment) {
    if (total === null || fee === null || percent === null || percent > 100 || fee > total) return null;
    const base = Math.round((total - fee) * 100) / 100;
    const due = amount(method.amountDue ?? amountDue);
    if (due !== null && Math.abs(due - base) > 0.011) return null;
    return { base, fee, percent, total };
  }
  const base = total ?? amount(method.amountDue) ?? amount(amountDue) ?? amount(fallbackAmount);
  return base === null ? null : { base, fee: 0, percent: 0, total: base };
}

export function sameQuote(first, second) {
  return Boolean(first && second && ["base", "fee", "total"].every(
    (key) => Math.round(first[key] * 100) === Math.round(second[key] * 100)
  ) && first.percent === second.percent);
}

export function paymentMethodsResponse(response) {
  if (response?.success !== 1 && response?.Success !== 1) throw new Error(response?.message || "Unable to load payment methods");
  const data = response.data;
  const methods = Array.isArray(data) ? data : data?.methods;
  if (!Array.isArray(methods)) throw new Error("Invalid payment methods response");
  return { amountDue: amount(data?.amountDue), methods };
}
