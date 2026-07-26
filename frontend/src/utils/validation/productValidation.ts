import * as Yup from 'yup';

import i18n from '@utils/i18n';

import { optionalNonNegativeDecimalString, positiveDecimalString } from './validators';

export const productCreateValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required(() => i18n.t('products.validationNameRequired')),
  sku: Yup.string()
    .trim()
    .required(() => i18n.t('products.validationSkuRequired')),
  unitId: Yup.number().min(1, () => i18n.t('products.validationUnitRequired')),
  defaultCost: positiveDecimalString(
    'products.validationCostInvalid',
    'products.validationCostInvalid',
  ),
  defaultPrice: positiveDecimalString(
    'products.validationPriceInvalid',
    'products.validationPriceInvalid',
  ),
  quantity: optionalNonNegativeDecimalString('products.validationQtyInvalid'),
  reorderLevel: optionalNonNegativeDecimalString('products.validationReorderInvalid'),
});

export const productEditValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required(() => i18n.t('products.validationNameRequired')),
  unitId: Yup.number().min(1, () => i18n.t('products.validationUnitRequired')),
  defaultCost: positiveDecimalString(
    'products.validationCostInvalid',
    'products.validationCostInvalid',
  ),
  defaultPrice: positiveDecimalString(
    'products.validationPriceInvalid',
    'products.validationPriceInvalid',
  ),
  reorderLevel: optionalNonNegativeDecimalString('products.validationReorderInvalid'),
});
