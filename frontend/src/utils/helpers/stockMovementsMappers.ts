import type { StockMovementsDto, StockMovementsSummaryDto } from '@api/models';

import type {
  StockMoveDetail,
  StockMoveRow,
  StockMoveSummary,
} from '../../types/stockMovements.types';

export const mapApiStockMovementToRow = (m: StockMovementsDto): StockMoveRow => ({
  id: m.id ?? 0,
  productId: m.productId ?? 0,
  productName: m.productName ?? '',
  unitName: m.unitName ?? '',
  movementSourceId: m.movementSource ?? 0,
  movementSourceName: m.movementSourceName ?? '',
  movementTypeId: m.movementType ?? 0,
  movementTypeName: m.movementTypeName ?? '',
  qty: m.qty ?? 0,
  unitCost: m.unitCost ?? null,
  unitPrice: m.unitPrice ?? null,
  movementDate: m.movementDate ?? '',
});

export const getCommonUnitLabel = (rows: StockMoveRow[]): string => {
  const units = new Set(rows.map((r) => r.unitName).filter(Boolean));
  return units.size === 1 ? [...units][0] : '';
};

export const mapApiStockMovementSummary = (s: StockMovementsSummaryDto): StockMoveSummary => ({
  totalIn: s.totalIn ?? 0,
  totalOut: s.totalOut ?? 0,
  totalInUnitLabel: s.totalInUnitLabel ?? '',
  totalOutUnitLabel: s.totalOutUnitLabel ?? '',
});

export const mapApiStockMovementDetail = (m: StockMovementsDto): StockMoveDetail => ({
  id: m.id ?? 0,
  productId: m.productId ?? 0,
  productName: m.productName ?? '',
  unitName: m.unitName ?? '',
  movementSourceId: m.movementSource ?? 0,
  movementSourceName: m.movementSourceName ?? '',
  movementTypeId: m.movementType ?? 0,
  movementTypeName: m.movementTypeName ?? '',
  qty: m.qty ?? 0,
  unitCost: m.unitCost ?? null,
  unitPrice: m.unitPrice ?? null,
  averageCostAtMovement: m.averageCostAtMovement ?? null,
  averagePriceAtMovement: m.averagePriceAtMovement ?? null,
  currentAverageCost: m.currentAverageCost ?? null,
  currentAveragePrice: m.currentAveragePrice ?? null,
  movementDate: m.movementDate ?? '',
});
