# المهام البرمجية المطلوبة للـ Backend: ربط ومعالجة بوابة ميسر (Moyasar Webhook & Settlement)

## ⚙️ إعدادات الـ Webhook في لوحة تحكم ميسر

تم ضبط وتفعيل الـ Webhook في لوحة تحكم ميسر بالبيانات التالية:
- **الرابط (Endpoint URL):** `https://api.fanalfisal.com.sa/api/Moyasar/Webhook`
- **طريقة الإرسال (HTTP Method):** `POST`
- **رمز التحقق السري (Secret Token):** `webhook_secret_fanalfaisal_2026`
- **الأحداث المفعّلة (Events):**
  - `payment_paid`
  - `payment_failed`
---

## 🛠️ المهام البرمجية المطلوبة

### 1️⃣ المهمة الأولى: إنشاء مسار الـ Webhook لتسوية المدفوعات
- **المسار:** `POST /api/Moyasar/Webhook`
- **المصادقة:** `[AllowAnonymous]` (الإشعار يُرسل خادم-لخادم من ميسر).
- **التحقق من الأمان:** التحقق من مطابقة الرمز السري المرسل في الـ Header:
  `Request.Headers["secret_token"] == "webhook_secret_fanalfaisal_2026"`
- **المعالجة المطلوبة:**
  1. استلام كائن الـ JSON في الـ Body.
  2. عند استقبال حدث `payment_paid` (أو `status == "paid"`):
     - استخراج معرّف الدفعة `data.id`.
     - استخراج معرّف الفاتورة `data.metadata.InvoiceId` (أو `OrderId`).
     - تحديث حالة الفاتورة في قاعدة البيانات إلى مدفوعة (`Paid`).
     - تحديث حالة الطلب المرتبط إلى مكتمل/مدفوع.
     - تسجيل سند القبض أو الحركة المالية الخاصة بالسداد.
     - (اختياري) إرسال إشعار SignalR للواجهة الأمامية عبر `PaymentHub`.
  3. إرجاع استجابة `200 OK` فوراً لتأكيد الاستلام لميسر.

---

### 2️⃣ المهمة الثانية: تسوية الفاتورة ذاتياً داخل `CheckPayment`
- **المسار:** `POST /api/Moyasar/CheckPayment?Lang=ar`
- **المعالجة المطلوبة:**
  - عند استدعاء هذه الدالة من التطبيق، يقوم السيرفر بالاستعلام عن حالة الدفعة من Moyasar API (`https://api.moyasar.com/v1/payments/{id}`).
  - إذا كانت الدفعة في ميسر `paid` أو `captured` والفاتورة لم تُسجل كمدفوعة بعد في قاعدة البيانات:
    - يقوم السيرفر **فوراً بتسوية الفاتورة وتحديث حالة الطلب في قاعدة البيانات** إلى مدفوع.
    - إرجاع الرد للتطبيق بحالة نجاح:
      ```json
      {
        "Success": 1,
        "Message": "تم التحقق وسداد الفاتورة بنجاح",
        "Data": { ...كائن الطلب المحدث... }
      }
      ```
  - إذا كانت الدفعة لا تزال معلقة (`initiated` / `authorized`):
    - إرجاع `Success = 0` مع اسم الحالة كـ Message لمواصلة الاستعلام.

---

## 💻 كود استرشادي مقترح (C# / ASP.NET Core)

### 1. إعدادات `appsettings.json`
```json
"Moyasar": {
  "ApiKey": "sk_live_...",
  "WebhookSecret": "webhook_secret_fanalfaisal_2026"
}
```

### 2. نماذج البيانات (DTOs)
```csharp
public class MoyasarWebhookPayload
{
    public string Id { get; set; }
    public string Type { get; set; } // مثل: payment_paid
    public DateTime CreatedAt { get; set; }
    public MoyasarPaymentData Data { get; set; }
}

public class MoyasarPaymentData
{
    public string Id { get; set; }
    public string Status { get; set; } // paid, failed, ...
    public int Amount { get; set; }    // بالهللة
    public string Currency { get; set; }
    public string Description { get; set; }
    public Dictionary<string, string> Metadata { get; set; }
}
```

