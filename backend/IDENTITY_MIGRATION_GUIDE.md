# ASP.NET Identity Migration Guide

## Overview

This guide will help you migrate from your custom User table to ASP.NET Identity. This is a significant architectural change that will provide better security, built-in features, and industry-standard authentication.

## Current State

- Custom `User` entity with BCrypt password hashing
- JWT authentication with custom claims
- MySQL database
- Custom `UserRole` entity
- Manual password validation and user management

## Benefits of ASP.NET Identity

1. **Built-in Security**: Password hashing, lockout, two-factor authentication
2. **Standard APIs**: UserManager, SignInManager, RoleManager
3. **Token Management**: Built-in refresh token support
4. **Email Confirmation**: Ready-to-use email verification
5. **Password Reset**: Built-in password reset flows
6. **Better Integration**: Works seamlessly with ASP.NET Core

## Migration Strategy

### Phase 1: Install Required Packages

Add ASP.NET Identity packages to your project.

### Phase 2: Create Custom Identity User

Create a custom ApplicationUser that extends IdentityUser and includes your custom fields.

### Phase 3: Update DbContext

Change ApplicationDbContext to inherit from IdentityDbContext.

### Phase 4: Update Services

Refactor UserService and LoginService to use UserManager and SignInManager.

### Phase 5: Update Controllers

Update controllers to use Identity-based authentication.

### Phase 6: Data Migration

Create a migration script to migrate existing users to Identity format.

### Phase 7: Update Authorization Policies

Update authorization policies to work with Identity roles.

## Important Considerations

1. **User ID Type**: ASP.NET Identity uses `string` by default for user IDs, but you can use `int` to maintain compatibility.
2. **Password Migration**: Existing BCrypt passwords need to be migrated or users need to reset passwords.
3. **Role System**: You can keep your custom UserRole table or migrate to Identity roles.
4. **Foreign Keys**: All tables referencing User.Id need to be updated if changing ID type.

## Migration Steps

### Step 1: Install Packages

```bash
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Identity.UI
```

### Step 2: Create ApplicationUser

Extend IdentityUser<int> to maintain integer IDs and add custom properties.

### Step 3: Update DbContext

Inherit from IdentityDbContext<ApplicationUser, IdentityRole<int>, int>

### Step 4: Configure Identity in Program.cs

Add Identity services with custom configuration.

### Step 5: Update Services

Refactor to use UserManager<ApplicationUser> and SignInManager<ApplicationUser>

### Step 6: Create Migration

Generate EF Core migration for Identity tables.

### Step 7: Data Migration Script

Create script to migrate existing users.

## Notes

- Keep your custom UserRole table if needed for business logic
- Consider password reset flow for existing users
- Test thoroughly before deploying to production
- Backup database before migration
