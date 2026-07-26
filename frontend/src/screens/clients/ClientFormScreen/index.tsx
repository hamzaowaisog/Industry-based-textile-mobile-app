import React, { useCallback } from 'react';

import { Linking } from 'react-native';

import { useTranslation } from 'react-i18next';

import { ContactPickerSheet } from '@components/common/ContactPickerSheet';
import { AppPermissionModal } from '@components/common/AppPermissionModal';
import { ClientFormComponent } from '@components/clients/ClientFormComponent';
import { useClientForm } from '@hooks/useClientForm';
import { useContactPicker } from '@hooks/useContactPicker';

import { colors } from '@theme/colors';

import { AddressBookIcon } from '@constants/svgAssets';

import type { ContactPickItem } from '../../../types/contacts.types';

export const ClientFormScreen = () => {
  const { t } = useTranslation();
  const hookResult = useClientForm();
  const picker = useContactPicker();

  const handlePick = useCallback(
    (item: ContactPickItem) => {
      hookResult.setFieldValue('phone', item.phone);
      if (!hookResult.values.name.trim()) {
        hookResult.setFieldValue('name', item.displayName);
      }
    },
    [hookResult],
  );

  const contactPickerElement = (
    <>
      <ContactPickerSheet
        visible={picker.pickerVisible}
        contacts={picker.contacts}
        loading={picker.loading}
        onClose={picker.closePicker}
        onSelect={handlePick}
      />
      <AppPermissionModal
        visible={picker.permissionModalVisible}
        Icon={AddressBookIcon}
        iconColor={colors.primary}
        title={t('clients.contactPicker.permissionTitle')}
        body={t('clients.contactPicker.permissionBody')}
        primaryLabel={t('clients.contactPicker.permissionPrimary')}
        secondaryLabel={t('clients.contactPicker.permissionSecondary')}
        onPrimary={() => {
          picker.closePermissionModal();
          Linking.openSettings();
        }}
        onSecondary={picker.closePermissionModal}
      />
    </>
  );

  return (
    <ClientFormComponent
      {...hookResult}
      onOpenContactPicker={picker.openPicker}
      contactPicker={contactPickerElement}
    />
  );
};
