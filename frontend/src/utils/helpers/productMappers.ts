import { AppConstants } from '@constants/appConstants';

import type {
  MovementKind,
  ProductDetailData,
  ProductMovementRow,
  ProductRow,
} from '../../types/products.types';

export const mapApiProductToRow = (p: any): ProductRow => {
  const stock: number = p.quantity ?? 0;
  const reorderLevel: number = p.reorderLevel ?? 0;
  return {
    id: p.id ?? 0,
    name: p.name ?? '',
    sku: p.sku ?? '',
    unitName: p.unitName ?? '',
    stock,
    availableQuantity: p.availableQuantity ?? stock,
    reorderLevel,
    avgPrice: p.averagePrice ?? p.defaultPrice ?? 0,
    isOut: stock === 0,
    isLow: stock > 0 && stock < reorderLevel,
  };
};

export const mapApiProductToDetail = (p: any): ProductDetailData => ({
  id: p.id ?? 0,
  name: p.name ?? '',
  sku: p.sku ?? '',
  unitId: p.unitId ?? 0,
  unitName: p.unitName ?? '',
  stock: p.quantity ?? 0,
  availableQuantity: p.availableQuantity ?? p.quantity ?? 0,
  averageCost: p.averageCost ?? p.defaultCost ?? 0,
  averagePrice: p.averagePrice ?? p.defaultPrice ?? 0,
  defaultCost: p.defaultCost ?? 0,
  defaultPrice: p.defaultPrice ?? 0,
  reorderLevel: p.reorderLevel ?? 0,
  isActive: p.isActive ?? true,
});

const toQty = (qty: number): number => Number(qty) || 0;

export const mapApiMovementToRow = (m: any): ProductMovementRow => {
  const typeId: number = m.movementType ?? 1;
  const sourceName: string = m.movementSourceName ?? '';

  let kind: MovementKind;
  if (typeId === AppConstants.MOVEMENT_TYPE.IN) kind = 'in';
  else if (typeId === AppConstants.MOVEMENT_TYPE.OUT) kind = 'out';
  else kind = 'adj';

  const rawDate: string = m.movementDate ?? '';

  return {
    id: m.id ?? 0,
    kind,
    qty: toQty(m.qty),
    note: sourceName,
    date: rawDate,
    rawDate,
  };
};

const parseMovementDate = (raw: string): number => {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

const sortMovementsChronologically = (movements: ProductMovementRow[]): ProductMovementRow[] =>
  [...movements].sort((a, b) => {
    const diff = parseMovementDate(a.rawDate) - parseMovementDate(b.rawDate);
    return diff !== 0 ? diff : a.id - b.id;
  });

export const buildChartData = (movements: ProductMovementRow[], currentStock: number): number[] => {
  if (movements.length === 0) {
    return currentStock > 0 ? [currentStock, currentStock] : [];
  }

  const sorted = sortMovementsChronologically(movements);
  let running = toQty(currentStock);
  let points: number[] = [running];

  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const m = sorted[i];
    if (m.kind === 'in') running -= m.qty;
    else if (m.kind === 'out') running += m.qty;
    points.unshift(Math.max(0, running));
  }

  if (points[0] === 0 && points.length > 1 && sorted.length > 1) {
    points = points.slice(1);
  }

  return points.length === 1 ? [points[0], points[0]] : points;
};

export const computeTrendPct = (chartData: number[]): number | null => {
  if (chartData.length < 2) return null;
  const first = chartData[0];
  if (first === 0) return null;
  return ((chartData[chartData.length - 1] - first) / first) * 100;
};
