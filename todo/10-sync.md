# Offline Sync — Backend Endpoints

**Epic:** 7 — Staff can work offline and sync data
**Status:** 🔴 Not Started — decision needed first

## What Already Exists

- All core entities have `CreatedAt` (DateTime) timestamps — delta sync is possible
- `Order`, `Client`, `Payment`, `Expense`, `Transaction`, `StockMovement` all have `CreatedAt`
- No `UpdatedAt` field exists on any entity yet — needed for delta sync of updates
- No sync endpoint, no SyncService, no SyncDto

## Decision Required Before Coding

- [ ] **Choose conflict resolution strategy:**
  - Option A: **Server-wins** — server version always overwrites; simplest
  - Option B: **Last-write-wins** — compare `UpdatedAt` timestamps; client wins if newer
  - Option C: **Per-entity rules** — e.g. financial amounts server-wins, notes last-write-wins
  - Document the chosen strategy in `_bmad-output/planning-artifacts/architecture.md`

## Tasks

### Schema Change — Add `UpdatedAt` to Entities

- [ ] Add `UpdatedAt (DateTime?)` to: `Client`, `Order`, `Payment`, `Expense`, `Transaction`, `StockMovement`, `Product`, `Purchase`
- [ ] Create and apply EF migration: `dotnet ef migrations add AddUpdatedAtToSyncableEntities`

### Models / DTOs (`Models/`)

- [ ] Create `SyncDto.cs`:
  - `SyncPushDto` — contains arrays: `Clients[]`, `Orders[]`, `Payments[]`, `Expenses[]`, `StockMovements[]` each with a `localId` and `updatedAt`
  - `SyncPullResponseDto` — arrays of server-changed entities since `lastSyncedAt`
  - `SyncItemResultDto` — per-item result: `{ localId, serverId, status: "accepted"|"rejected"|"conflict", errors[] }`
  - `SyncPushResultDto` — full push result: `{ accepted[], rejected[], conflicts[], serverTime }`

### Service Layer (`Services/`)

- [ ] Create `ISyncService` interface with:
  - `Task<Response<SyncPushResultDto>> PushAsync(SyncPushDto model, int userId)`
  - `Task<Response<SyncPullResponseDto>> PullAsync(DateTime since, int userId)`
- [ ] Create `SyncService` implementing `ISyncService`
  - Reuse existing service methods (`IClientService`, `IOrderService`, etc.) internally
  - Apply conflict strategy from the decision above
- [ ] Register as Scoped in `Program.cs`

### Controller (`Controllers/SyncController.cs`)

- [ ] `POST /api/Sync/push` — mobile sends batch of offline changes (Authenticated)
  - Returns: `SyncPushResultDto` with accepted/rejected/conflict breakdown
- [ ] `GET /api/Sync/pull?since=<ISO8601>` — mobile pulls server changes since timestamp (Authenticated)
  - Returns all entities changed after `since` for the authenticated user's scope
- [ ] `GET /api/Sync/ping` — lightweight health check returning server `DateTime.UtcNow` (Authenticated)
  - Used by mobile to confirm connectivity and get server time for sync

## Notes

- Make all sync endpoints idempotent — mobile may retry on network failure
- Use `since` parameter as ISO 8601 UTC string (e.g. `2026-04-10T12:00:00Z`)
- Push should validate each item individually; one rejection must not fail the whole batch
- FR13: local capture without data loss; FR14: sync when online; FR15: conflict handling; FR16: sync status via `SyncPushResultDto`
