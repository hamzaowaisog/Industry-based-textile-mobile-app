import type { ComponentType } from 'react';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  RefreshIcon,
  ShoppingBagIcon,
  TruckIcon,
} from '@constants/svgAssets';
import type { IconProps } from '../../types/icon.types';

const { IN, OUT, ADJUSTMENT } = AppConstants.MOVEMENT_TYPE;
const { PURCHASE, SALE, MANUAL } = AppConstants.MOVEMENT_SOURCE;

export const MOVEMENT_TYPE_ICONS: Record<number, ComponentType<IconProps>> = {
  [IN]: ArrowDownIcon,
  [OUT]: ArrowUpIcon,
  [ADJUSTMENT]: RefreshIcon,
};

export const MOVEMENT_SOURCE_ICONS: Record<number, ComponentType<IconProps>> = {
  [PURCHASE]: TruckIcon,
  [SALE]: ShoppingBagIcon,
  [MANUAL]: EditIcon,
};

export const getMovementTypeColor = (movementTypeId: number): string => {
  if (movementTypeId === IN) return colors.success;
  if (movementTypeId === OUT) return colors.danger;
  return colors.primary;
};

export const getMovementTypeLightColor = (movementTypeId: number): string => {
  if (movementTypeId === IN) return colors.successLight;
  if (movementTypeId === OUT) return colors.dangerLight;
  return colors.primaryLight;
};

export const getMovementTypeSign = (movementTypeId: number): string => {
  if (movementTypeId === IN) return '+';
  if (movementTypeId === OUT) return '−';
  return '±';
};
