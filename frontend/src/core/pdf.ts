import { Platform } from 'react-native';

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { AppConstants } from '@constants/appConstants';

const API_URL: string = Constants.expoConfig?.extra?.apiUrl ?? '';

export const downloadAndOpenPdf = async (
  urlPath: string,
  filename: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = await SecureStore.getItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN);
    if (!token) return { success: false, error: AppConstants.PDF.MESSAGE.NOT_AUTHENTICATED };

    const destPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${filename}`;

    const res = await ReactNativeBlobUtil.config({
      path: destPath,
      overwrite: true,
    }).fetch(AppConstants.HTTP.METHOD.GET, `${API_URL}/api/${urlPath}`, {
      [AppConstants.HTTP.HEADER_AUTHORIZATION]: `${AppConstants.HTTP.AUTH_SCHEME}${token}`,
    });

    const status = res.info().status;
    if (status !== AppConstants.HTTP.OK) {
      return { success: false, error: `${AppConstants.PDF.MESSAGE.DOWNLOAD_FAILED} (${status})` };
    }

    const filePath = res.path();

    if (Platform.OS === AppConstants.PLATFORM.OS.IOS) {
      await ReactNativeBlobUtil.ios.openDocument(filePath);
    } else {
      await ReactNativeBlobUtil.android.actionViewIntent(
        filePath,
        AppConstants.PDF.MIME_TYPE,
        AppConstants.PDF.ANDROID_CHOOSER_TITLE,
      );
    }

    return { success: true };
  } catch (e: unknown) {
    if (e instanceof Error) {
      const code = (e as NodeJS.ErrnoException).code;
      if (code === AppConstants.PDF.ERROR_CODE.NO_APP)
        return { success: false, error: AppConstants.PDF.ERROR.NO_APP };
      if (code === AppConstants.PDF.ERROR_CODE.CANNOT_PREVIEW)
        return { success: false, error: AppConstants.PDF.ERROR.CANNOT_PREVIEW };
    }
    const msg = e instanceof Error ? e.message : AppConstants.PDF.MESSAGE.UNKNOWN_ERROR;
    return { success: false, error: msg };
  }
};
