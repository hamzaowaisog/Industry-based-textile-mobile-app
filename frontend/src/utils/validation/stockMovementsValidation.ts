import * as Yup from 'yup';

import { AppConstants } from '@constants/appConstants';

import { positiveDecimalString } from './validators';

const stockMoveFieldsSchema = {
  productId: Yup.number()
    .nullable()
    .required('stockMovements.validation.productRequired')
    .min(1, 'stockMovements.validation.productRequired'),
  movementSource: Yup.number()
    .required('stockMovements.validation.sourceRequired')
    .oneOf([1, 2, 3], 'stockMovements.validation.sourceRequired'),
  movementType: Yup.number()
    .nullable()
    .when('movementSource', {
      is: AppConstants.MOVEMENT_SOURCE.MANUAL,
      then: (schema) =>
        schema
          .required('stockMovements.validation.typeRequired')
          .oneOf([1, 2, 3], 'stockMovements.validation.typeRequired'),
      otherwise: (schema) => schema.notRequired(),
    }),
  qty: positiveDecimalString(
    'stockMovements.validation.qtyRequired',
    'stockMovements.validation.qtyPositive',
  ),
  unitCost: Yup.string().test(
    'is-positive-if-present',
    () => 'stockMovements.validation.unitCostPositive',
    (v) => {
      if (!v || !v.trim()) return true;
      const n = parseFloat(v);
      return !Number.isNaN(n) && n > 0;
    },
  ),
  unitPrice: Yup.string().test(
    'is-positive-if-present',
    () => 'stockMovements.validation.unitPricePositive',
    (v) => {
      if (!v || !v.trim()) return true;
      const n = parseFloat(v);
      return !Number.isNaN(n) && n > 0;
    },
  ),
};

export const addStockMoveValidationSchema = Yup.object(stockMoveFieldsSchema);

export const editStockMoveValidationSchema = Yup.object(stockMoveFieldsSchema);
