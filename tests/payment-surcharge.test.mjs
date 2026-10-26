import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const paths = ['../utils/paymentQuote.js'];
for (const path of paths) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { amount, paymentQuote, sameQuote, paymentMethodsResponse } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const method = { method: 'Tamara', surchargePercent: 5, surchargeAmount: 50, totalAmount: 1050 };
  test(`${path}: use server totals without applying percentage twice`, () => {
    assert.deepEqual(paymentQuote(method, 1000), { base: 1000, fee: 50, percent: 5, total: 1050 });
    assert.equal(paymentQuote({ ...method, method: 'Tabby' }, 1000).total, 1050);
  });
  test(`${path}: missing BNPL prices cannot fall back to an invoice`, () => {
    assert.equal(paymentQuote({ method: 'Tamara' }, 1000, 1000), null);
    assert.equal(paymentQuote({ ...method, surchargeAmount: null }, 1000), null);
    assert.equal(paymentQuote({ ...method, totalAmount: -1 }, 1000), null);
    assert.equal(paymentQuote(method, 1200), null);
  });
  test(`${path}: zero values remain zero and do not trigger a fallback`, () => {
    assert.deepEqual(paymentQuote({ method: 'Tabby', surchargePercent: 0, surchargeAmount: 0, totalAmount: 0 }, 0, 999), { base: 0, fee: 0, percent: 0, total: 0 });
    assert.equal(paymentQuote({ method: 'Cash' }, 0, 999).total, 0);
    for (const value of ['', ' ', null, undefined, true, [], NaN, Infinity, -1]) assert.equal(amount(value), null);
  });
  test(`${path}: switching away from installments removes the fee`, () => {
    assert.deepEqual(paymentQuote({ method: 'MyFatoorah' }, 1000), { base: 1000, fee: 0, percent: 0, total: 1000 });
  });
  test(`${path}: final payment changes require review`, () => {
    const original = paymentQuote(method, 1000);
    assert.equal(sameQuote(original, paymentQuote(method)), true);
    assert.equal(sameQuote(original, paymentQuote({ ...method, totalAmount: 1060, surchargeAmount: 60, surchargePercent: 6 })), false);
    assert.equal(sameQuote(original, null), false);
  });
  test(`${path}: distinguish empty results from failed or malformed responses`, () => {
    assert.deepEqual(paymentMethodsResponse({ success: 1, data: { amountDue: 0, methods: [] } }), { amountDue: 0, methods: [] });
    assert.throws(() => paymentMethodsResponse({ success: 0, data: { methods: [method] } }));
    assert.throws(() => paymentMethodsResponse({ success: 1, data: {} }));
    assert.equal(paymentMethodsResponse({ success: 1, data: [method] }).methods.length, 1);
  });
}

