import { useCallback, useEffect, useState } from "react";
import { getAllWorkers } from "../app/Api/WorkerService";

const useWorkers = ({
  lang = "ar",
  officeId = null,
  userId = null,
  nationalityId = null,
  religionId = null,
  jobTitle = null,
  companyServiceId = null,
  branchId = null,
  hasExperience = null, // ✨ تم الإرجاع هنا
  maritalStatus = null,
  minAge = null,
  maxAge = null,
  availabilityStatus = 1,
  page = 1,
  pageSize = 10,
}) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState({
    rowCount: 0,
    pageCount: 0,
  });

  const fetchWorkers = useCallback(async (signal = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllWorkers(
        lang,
        officeId,
        userId,
        nationalityId,
        religionId,
        jobTitle,
        companyServiceId,
        branchId,
        hasExperience, // ✨ تم الإرجاع هنا
        maritalStatus,
        minAge,
        maxAge,
        availabilityStatus,
        page,
        pageSize,
        signal
      );

      if (response && response.success === 1) {
        const fetchedData = response.data?.results || [];

        setWorkers((prev) => {
          // إذا كانت الصفحة 1، نستبدل القائمة بالكامل (مفيد عند تغيير الفلتر)
          // إذا كانت صفحة أعلى، ندمج البيانات الجديدة مع القديمة
          return page === 1 ? fetchedData : [...prev, ...fetchedData];
        });

        setPaginationInfo({
          rowCount: response.data?.rowCount || 0,
          pageCount: response.data?.pageCount || 0,
        });
      } else {
        setError("Failed to fetch workers");
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        // Ignore canceled request error
        return;
      }
      setError(err);
      console.error("Error fetching workers hook:", err);
    } finally {
      if (!signal || !signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    lang,
    officeId,
    userId,
    nationalityId,
    religionId,
    jobTitle,
    companyServiceId,
    branchId,
    hasExperience, // ✨ تم الإرجاع هنا في مصفوفة الاعتمادات
    maritalStatus,
    minAge,
    maxAge,
    availabilityStatus,
    page,
    pageSize,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    fetchWorkers(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchWorkers]);

  return {
    workers,
    setWorkers,
    loading,
    error,
    paginationInfo,
    fetchWorkers,
  };
};

export default useWorkers;
