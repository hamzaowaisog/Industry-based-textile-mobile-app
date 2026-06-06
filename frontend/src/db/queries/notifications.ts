import { sqlite } from '../index';
import type { NotificationItem } from '../../types/notifications.types';

export const insertNotification = async (n: NotificationItem): Promise<void> => {
  await sqlite.runAsync(
    `INSERT OR IGNORE INTO notifications (id, type, title, body, entity_id, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [n.id, n.type, n.title, n.body, n.entityId ?? null, n.isRead ? 1 : 0, n.createdAt],
  );
};

export const getUnreadNotifications = async (limit?: number): Promise<NotificationItem[]> => {
  const sql = limit
    ? `SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC LIMIT ?`
    : `SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC`;
  const rows = limit
    ? await sqlite.getAllAsync<any>(sql, [limit])
    : await sqlite.getAllAsync<any>(sql);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    entityId: r.entity_id ?? undefined,
    isRead: r.is_read === 1,
    createdAt: r.created_at,
  }));
};

export const getUnreadCount = async (): Promise<number> => {
  const row = await sqlite.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM notifications WHERE is_read = 0`,
  );
  return row?.count ?? 0;
};

export const markAllRead = async (): Promise<void> => {
  await sqlite.runAsync(`UPDATE notifications SET is_read = 1`);
};

export const markAsRead = async (id: string): Promise<void> => {
  await sqlite.runAsync(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);
};

export const deleteNotification = async (id: string): Promise<void> => {
  await sqlite.runAsync(`DELETE FROM notifications WHERE id = ?`, [id]);
};

export const clearAllNotifications = async (): Promise<void> => {
  await sqlite.runAsync(`DELETE FROM notifications`);
};
