# مسار الدفع — توصيف الفرونت

**BASE:** `https://api.fanalfisal.com.sa/api` · كل نقطة تأخذ `?Lang=ar` · `Authorization: Bearer <token>`

كل نقطة ترجع نفس الغلاف. **افحص `success` لا رمز HTTP** — قد ترجع `200` مع `success: 0`.

```json
{ "success": 1, "errors": null, "message": "تم بنجاح", "data": { }, "files": null }
```

`success`: ‏`1` نجاح · `0` رفض · `-1` خطأ داخلي. **اعرض `message` كما هو عند الرفض** — النصوص مترجمة في السيرفر ومصاغة للعميل.

---

## القاعدة الأولى: لا تكتب أسماء البوابات في الكود

المكتب يفعّل بوابته ويدخل مفاتيحها من لوحة التحكم، بلا رفع نسخة. فقائمة ثابتة في التطبيق تعني نسخة جديدة كل مرة يغيّر فيها المكتب بوابته — وهو ما بُني النظام كله لتجنبه.

### `GET /PaymentMethods/Available?OrderId=…` — توكن عميل

يرجع الوسائل المفعَّلة لمكتب هذا الطلب، مرتَّبة:

```json
[
  { "method": "Moyasar", "sortOrder": 10, "publicKey": "pk_live_…", "isSandbox": false,
    "minAmount": null, "maxAmount": null, "currency": "SAR" }
]
```

ابنِ شاشة الدفع من هذه القائمة بترتيب `sortOrder`. `publicKey` معلن بطبيعته ويُستعمل في واجهة البوابة؛ **لا يُعاد أي مفتاح سري من السيرفر أبداً** — لو رأيت واحداً فهذا خلل يجب الإبلاغ عنه فوراً.

احترم `minAmount` و`maxAmount` قبل عرض الوسيلة: بوابة تقسيط لا تقبل ‎٢٠ ريالاً، وعرضها ثم رفضها تجربة سيئة.

---

## نقاط موياسر

مؤكَّدة بالفحص الحي على السيرفر — وجود المسار وفعله:

| النقطة | الفعل | الغرض |
|---|---|---|
| `/Moyasar/CreatePayment` | POST | إنشاء عملية دفع |
| `/Moyasar/Create` | POST | موجودة أيضاً — يُرجَّح أنها الأقدم |
| `/Moyasar/Status` | POST | فحص حالة الدفع |
| `/Moyasar/Webhook` | POST | رد البوابة، **خادم لخادم — لا يناديها الفرونت** |
| `/Moyasar/Callback` | GET | عودة المتصفح بعد الدفع |

> **حقول الطلب لم تُوثَّق بعد.** موياسر سابقة لهذا العمل ولم يُقرأ كودها. لا تبنِ على أسماء
> حقول مخمَّنة — املأها من المصدر أولاً (الأمر في آخر هذا الملف).

### المسار الذي يمشي عليه الفرونت

١. العميل يختار وسيلة من `Available`.

٢. نداء `POST /Moyasar/CreatePayment` بمعرّف الفاتورة أو الطلب.

٣. الرد يحمل رابط تحويل — **افتحه كما هو ولا تبنِ رابطاً بنفسك.**

٤. العميل يدفع في صفحة البوابة، ثم يعود إلى `Callback`.

٥. **لا تعتمد على العودة وحدها في تأكيد الدفع.** المتصفح قد يُغلق قبل أن يعود، والشبكة قد تنقطع. المصدر الموثوق هو `Webhook` الذي يصل للسيرفر مباشرة. الفرونت يعرض «جارٍ التأكيد» ثم يستطلع `Status` أو ينتظر بثّ SignalR.

### التتبع الحي

بدل الاستطلاع كل ثانية، اشترك في الـ hub الموجود:

```js
const c = new signalR.HubConnectionBuilder()
  .withUrl("https://api.fanalfisal.com.sa/notificationHub")
  .withAutomaticReconnect()
  .build();
```

---

## سبب يخص هذه الشاشة تحديداً

رد البوابة وعودة المتصفح يصلان خلال أجزاء من الثانية في كل عملية ناجحة. وقد أدى ذلك فعلاً إلى تسجيل ‎٨٠ دفعة مرتين في هذا النظام، بفارق أقل من عُشر ثانية بين الصفين.

**فلا تنادِ نقطة تسوية الدفع من الفرونت مرتين**، ولا تُعِد المحاولة تلقائياً عند انتهاء المهلة. أظهر «جارٍ التأكيد» واستطلع الحالة. السيرفر عليه حارس يمنع الازدواج منذ ‎٢٩ أغسطس، لكن الفرونت لا يجب أن يعتمد عليه.

---

## البوابات الأخرى

| البوابة | الحالة |
|---|---|
| Moyasar | تعمل — البوابة النشطة حالياً |
| MyFatoorah | تعمل |
| Dinero Pay | تعمل — تحتاج حساب تاجر لكل موقع |
| **Tamara** | **تظهر في اللوحة، ولا كود دفع لها — لا تعرضها للعميل** |
| **Tabby** | **نفس الشيء** |
| UrWay | اسم في القائمة، بلا كود |

`Available` يعيد ما فعّله المكتب. لو فُعّلت تمارا أو تابي من اللوحة اليوم، فستظهر في القائمة وهي لا تعمل. حتى تُبنى، تجاهلهما في الواجهة أو أبقهما معطّلتين في اللوحة.

---

## معايير القبول

- [ ] شاشة الدفع تُبنى من `Available` لا من قائمة ثابتة في الكود
- [ ] `sortOrder` محترم، و`minAmount`/`maxAmount` يُفحصان قبل العرض
- [ ] لا حقل في الواجهة يعرض مفتاحاً سرياً
- [ ] رابط التحويل يُفتح كما ورد، بلا بناء يدوي
- [ ] تأكيد الدفع من `Status` أو البثّ، لا من عودة المتصفح وحدها
- [ ] لا إعادة محاولة تلقائية لنداء تسوية الدفع
- [ ] كل رسالة رفض معروضة هي `message` العائد

---

## لإكمال حقول موياسر

على جهاز التطوير:

```powershell
Get-ChildItem "D:\FanAlFaisal\FanAlFaisal\Api\Controllers\Moyasar*.cs" | Select-Object FullName
```

أو استخرجها من السيرفر بإرسال جسم فارغ وقراءة رسالة الرفض:

```powershell
$b="https://api.fanalfisal.com.sa"
$ph=Read-Host "Phone"; $pw=Read-Host "Password"
$l=Invoke-RestMethod "$b/api/User/Login?Lang=ar&FromOffice=false" -Method POST -ContentType "application/json" -Body (@{Phone=$ph;Password=$pw}|ConvertTo-Json -Compress)
$h=@{Authorization="Bearer " + $l.Data.Token}
foreach($u in @('/api/Moyasar/CreatePayment','/api/Moyasar/Create','/api/Moyasar/Status')){
  try{ $r=Invoke-RestMethod ($b+$u+"?Lang=ar") -Method POST -Headers $h -ContentType "application/json" -Body "{}" -TimeoutSec 20
       "$u => " + ($r|ConvertTo-Json -Compress -Depth 4) }
  catch{ $c=$_.Exception.Response
         if($c){ $s=New-Object IO.StreamReader($c.GetResponseStream()); "$u => HTTP" + [int]$c.StatusCode + " " + $s.ReadToEnd() }
         else{ "$u => " + $_.Exception.Message } } }
```

جسم فارغ يُرفض عند التحقق ولا ينشئ عملية، ورسالة الرفض تسمّي الحقول الناقصة.
