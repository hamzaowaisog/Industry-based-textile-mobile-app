import { PermissionsAndroid, Platform } from 'react-native';

import Contacts from 'react-native-contacts';

import i18n from '@utils/i18n';

import type { ContactPickItem } from '../types/contacts.types';

export const normalizePhoneNumber = (raw: string): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  const hasPlusPrefix = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d]/g, '');
  return digits.length > 0 ? `${hasPlusPrefix ? '+' : ''}${digits}` : '';
};

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
};

export const requestContactsPermission = async (): Promise<'granted' | 'denied'> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: i18n.t('clients.contactPicker.permissionTitle'),
          message: i18n.t('clients.contactPicker.permissionBody'),
          buttonPositive: i18n.t('clients.contactPicker.permissionAllow'),
          buttonNegative: i18n.t('common.cancel'),
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
    }
    const requested = await withTimeout(
      Contacts.requestPermission(),
      5000,
      'Contacts.requestPermission()',
    );
    return requested === 'authorized' || requested === 'limited' ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
};

const buildDisplayName = (c: Partial<Contacts.Contact>): string => {
  const first = (c.givenName ?? '').trim();
  const last = (c.familyName ?? '').trim();
  const full = `${first} ${last}`.trim();
  if (full) return full;
  return (c.company ?? '').trim();
};

export const fetchAllContactsWithPhones = async (): Promise<ContactPickItem[]> => {
  const data = await Contacts.getAll();

  const items: ContactPickItem[] = [];
  for (const c of data) {
    const displayName = buildDisplayName(c);
    if (!displayName) continue;
    const phones = c.phoneNumbers ?? [];
    for (const p of phones) {
      const phone = normalizePhoneNumber(p.number ?? '');
      if (!phone) continue;
      const label = (p.label ?? '').trim();
      items.push({
        id: `${c.recordID}-${phone}`,
        displayName,
        phone,
        phoneLabel: label ? label.charAt(0).toUpperCase() + label.slice(1) : undefined,
      });
    }
  }

  items.sort((a, b) => {
    const byName = a.displayName.localeCompare(b.displayName);
    if (byName !== 0) return byName;
    return (a.phoneLabel ?? '').localeCompare(b.phoneLabel ?? '');
  });

  return items;
};
