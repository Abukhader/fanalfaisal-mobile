# تطبيق فن الفيصل

مشروع مستقل يستخدم Expo وReact Native وExpo Router.

## التشغيل المحلي

المتطلبات: Node.js 22 (22.12 أو أحدث ضمن الإصدار 22) وnpm.

```sh
npm ci
cp .env.example .env.local
npm start
```

في PowerShell استخدم `Copy-Item .env.example .env.local`. لا تستبدل ملف البيئة المحلي الموجود. اطلب إعدادات المصادقة القديمة عبر قناة آمنة؛ القيم غير موجودة في المستودع. أعد تشغيل خادم التطوير بعد تغيير البيئة.

## التحقق

```sh
npm test
npx expo export --platform android --output-dir dist-check
```

يتوفر أيضًا `npm run lint` لفحص الكود؛ قد يكشف ملاحظات سابقة خارج نطاق تجهيز المستودع.

## بناء التطبيق

إعدادات EAS في `eas.json` وهوية التطبيق في `app.json`. يحتاج بناء المتاجر إلى حساب Expo وصلاحيات Apple/Google وإعدادات البيئة المناسبة. ملفات `patches/` و`.npmrc` جزء من تثبيت المشروع ويجب حفظها في Git. تصدير Android المحلي يتحقق من الحزمة ولا ينتج تطبيق متجر موقّعًا.

## GitHub

ارفع هذا المجلد كمستودع مستقل، واحتفظ بـ `package-lock.json` والاختبارات. لا ترفع `node_modules` أو ملفات البناء أو `.env.local`. راجع [ملاحظات الأمان](SECURITY.md) قبل أول رفع.
