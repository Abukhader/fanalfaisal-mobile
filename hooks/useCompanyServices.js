import { useEffect, useState } from "react";
import { GetAllCompanyService } from "../app/Api/officeService"; // تأكد من صحة المسار

const useCompanyServices = (enabled = true) => {
  const [companyServices, setCompanyServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyServices = async () => {
      // نتحقق من وجود اللغة، إذا لم تكن موجودة نستخدم 'ar' كافتراضي
      const currentLang = "ar";

      setLoading(true);
      setError(null); // إعادة تعيين الخطأ عند محاولة التحميل مرة أخرى

      try {
        const response = await GetAllCompanyService(currentLang);
        // نتحقق من نجاح الطلب وهيكل البيانات (بناءً على تعديلاتنا السابقة)
        const servicesData = response.data || [];

        setCompanyServices(servicesData);
      } catch (err) {
        console.error("Error fetching company services in Mobile:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (enabled) {
      fetchCompanyServices();
    }
  }, ["ar", enabled]);

  return { companyServices, loading, error };
};

export default useCompanyServices;
