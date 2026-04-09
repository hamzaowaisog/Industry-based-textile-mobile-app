# Push Notifications

**Epic:** 10 — Push notifications for sync and alerts
**Status:** 🔴 Not Started — provider decision needed first

## What Already Exists

- `ApplicationUser` entity — no device token field yet
- No push infrastructure, no device registration endpoint

## Decision Required Before Coding

- [ ] **Choose push provider:**
  - Option A: **Expo Push** — simplest for current Expo managed workflow; no FCM setup; free tier generous
  - Option B: **Firebase FCM** — more control; required if moving to bare React Native workflow later
  - Recommended: start with Expo Push for MVP since the frontend already uses Expo

## Tasks

### Schema Change

- [ ] Add `DevicePushToken (string?)` to `ApplicationUser` entity
- [ ] Create and apply EF migration: `dotnet ef migrations add AddDevicePushTokenToUser`

### Service Layer (`Services/`)

- [ ] Create `IPushNotificationService` interface with:
  - `Task SendAsync(string deviceToken, string title, string body, object? data = null)`
  - `Task SendToUserAsync(int userId, string title, string body, object? data = null)`
- [ ] Create `PushNotificationService` implementing `IPushNotificationService`
  - For Expo: POST to `https://exp.host/--/api/v2/push/send` with token + message
  - For FCM: use Firebase Admin SDK
- [ ] Add push provider credentials/URL to `appsettings.json`
- [ ] Register as Singleton in `Program.cs` (stateless HTTP client)

### Models / DTOs (`Models/`)

- [ ] Create `DeviceRegistrationDto.cs`:
  - `RegisterDeviceDto` — `{ PushToken: string }`

### Controller (`Controllers/DeviceController.cs`)

- [ ] `POST /api/Device/register` — save push token to `ApplicationUser.DevicePushToken` (Authenticated)
- [ ] `DELETE /api/Device/unregister` — clear push token on logout (Authenticated)

### Integration Points — call `IPushNotificationService.SendToUserAsync` from:

- [ ] `SyncService.PushAsync` — after successful sync: "Your data has been synced"
- [ ] `SyncService.PushAsync` — on partial failure: "Some items failed to sync"
- [ ] Optional: `OrderService.CreateAsync` or `UpdateByIdAsync` — notify assigned staff of new/updated order

## Notes

- On user logout (`AuthController.logout`), call device unregister or clear `DevicePushToken` in DB
- A user may use multiple devices; if so, change `DevicePushToken` to a separate `DeviceToken` table (one-to-many). For MVP, single token per user is fine.
- Document device token handling in privacy/store compliance notes before app store submission (FR23)
