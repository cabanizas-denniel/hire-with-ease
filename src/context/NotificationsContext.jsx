/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from './AuthContext.jsx';
import { db } from '../lib/firebase.js';
import { formatNotificationTime } from '../lib/notifications.js';

const NotificationsContext = createContext(null);

const ROLES_WITH_NOTIFICATIONS = new Set(['applicant', 'employer', 'admin']);

function mapDoc(id, data) {
  return {
    id,
    type: data.type || 'system',
    title: data.title || 'Notification',
    message: data.message || '',
    time: formatNotificationTime(data.createdAtIso),
    unread: Boolean(data.unread),
    linkTo: data.linkTo || null,
    createdAtIso: data.createdAtIso || '',
    subjectUserId: data.subjectUserId || null,
    subjectRole: data.subjectRole || null,
  };
}

function notificationDocRef(role, uid, notificationId) {
  if (role === 'admin') {
    return doc(db, 'admin_notifications', notificationId);
  }
  return doc(db, 'users', uid, 'notifications', notificationId);
}

export function NotificationsProvider({ children }) {
  const { user, role, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid || null;
  const listens = Boolean(
    db && uid && isAuthenticated && role && ROLES_WITH_NOTIFICATIONS.has(role)
  );

  useEffect(() => {
    if (!listens) {
      setItems([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const q =
      role === 'admin'
        ? query(collection(db, 'admin_notifications'), orderBy('createdAtIso', 'desc'))
        : query(
            collection(db, 'users', uid, 'notifications'),
            orderBy('createdAtIso', 'desc')
          );

    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => mapDoc(d.id, d.data())));
        setLoading(false);
      },
      () => {
        setItems([]);
        setLoading(false);
      }
    );
  }, [listens, role, uid]);

  const unreadCount = useMemo(() => items.filter((n) => n.unread).length, [items]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!db || !uid || !notificationId || !role) return;
      const ref = notificationDocRef(role, uid, notificationId);
      await updateDoc(ref, {
        unread: false,
        readAt: new Date().toISOString(),
      });
    },
    [role, uid]
  );

  const markAllAsRead = useCallback(async () => {
    if (!db || !uid || !role) return;
    const unread = items.filter((n) => n.unread);
    await Promise.all(
      unread.map((n) =>
        updateDoc(notificationDocRef(role, uid, n.id), {
          unread: false,
          readAt: new Date().toISOString(),
        })
      )
    );
  }, [items, role, uid]);

  const value = useMemo(
    () => ({
      items,
      loading,
      unreadCount,
      markAsRead,
      markAllAsRead,
    }),
    [items, loading, unreadCount, markAsRead, markAllAsRead]
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used inside NotificationsProvider');
  }
  return ctx;
}

/** Safe for Navbar and other shells that may render outside the provider. */
export function useNotificationsOptional() {
  return useContext(NotificationsContext);
}
