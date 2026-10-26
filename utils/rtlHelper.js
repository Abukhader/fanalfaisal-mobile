import i18n from "i18next";

export const RTL = {
  // هل اللغة الحالية هي العربية؟
  isRTL: () => i18n.language === "ar",

  // المحاذاة الطبيعية (alignItems)
  // العربي: flex-end (يمين) | الإنجليزي: flex-start (يسار)
  flexAlign: () => (i18n.language === "ar" ? "flex-end" : "flex-start"),

  // محاذاة النصوص الطبيعية (textAlign)
  // العربي: right | الإنجليزي: left
  textAlign: () => (i18n.language === "ar" ? "right" : "left"),

  // اتجاه الصف الطبيعي (flexDirection)
  // العربي: row-reverse (يبدأ من اليمين) | الإنجليزي: row (يبدأ من اليسار)
  rowDir: () => (i18n.language === "ar" ? "row-reverse" : "row"),

  // اتجاه العناصر المتسلسلة (مثل شريط التبويبات أو نقاط الصور)
  indicatorDir: () => (i18n.language === "ar" ? "row-reverse" : "row"),

  // تنسيق النقطة (Bullet point) حسب اتجاه القراءة
  bullet: (text) => (i18n.language === "ar" ? `• ${text}` : `${text} •`),

  // الهوامش الجانبية (Margin Side) - تمثل "الهامش بعد العنصر"
  // في العربي (RTL): العنصر يتبعه فراغ من جهة اليسار (marginLeft)
  // في الإنجليزي (LTR): العنصر يتبعه فراغ من جهة اليمين (marginRight)
  marginSide: (value) =>
    i18n.language === "ar" ? { marginLeft: value } : { marginRight: value },

  // الحواف الداخلية (Padding Side)
  paddingSide: (value) =>
    i18n.language === "ar" ? { paddingLeft: value } : { paddingRight: value },

  // اختيار قيمة مخصصة بناءً على اللغة (rtlValue للمحتوى العربي، ltrValue للإنجليزي)
  select: (rtlVal, ltrVal) => (i18n.language === "ar" ? rtlVal : ltrVal),

  // اتجاه كتابة النص (لحل مشكلة الكلمات المعكوسة عند تعطيل RTL الأصلي)
  writingDirection: () => (i18n.language === "ar" ? "rtl" : "ltr"),
};
