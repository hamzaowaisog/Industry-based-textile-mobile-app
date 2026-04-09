# Users — Admin Create Endpoint

**Epic:** 2 — Admins can manage users and roles
**Status:** 🔴 Not Started

## What Already Exists

- `UsersController` has: `GET /{id}`, `GET /` (all), `PUT /me`, `DELETE /{id}` (AdminOnly), `GET /pdf`
- `IUserService` has: `SignupAsync`, `GetByIdAsync`, `GetAllAsync`, `UpdateByIdAsync`, `DeleteByIdAsync`, `ResendEmailConfirmationAsync`, `ForgotPasswordAsync`, `ResetPasswordAsync`, `EmailConfirmationTokenAsync`
- `CreateUserDto` exists with all needed fields: Name, Email, UserName, Password, ConfirmPassword, RoleId, IsActive, PhoneNumber
- `UserCreateViewModel` exists in `Services/ViewModel/UserViewModel.cs`
- `AuthController.Register` does the public-facing registration (requires email confirmation)
- Registration via `AuthController` sends confirmation email — not suitable for admin creating internal staff accounts

## What's Missing

- `POST /api/Users` endpoint for an admin to create a user account that is **pre-confirmed** (no email flow needed)
- `IUserService` method: `AdminCreateAsync(CreateUserDto model)` — skips email confirmation, auto-confirms

## Tasks

- [ ] Add `Task<Response<UserDto>> AdminCreateAsync(CreateUserDto model)` to `IUserService` interface
- [ ] Implement `AdminCreateAsync` in `UserService`:
  - Call `_userManager.CreateAsync(user, password)`
  - Call `_userManager.GenerateEmailConfirmationTokenAsync(user)` then `_userManager.ConfirmEmailAsync(user, token)` to auto-confirm
  - Assign `user.RoleId` and `user.IsActive` from the DTO
  - Return `Response<UserDto>.SuccessResponse(...)`
- [ ] Add `POST /api/Users` to `UsersController` with `[Authorize(Policy = "AdminOnly")]`
  - Body: `UserCreateViewModel` (already exists)
  - Call `_userService.AdminCreateAsync(...)`
  - Return `ToActionResult(response)`

## Notes

- `UserCreateViewModel` is already the correct input shape — no new ViewModel needed
- `CreateUserDto` already has all fields — no new DTO needed
- Do NOT reuse `SignupAsync` — that one requires email confirmation and is for self-registration
- After admin creates user, the user can log in immediately without any email confirmation step
- FR5: Admin can manage users (create, update, list) and assign roles
