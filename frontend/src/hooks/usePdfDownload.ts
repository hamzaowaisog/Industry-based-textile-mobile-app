import { useCallback, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { showError } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import { downloadAndOpenPdf } from '../core/pdf';

export const usePdfDownload = () => {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const isDownloadingRef = useRef(false);

  const downloadPdf = useCallback(
    async (urlPath: string, filename: string) => {
      if (isDownloadingRef.current) return;
      isDownloadingRef.current = true;
      setIsDownloading(true);
      const result = await downloadAndOpenPdf(urlPath, filename);
      isDownloadingRef.current = false;
      setIsDownloading(false);
      if (!result.success) {
        const message =
          result.error === AppConstants.PDF.ERROR.NO_APP
            ? t('pdf.errorNoPdfApp')
            : result.error === AppConstants.PDF.ERROR.CANNOT_PREVIEW
              ? t('pdf.errorCannotPreview')
              : (result.error ?? t('pdf.errorGeneric'));
        showError(t('pdf.errorTitle'), message);
        console.log('message', message);
      }
    },
    [t],
  );

  return { downloadPdf, isDownloading };
};
