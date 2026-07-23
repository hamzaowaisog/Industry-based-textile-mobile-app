import { Platform, Share } from 'react-native';

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { AppConstants } from '@constants/appConstants';

import { ensureFreshAccessToken } from '@utils/axiosInstance';
import { arrayBufferToBase64 } from '@utils/helpers/arrayBufferToBase64';

const API_URL: string = Constants.expoConfig?.extra?.apiUrl ?? '';

type PdfResult = { success: boolean; error?: string };

const fetchPdfResponse = async (urlPath: string, token: string): Promise<Response> => {
  return fetch(`${API_URL}/api/${urlPath}`, {
    method: AppConstants.HTTP.METHOD.GET,
    headers: {
      [AppConstants.HTTP.HEADER_AUTHORIZATION]: `${AppConstants.HTTP.AUTH_SCHEME}${token}`,
    },
  });
};

const downloadToCache = async (
  urlPath: string,
  filename: string,
): Promise<{ success: boolean; filePath?: string; error?: string }> => {
  let token = await SecureStore.getItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN);
  if (!token) return { success: false, error: AppConstants.PDF.MESSAGE.NOT_AUTHENTICATED };

  let response = await fetchPdfResponse(urlPath, token);

  if (response.status === AppConstants.HTTP.UNAUTHORIZED) {
    try {
      token = await ensureFreshAccessToken();
    } catch {
      return { success: false, error: AppConstants.PDF.MESSAGE.NOT_AUTHENTICATED };
    }
    response = await fetchPdfResponse(urlPath, token);
  }

  if (response.status !== AppConstants.HTTP.OK) {
    return {
      success: false,
      error: `${AppConstants.PDF.MESSAGE.DOWNLOAD_FAILED} (${response.status})`,
    };
  }

  const destPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${filename}`;
  const base64 = arrayBufferToBase64(await response.arrayBuffer());
  await ReactNativeBlobUtil.fs.writeFile(destPath, base64, AppConstants.PDF.ENCODING.BASE64);

  return { success: true, filePath: destPath };
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
      await Share.share({ url: `${AppConstants.PDF.FILE_URL_SCHEME}${filePath}`, title });
    } else {
      await ReactNativeBlobUtil.android.actionViewIntent(
        filePath,
        AppConstants.PDF.MIME_TYPE,
      );
    }

    return { success: true };
  } catch {
    return { success: false, error: AppConstants.PDF.MESSAGE.SHARE_FAILED };
  }
};
