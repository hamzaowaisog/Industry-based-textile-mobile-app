import * as Yup from 'yup';

import i18n from '@utils/i18n';

export const productCreateValidationSchema = Yup.object({
  name: Yup.string().trim().required(() => i18n.t('products.validationNameRequired')),
  sku: Yup.string().trim().required(() => i18n.t('products.validationSkuRequired')),
  unit: Yup.string().trim().required(() => i18n.t('products.validationUnitRequired')),
  defaultCost: Yup.string()
    .required(() => i18n.t('products.validationCostInvalid'))
    .test('is-valid-cost', () => i18n.t('products.validationCostInvalid'), (v) => {
      const n = parseFloat(v ?? '');
      return !isNaN(n) && n >= 0;
    }),
  defaultPrice: Yup.string()
    .required(() => i18n.t('products.validationPriceInvalid'))
    .test('is-valid-price', () => i18n.t('products.validationPriceInvalid'), (v) => {
      const n = parseFloat(v ?? '');
      return !isNaN(n) && n >= 0;
    }),
  quantity: Yup.string()
    .required(() => i18n.t('products.validationQtyInvalid'))
    .test('is-valid-qty', () => i18n.t('products.validationQtyInvalid'), (v) => {
      const n = parseFloat(v ?? '');
      return !isNaN(n) && n >= 0;
    }),
  reorderLevel: Yup.string()
    .required(() => i18n.t('products.validationReorderInvalid'))
    .test('is-valid-reorder', () => i18n.t('products.validationReorderInvalid'), (v) => {
      const n = parseFloat(v ?? '');
      return !isNaN(n) && n >= 0;
    }),
});

export const productEditValidationSchema = Yup.object({
  name: Yup.string().trim().required(() => i18n.t('products.validationNameRequired')),
  unit: Yup.string().trim().required(() => i18n.t('products.validationUnitRequired')),
  defaultCost: Yup.string()
    .required(() => i18n.t('products.validationCostInvalid'))
    .test('is-valid-cost', () => i18n.t('products.validationCostInvalid'), (v) => {
      const n = parseFloat(v ?? '');
      return !isNaN(n) && n >= 0;
    }),
  defaultPrice: Yup.string()
    .required(() => i18n.t('products.validationPriceInvalid'))
    .test('is-valid-price', () => i18n.t('products.validationPriceInvalid'), (v) => {
      const n = parseFloat(v ?? '');
      return !isNaN(n) && n >= 0;
    }),
  reorderLevel: Yup.string()
    .required(() => i18n.t('products.validationReorderInvalid'))
    .test('is-valid-reorder', () => i18n.t('products.validationReorderInvalid'), (v) => {
      const n = parseFloat(v ?? '');
      return !isNaN(n) && n >= 0;
    }),
});
