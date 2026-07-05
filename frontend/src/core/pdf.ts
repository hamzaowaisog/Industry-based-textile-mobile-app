import { Platform, Share } from 'react-native';

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { AppConstants } from '@constants/appConstants';

const API_URL: string = Constants.expoConfig?.extra?.apiUrl ?? '';

type PdfResult = { success: boolean; error?: string };

const downloadToCache = async (
  urlPath: string,
  filename: string,
): Promise<{ success: boolean; filePath?: string; error?: string }> => {
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

  return { success: true, filePath: res.path() };
};

const toErrorMessage = (e: unknown): string => {
  if (e instanceof Error) {
    const code = (e as { code?: string }).code;
    if (code === AppConstants.PDF.ERROR_CODE.NO_APP) return AppConstants.PDF.ERROR.NO_APP;
    if (code === AppConstants.PDF.ERROR_CODE.CANNOT_PREVIEW)
      return AppConstants.PDF.ERROR.CANNOT_PREVIEW;
    return e.message;
  }
  return AppConstants.PDF.MESSAGE.UNKNOWN_ERROR;
};

export const downloadAndOpenPdf = async (urlPath: string, filename: string): Promise<PdfResult> => {
  try {
    const downloaded = await downloadToCache(urlPath, filename);
    if (!downloaded.success || !downloaded.filePath) {
      return { success: false, error: downloaded.error };
    }

    const filePath = downloaded.filePath;

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
    return { success: false, error: toErrorMessage(e) };
  }
};

export const downloadAndSharePdf = async (
  urlPath: string,
  filename: string,
  title: string,
): Promise<PdfResult> => {
  try {
    const downloaded = await downloadToCache(urlPath, filename);
    if (!downloaded.success || !downloaded.filePath) {
      return { success: false, error: downloaded.error };
    }

    const filePath = downloaded.filePath;

    if (Platform.OS === AppConstants.PLATFORM.OS.IOS) {
      // iOS: open the native share sheet with the cached PDF attached.
      // Cancel resolves rather than rejects in this RN version, so no options arg is needed.
      await Share.share({ url: `${AppConstants.PDF.FILE_URL_SCHEME}${filePath}`, title });
    } else {
      // Android: ACTION_VIEW chooser — lists PDF-capable apps (WhatsApp, Mail, Drive) that share the file.
      await ReactNativeBlobUtil.android.actionViewIntent(
        filePath,
        AppConstants.PDF.MIME_TYPE,
        title,
      );
    }

    return { success: true };
  } catch {
    // Any throw during the share step (sheet dismissed with error, no handler app, etc.)
    // is surfaced as a share-specific failure — the hook maps it to a user message.
    return { success: false, error: AppConstants.PDF.MESSAGE.SHARE_FAILED };
  }
};
