import { useCallback, useState } from 'react';

import { fetchAllContactsWithPhones, requestContactsPermission } from '../core/contacts';
import { showError } from '@utils/toast';
import i18n from '@utils/i18n';

import type { ContactPickItem } from '../types/contacts.types';

export type UseContactPickerResult = {
  pickerVisible: boolean;
  permissionModalVisible: boolean;
  contacts: ContactPickItem[];
  loading: boolean;
  error: string | null;
  openPicker: () => Promise<void>;
  closePicker: () => void;
  closePermissionModal: () => void;
};

export const useContactPicker = (): UseContactPickerResult => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [contacts, setContacts] = useState<ContactPickItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = useCallback(async () => {
    const status = await requestContactsPermission();
    if (status !== 'granted') {
      setPermissionModalVisible(true);
      return;
    }

    setPickerVisible(true);
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllContactsWithPhones();
      setContacts(list);
      if (list.length === 0) {.
        showError(
          i18n.t('clients.contactPicker.emptyTitle'),
          i18n.t('clients.contactPicker.emptySubtitle'),
        );
      }
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to load contacts';
      setError(msg);
      showError(i18n.t('common.errorGeneric'), msg);
      setPickerVisible(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const closePicker = useCallback(() => setPickerVisible(false), []);
  const closePermissionModal = useCallback(() => setPermissionModalVisible(false), []);

  return {
    pickerVisible,
    permissionModalVisible,
    contacts,
    loading,
    error,
    openPicker,
    closePicker,
    closePermissionModal,
  };
};
