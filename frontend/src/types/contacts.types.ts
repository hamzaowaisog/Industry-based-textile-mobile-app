export type ContactPickItem = {
  /** Stable composite id (contactId + phone digits) for React keys */
  id: string;
  /** Display name from the system contact (firstName + lastName or company) */
  displayName: string;
  /** Normalized phone number (digits + optional leading +) */
  phone: string;
  /** Optional label from the system ("Mobile", "Work", "Home", etc.) */
  phoneLabel?: string;
};

export type ContactPickerSheetProps = {
  visible: boolean;
  contacts: ContactPickItem[];
  loading: boolean;
  onClose: () => void;
  onSelect: (item: ContactPickItem) => void;
};
