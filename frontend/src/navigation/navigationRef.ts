import { createNavigationContainerRef } from '@react-navigation/native';

import type { MainStackParamList } from '../types/navigation.types';

export const navigationRef = createNavigationContainerRef<MainStackParamList>();
