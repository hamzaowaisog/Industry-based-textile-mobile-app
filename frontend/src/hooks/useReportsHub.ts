import { useCallback, useState } from 'react';

import { DrawerActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import type { ReportStackParamList } from '../types/navigation.types';
import type { ReportKey } from '../types/reports.types';
import { usePdfDownload } from './usePdfDownload';

const SM = AppConstants.SCREENS.MAIN;

const REPORT_ROUTES: Record<ReportKey, keyof ReportStackParamList> = {
  profitLoss: SM.PROFIT_LOSS,
  clientBalance: SM.CLIENT_BALANCE,
  creditDebit: SM.CREDIT_DEBIT,
  summary: SM.SUMMARY_REPORT,
  clientDetail: SM.CLIENT_DETAIL_REPORT,
};

const REPORT_PDF: Record<ReportKey, { path: string; filename: string }> = {
  profitLoss: {
    path: AppConstants.PDF.PATHS.profitLoss(),
    filename: AppConstants.PDF.FILENAMES.profitLoss(),
  },
  clientBalance: {
    path: AppConstants.PDF.PATHS.CLIENT_BALANCE_LIST,
    filename: AppConstants.PDF.FILENAMES.CLIENT_BALANCE_LIST,
  },
  creditDebit: {
    path: AppConstants.PDF.PATHS.creditDebit(),
    filename: AppConstants.PDF.FILENAMES.creditDebit(),
  },
  summary: {
    path: AppConstants.PDF.PATHS.SUMMARY_REPORT,
    filename: AppConstants.PDF.FILENAMES.SUMMARY_REPORT,
  },
  clientDetail: {
    path: AppConstants.PDF.PATHS.CLIENT_DETAIL_LIST,
    filename: AppConstants.PDF.FILENAMES.CLIENT_DETAIL_LIST,
  },
};

export const useReportsHub = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ReportStackParamList>>();
  const { downloadPdf, isDownloading } = usePdfDownload();
  const [pdfDownloadingReport, setPdfDownloadingReport] = useState<ReportKey | null>(null);

  const onMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const onSelectReport = useCallback(
    (report: ReportKey) => {
      navigation.navigate(REPORT_ROUTES[report] as never);
    },
    [navigation],
  );

  const onReportPdfPress = useCallback(
    async (report: ReportKey) => {
      setPdfDownloadingReport(report);
      const { path, filename } = REPORT_PDF[report];
      await downloadPdf(path, filename);
      setPdfDownloadingReport(null);
    },
    [downloadPdf],
  );

  return {
    onSelectReport,
    onMenuPress,
    onReportPdfPress,
    pdfDownloadingReport: isDownloading ? pdfDownloadingReport : null,
  };
};
