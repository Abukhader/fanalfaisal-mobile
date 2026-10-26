import { useEffect, useState } from "react";
import { getNotificationsByClientId } from "../app/Api/Notification";

// Added refreshFlag as a parameter to trigger re-fetches
const useNotifications = (lang, userId, refreshFlag = 0) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0); // Keeping totalCount as it might be useful elsewhere

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getNotificationsByClientId(lang, userId);
        const fetchedNotifications = data?.data || [];
        setNotifications(fetchedNotifications);

        // Calculate unread count
        const unread = fetchedNotifications.filter(
          (notification) => !notification.isRead
        ).length;
        setUnreadCount(unread);

        // Calculate total count
        setTotalCount(fetchedNotifications.length);
      } catch (err) {
        setError(err);
        setUnreadCount(0);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    // Fetch only if lang and userId are available, and whenever refreshFlag changes
    if (lang && userId) {
      fetchNotifications();
    }
  }, [lang, userId, refreshFlag]); // refreshFlag is now a dependency

  // Return all relevant states, including unreadCount and totalCount
  return { notifications, loading, error, unreadCount, totalCount };
};

export default useNotifications;
