import { LocalNotifications } from '@capacitor/local-notifications';
import type { Bewerbung, Reminder } from '../types';

export type NotificationStatus = 'granted' | 'denied' | 'default' | 'unavailable';

function uuidZuId(uuid: string): number {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = (hash << 5) - hash + uuid.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

export async function notificationStatus(): Promise<NotificationStatus> {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display === 'granted') return 'granted';
    if (display === 'denied') return 'denied';
    return 'default';
  } catch {
    return 'unavailable';
  }
}

export async function notificationPermissionAnfragen(): Promise<NotificationStatus> {
  try {
    const { display } = await LocalNotifications.requestPermissions();
    if (display === 'granted') return 'granted';
    if (display === 'denied') return 'denied';
    return 'default';
  } catch {
    return 'unavailable';
  }
}

export async function reminderPlanen(
  reminder: Reminder,
  bewerbung: Pick<Bewerbung, 'id' | 'firma'>
): Promise<void> {
  if (reminder.erledigt) return;
  const zeitpunkt = new Date(reminder.zeitpunkt);
  if (zeitpunkt.getTime() <= Date.now()) return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: uuidZuId(reminder.id),
          title: bewerbung.firma,
          body: reminder.nachricht,
          schedule: { at: zeitpunkt },
          extra: {
            bewerbungId: bewerbung.id,
            reminderId: reminder.id,
          },
        },
      ],
    });
  } catch (err) {
    console.warn('Notification konnte nicht geplant werden:', err);
  }
}

export async function reminderAbsagen(reminderId: string): Promise<void> {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: uuidZuId(reminderId) }],
    });
  } catch {
    // ignore — cancel of non-existent notification is harmless
  }
}

export async function alleRemindersNeuPlanen(
  bewerbungen: Bewerbung[]
): Promise<void> {
  const status = await notificationStatus();
  if (status !== 'granted') return;

  try {
    const { notifications } = await LocalNotifications.getPending();
    if (notifications.length > 0) {
      await LocalNotifications.cancel({ notifications });
    }
  } catch {
    // ignore
  }

  for (const bewerbung of bewerbungen) {
    for (const reminder of bewerbung.reminders) {
      await reminderPlanen(reminder, bewerbung);
    }
  }
}
