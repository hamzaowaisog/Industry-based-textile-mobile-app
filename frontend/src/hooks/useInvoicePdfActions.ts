import { useCallback, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { showError } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import { downloadAndOpenPdf, downloadAndSharePdf } from '../core/pdf';
import type { InvoicePdfAction, InvoiceRow } from '../types/invoices.types';

export const useInvoicePdfActions = () => {
  const { t } = useTranslation();
  const [activePdfId, setActivePdfId] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<InvoicePdfAction | null>(null);
  // Ref guard keeps runAction (and thus onViewPdf/onSharePdf) referentially stable so
  // non-active cards don't re-render, and prevents two downloads clobbering one cache file.
  const busyRef = useRef(false);

  const runAction = useCallback(
    async (invoice: InvoiceRow, action: InvoicePdfAction) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setActivePdfId(invoice.id);
      setActiveAction(action);

      const urlPath = AppConstants.PDF.PATHS.invoiceDossier(invoice.id);
      const filename = AppConstants.PDF.FILENAMES.invoiceDossier(invoice.id);

      const result =
        action === 'view'
          ? await downloadAndOpenPdf(urlPath, filename)
          : await downloadAndSharePdf(urlPath, filename, AppConstants.PDF.SHARE_TITLE);

      setActivePdfId(null);
      setActiveAction(null);
      busyRef.current = false;

      if (!result.success) {
        const err = result.error;
        let message: string;
        if (err === AppConstants.PDF.ERROR.NO_APP) message = t('pdf.errorNoPdfApp');
        else if (err === AppConstants.PDF.ERROR.CANNOT_PREVIEW)
          message = t('pdf.errorCannotPreview');
        else if (err === AppConstants.PDF.MESSAGE.SHARE_FAILED) message = t('pdf.errorShare');
        else message = err ?? t('pdf.errorGeneric');
        showError(t('pdf.errorTitle'), message);
      }
    },
    [t],
  );

  const onViewPdf = useCallback(
    (invoice: InvoiceRow) => void runAction(invoice, 'view'),
    [runAction],
  );

  const onSharePdf = useCallback(
    (invoice: InvoiceRow) => void runAction(invoice, 'share'),
    [runAction],
  );

  return { onViewPdf, onSharePdf, activePdfId, activeAction };
};
