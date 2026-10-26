import { useEffect, useState } from "react";
import { getAllOrders } from "../app/Api/OrderService";

const useOrders = (
  lang,
  status = null,
  clientId = null,
  officeId = null,
  workerId = null
) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllOrders(
          lang,
          status,
          clientId,
          officeId,
          workerId
        );
        setOrders(data?.data || []); // حسب شكل الريسبونس
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [lang, status, clientId, officeId, workerId]);

  return { orders, loading, error };
};

export default useOrders;
