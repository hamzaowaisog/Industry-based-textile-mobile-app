import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchUsersAsync } from '../core/users';
import type { UserStackParamList } from '../types/navigation.types';
import type { UserFilter } from '../types/users.types';
import { usePdfDownload } from './usePdfDownload';

export const useUserList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<UserFilter>('all');

  const { data, isFetching, refetch } = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: fetchUsersAsync,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const allUsers = useMemo(() => data ?? [], [data]);
  const totalCount = allUsers.length;

  const users = useMemo(() => {
    let result = allUsers.filter((u) => {
      if (filter === 'admin') return u.roleId === AppConstants.ROLES.ADMIN;
      if (filter === 'staff') return u.roleId === AppConstants.ROLES.STAFF;
      return true;
    });

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allUsers, filter, search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const onRowPress = useCallback(
    (userId: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.USER_DETAIL, { userId });
    },
    [navigation],
  );

  const onFab = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CREATE_USER);
  }, [navigation]);

  const onAddFirstUser = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CREATE_USER);
  }, [navigation]);

  const onListPdfPress = useCallback(() => {
    void downloadPdf(AppConstants.PDF.PATHS.USER_LIST, AppConstants.PDF.FILENAMES.USER_LIST);
  }, [downloadPdf]);

  return {
    users,
    totalCount,
    search,
    filter,
    loading: isFetching && !refreshing,
    refreshing,
    onRefresh,
    onSearchChange: setSearch,
    onFilterChange: setFilter,
    onMenuPress,
    onRowPress,
    onFab,
    onAddFirstUser,
    onListPdfPress,
    isPdfDownloading,
  };
};
