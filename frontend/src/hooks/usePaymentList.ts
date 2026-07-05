import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { usePaymentStore } from '@stores/paymentStore';

import { PAYMENT_DIRECTION_TAB_ID_MAP, isPaymentReceived } from '@utils/helpers/paymentContent';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchPaymentsPageAsync } from '../core/payments';
import type { PaymentStackParamList } from '../types/navigation.types';
import type { PaymentDirectionTab, PaymentRow } from '../types/payments.types';
import { usePdfDownload } from './usePdfDownload';

export const usePaymentList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<PaymentStackParamList>>();
  const { prepareDetailLoad } = usePaymentStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<PaymentDirectionTab>('all');
  const [search, setSearch] = useState('');
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      { items: PaymentRow[]; hasNextPage: boolean },
      Error,
      InfiniteData<{ items: PaymentRow[]; hasNextPage: boolean }>,
      string[],
      number
    >({
      queryKey: queryKeys.payments.list(),
      queryFn: ({ pageParam }) =>
        fetchPaymentsPageAsync(pageParam, AppConstants.PAGINATION.DEFAULT_PAGE_SIZE),
      initialPageParam: AppConstants.PAGINATION.DEFAULT_PAGE as number,
      getNextPageParam: (lastPage, pages) => (lastPage.hasNextPage ? pages.length + 1 : undefined),
      staleTime: 0,
    });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const allPayments = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const filtered = useMemo(() => {
    let result = allPayments;
    const directionId = PAYMENT_DIRECTION_TAB_ID_MAP[activeTab];
    if (directionId !== null) {
      result = result.filter((p) => p.paymentDirectionId === directionId);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.partyClientName.toLowerCase().includes(q));
    }
    return result;
  }, [allPayments, activeTab, search]);

  const totalReceived = useMemo(
    () =>
      allPayments
        .filter((p) => !p.isReversed && isPaymentReceived(p.paymentDirectionId))
        .reduce((sum, p) => sum + p.amount, 0),
    [allPayments],
  );

  const totalPaid = useMemo(
    () =>
      allPayments
        .filter((p) => !p.isReversed && !isPaymentReceived(p.paymentDirectionId))
        .reduce((sum, p) => sum + p.amount, 0),
    [allPayments],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const onPress = useCallback(
    (id: number) => {
      prepareDetailLoad();
      navigation.navigate(AppConstants.SCREENS.MAIN.PAYMENT_DETAIL, { paymentId: id });
    },
    [navigation, prepareDetailLoad],
  );

  const onRecordPayment = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.RECORD_PAYMENT, undefined);
  }, [navigation]);

  const onListPdfPress = useCallback(() => {
    void downloadPdf(AppConstants.PDF.PATHS.PAYMENT_LIST, AppConstants.PDF.FILENAMES.PAYMENT_LIST);
  }, [downloadPdf]);

  return {
    payments: filtered,
    totalCount: allPayments.length,
    totalReceived,
    totalPaid,
    search,
    activeTab,
    loading: isFetching && !refreshing && !isFetchingNextPage,
    refreshing,
    isFetchingNextPage,
    onTabChange: setActiveTab,
    onSearchChange: setSearch,
    onRefresh,
    onEndReached,
    onMenuPress,
    onPress,
    onRecordPayment,
    onListPdfPress,
    isPdfDownloading,
  };
};
