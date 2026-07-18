import { useCallback, useState } from 'react';

import { Alert } from 'react-native';

import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import i18n from '@utils/i18n';
import { showSuccess } from '@utils/toast';

import { queryKeys } from '@constants/queryKeys';

import { deleteUserAsync, fetchUserByIdAsync } from '../core/users';
import type { UserStackParamList } from '../types/navigation.types';

export const useUserDetail = () => {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const route = useRoute<RouteProp<UserStackParamList, 'UserDetail'>>();
  const { userId } = route.params;
  const queryClient = useQueryClient();

  const [submitting, setSubmitting] = useState(false);

  const {
    data: user,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => fetchUserByIdAsync(userId),
    enabled: !!userId,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onDelete = useCallback(() => {
    if (!user) return;
    Alert.alert(
      i18n.t('users.deleteTitle'),
      i18n.t('users.deleteMessage', { name: user.name }),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            const result = await deleteUserAsync(userId);
            setSubmitting(false);
            if (result.success) {
              showSuccess(i18n.t('users.deleteSuccess'), '');
              void queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
              navigation.goBack();
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [user, userId, navigation, queryClient]);

  return {
    user: user ?? null,
    loading: isFetching,
    submitting,
    onBack,
    onDelete,
  };
};
