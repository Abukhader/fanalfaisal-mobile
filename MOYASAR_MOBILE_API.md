# دليل ربط ميسر (Moyasar) — تطبيق الموبايل

توثيق نقاط النهاية المعتمدة في الـ Backend لبوابة ميسر، لربط شاشة الدفع في التطبيق.

- **المسار الأساسي:** `/api/Moyasar`
- **المصادقة:** `Authorization: Bearer <token>` (مطلوبة في CreatePayment و CheckPayment)
- **اللغة:** تُمرَّر كـ Query Param: `?Lang=ar`

---

## 1) إنشاء عملية دفع

```
POST /api/Moyasar/CreatePayment?Lang=ar
```

> يوجد Alias باسم `POST /api/Moyasar/create` بنفس السلوك تماماً — اعتمدوا `CreatePayment`.

### Request Body

| الحقل | النوع | مطلوب؟ | الوصف |
|---|---|---|---|
| `InvoiceId` | Guid | **نعم** | معرّف الفاتورة في نظامنا (ليس معرّف ميسر) |
| `Currency` | string | لا | الافتراضي `SAR` — السيرفر يرفض تسوية أي عملة غيرها |
| `Description` | string | لا | الافتراضي: `Order {OrderNum}` |
| `SuccessUrl` | string | لا | رابط عودة التطبيق بعد التحقق من الدفع (Deep Link أو صفحة ويب) |
| `CancelUrl` | string | لا | وجهة زر «رجوع» في صفحة دفع ميسر |

> **مهم:** لا يوجد حقل `Amount` ولا `OrderId`. السيرفر يحسب المبلغ بنفسه من متبقي الفاتورة
> (`invoice.Remaining`) ويستنتج الطلب من الفاتورة — التطبيق لا يتحكم في المبلغ.

### Response — نجاح

```json
{
  "Success": 1,
  "Message": "...",
  "Data": {
    "PaymentUrl": "https://...",
    "MoyasarInvoiceId": "...",
    "OrderNum": "...",
    "InvoiceId": "..."
  }
}
```

- رابط صفحة الدفع في الحقل **`Data.PaymentUrl`** — يُفتح في متصفح خارجي أو WebView.
- **احفظوا `Data.MoyasarInvoiceId` محلياً** — هو مفتاح الاستعلام عن الحالة في الخطوة التالية.

### Response — فشل (`Success = 0`)

- البوابة غير مفعّلة أو غير مهيّأة ← رسالة عامة.
- الفاتورة غير موجودة / الطلب غير موجود.
- الفاتورة مسدَّدة بالكامل ← رسالة «AlreadyPaid» مع كائن الفاتورة في `Data`.

---

## 2) التحقق من حالة الدفع

```
POST /api/Moyasar/CheckPayment?Lang=ar
```

> يوجد Alias باسم `POST /api/Moyasar/status` بنفس السلوك.

### Request Body

كل الحقول في الـ **Body** (وليس Query Params)، ويجب إرسال واحد منها على الأقل:

| الحقل | النوع | الأولوية | الوصف |
|---|---|---|---|
| `PaymentId` | string | الأولى | معرّف دفعة ميسر — إن توفر (مثلاً من `paymentId` في رابط العودة) |
| `MoyasarInvoiceId` | string | الثانية | **المسار المعتاد للتطبيق:** القيمة المستلمة من CreatePayment |
| `OrderId` | Guid | احتياطي | بدون معرّف ميسر يجيب السيرفر من سجلاته المحلية فقط |

### تفسير الـ Response

| الحالة | الشكل | ما يفعله التطبيق |
|---|---|---|
| **مدفوعة** | `Success = 1` و `Data` = كائن الطلب (Order) | إظهار شاشة النجاح والانتقال |
| **قيد المعالجة** | `Success = 0` و `Message` = `initiated` أو `authorized` أو `verified` | الاستمرار في الاستعلام (Polling) كل بضع ثوانٍ |
| **فاشلة / خطأ** | `Success = 0` و `Message` = رسالة مترجمة («فشل الدفع» ونحوها) | إظهار الفشل أو خيار إعادة المحاولة |

> **القاعدة العملية:** اعتمدوا على `Success` أولاً. إن كان `0` وكانت `Message` إحدى القيم الثلاث
> `initiated / authorized / verified` فالدفعة معلّقة — واصلوا الاستعلام؛ غير ذلك فهي فاشلة.
>
> قيم ميسر الخام كاملة للعلم: النجاح = `paid` أو `captured`،
> الفشل النهائي = `failed / abandoned / expired / canceled / voided` —
> لكن التطبيق لا يرى الخام منها إلا حالات التعليق الثلاث.

---

## 3) روابط العودة والتسوية (Redirect / Callback)

**الخلاصة: التسوية الفعلية تتم داخل السيرفر** عبر Webhook و Invoice Callback من ميسر إلى
السيرفر مباشرة — التطبيق لا يشارك فيها إطلاقاً. تمرير `SuccessUrl` / `CancelUrl` اختياري وللعرض فقط.

### ماذا يحدث لرابط SuccessUrl الذي ترسلونه؟

السيرفر لا يمرره لميسر كما هو، بل يغلّفه: متصفح العميل بعد الدفع يهبط أولاً على نقطة تحقق في السيرفر:

```
GET /api/Moyasar/Callback?OrderId=...&ReturnUrl=<SuccessUrl>
```

يتحقق السيرفر من الدفعة ثم يعيد التوجيه إلى `SuccessUrl` الخاص بكم مضيفاً إليه:

```
paymentSuccess=true|false   // نتيجة التحقق
paymentId=<id>              // معرّف دفعة ميسر — إن أرفقته ميسر (غير مضمون)
orderId=<guid>              // معرّف الطلب
```

> **لا تعتمدوا على `paymentSuccess=true` وحده لإظهار النجاح النهائي.** هو إشارة عرض؛
> التأكيد المعتمد هو `CheckPayment` الذي يعيد `Success = 1`.
> أما `CancelUrl` فهو ببساطة وجهة زر الرجوع في صفحة ميسر.

### مسارات السيرفر الداخلية (للعلم فقط — لا يستدعيها التطبيق)

- `POST /api/Moyasar/InvoiceCallback` — ميسر يرسل كائن الفاتورة خادم-لخادم عند السداد.
- `POST /api/Moyasar/Webhook` — أحداث `payment_paid / payment_failed` مع تحقق من `secret_token`.
- عند اكتمال التسوية يبث السيرفر حدث **SignalR** باسم `ReceivePaymentResult` على `PaymentHub` —
  يمكن للتطبيق الاستماع له بدل الـ Polling أو معه.

---

## التدفق الموصى به في التطبيق

1. استدعاء `CreatePayment` بـ `InvoiceId` (+ `SuccessUrl` إن أردتم العودة عبر المتصفح).
2. فتح `Data.PaymentUrl` في متصفح خارجي أو WebView، وحفظ `Data.MoyasarInvoiceId`.
3. أثناء بقاء شاشة الدفع مفتوحة: استدعاء `CheckPayment` بـ `MoyasarInvoiceId` كل 3–5 ثوانٍ
   (أو الاستماع لـ SignalR).
4. `Success = 1` ← نجاح (و`Data` يحمل الطلب محدّثاً). حالة معلّقة ← متابعة الاستعلام. غير ذلك ← فشل.