### 3. المتحكم (Controller Implementation)
```csharp
[ApiController]
[Route("api/[controller]")]
public class MoyasarController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<MoyasarController> _logger;

    public MoyasarController(IConfiguration config, IPaymentService paymentService, ILogger<MoyasarController> logger)
    {
        _config = config;
        _paymentService = paymentService;
        _logger = logger;
    }

    [HttpPost("Webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook([FromBody] MoyasarWebhookPayload payload)
    {
        try
        {
            // 1. التحقق من الرمز السري في الهيدر
            var expectedSecret = _config["Moyasar:WebhookSecret"];
            if (!Request.Headers.TryGetValue("secret_token", out var secretToken) || secretToken != expectedSecret)
            {
                _logger.LogWarning("Moyasar Webhook: Invalid or missing secret_token.");
                return Unauthorized();
            }

            if (payload == null || payload.Data == null)
            {
                return BadRequest("Empty payload.");
            }

            _logger.LogInformation("Moyasar Webhook Received: Event={Event}, PaymentId={Id}, Status={Status}", 
                payload.Type, payload.Data.Id, payload.Data.Status);

            // 2. معالجة حالة السداد الناجح
            if (payload.Type == "payment_paid" || payload.Data.Status?.ToLower() == "paid")
            {
                string invoiceIdStr = null;
                if (payload.Data.Metadata != null && payload.Data.Metadata.ContainsKey("InvoiceId"))
                {
                    invoiceIdStr = payload.Data.Metadata["InvoiceId"];
                }

                // تنفيذ عملية التسوية وتحديث حالة الفاتورة والطلب في قاعدة البيانات
                await _paymentService.SettleMoyasarPaymentAsync(payload.Data.Id, invoiceIdStr, payload.Data.Amount);
            }

            return Ok(new { status = "received" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Moyasar Webhook.");
            return StatusCode(500, ex.Message);
        }
    }
}
```

---

## 📋 مصفوفة التحقق والاختبار (Testing Checklist)
- [ ] التأكد من رفع وتفعيل التعديل على السيرفر `https://api.fanalfisal.com.sa`.
- [ ] التحقق من استجابة `POST /api/Moyasar/Webhook` بـ `200 OK` عند إرسال `secret_token: webhook_secret_fanalfaisal_2026`.
- [ ] تجربة دفع من التطبيق والتأكد من تحديث حالة الفاتورة والطلب إلى مدفوع فوراً.

---

## 📢 المخرجات والتسليم بعد الانتهاء (تقرير مطور الواجهة الأمامية / Frontend Report)

> **مهم جداً:** بعد الانتهاء من تنفيذ وتفعيل التعديلات على السيرفر، يُرجى **إعداد وتجهيز تقرير تقني مفصل ليتم تسليمه لمطور الواجهة الأمامية (Frontend)** يحتوي على:
>
> 1. **التعديلات المطلوبة من طرف الفرونت إند (إن وجدت):**
>    - هل يلزم تعديل أو إضافة أي حقول في الـ Payload عند استدعاء `CreatePayment` (مثل `Metadata` أو غيرها)؟
>    - هل طرأ أي تغيير على شكل استجابة (Response Schema) أو معايير الـ API الخاصة بـ `CheckPayment`؟
> 2. **آلية إشعار التطبيق بنجاح العملية:**
>    - هل يكتفي التطبيق بالاستعلام الدوري عبر `CheckPayment`؟
>    - أم تم تفعيل بث لحظي عبر SignalR (مثل حدث `ReceivePaymentResult` على هب `PaymentHub`) لتستمع له شاشة الدفع في الموبايل؟
> 3. **روابط الـ API المنشورة:**
>    - تأكيد الروابط ونقاط النهاية الجاهزة للاختبار على بيئة الإنتاج أو الـ Staging.
> 4. **أي ملاحظات أو إرشادات خاصة للاختبار والربط النهائي.**

