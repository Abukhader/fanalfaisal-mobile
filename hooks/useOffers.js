import { useEffect, useState } from "react";
import { getAllOffers } from "../app/Api/OfferService";

const useOffers = (lang, officeId, refreshTrigger) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lang || !officeId) return; // تأكد من وجود المعطيات اللازمة

    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllOffers(lang, officeId);
        setOffers(data?.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [lang, officeId, refreshTrigger]);
  return { offers, loading, error };
};

export default useOffers;
