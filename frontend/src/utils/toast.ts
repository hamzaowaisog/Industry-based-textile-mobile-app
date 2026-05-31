import Toast from 'react-native-toast-message';

export const showSuccess = (title: string, message?: string) => {
  Toast.show({ type: 'success', text1: title, text2: message, visibilityTime: 3000 });
};

export const showError = (title: string, message?: string) => {
  Toast.show({ type: 'error', text1: title, text2: message, visibilityTime: 4000 });
};

export const showWarning = (title: string, message?: string) => {
  Toast.show({ type: 'warning', text1: title, text2: message, visibilityTime: 3500 });
};
