# PostgreSQL to SQL Server Migration Guide

This document outlines the changes made to migrate from PostgreSQL to SQL Server.

## ✅ Changes Completed

### 1. **NuGet Packages**

- ✅ Removed: `Npgsql.EntityFrameworkCore.PostgreSQL`
- ✅ Removed: `Microsoft.EntityFrameworkCore.Sqlite` (not needed)
- ✅ Kept: `Microsoft.EntityFrameworkCore.SqlServer` (already present)

### 2. **Connection String** (`appsettings.json`)

- **Before (PostgreSQL):**
  ```
  Server=localhost;Port=3306;Database=HamzaTex_DB_First;Username=mhamza;Password=hamzaowais@1
  ```
- **After (SQL Server):**
  ```
  Server=localhost;Database=HamzaTex_DB_First;User Id=mhamza;Password=hamzaowais@1;TrustServerCertificate=True;
  ```

**Note:** Adjust the connection string based on your SQL Server setup:

- For SQL Server Authentication: `Server=localhost;Database=HamzaTex_DB_First;User Id=username;Password=password;TrustServerCertificate=True;`
- For Windows Authentication: `Server=localhost;Database=HamzaTex_DB_First;Integrated Security=True;TrustServerCertificate=True;`
- For SQL Server Express: `Server=localhost\\SQLEXPRESS;Database=HamzaTex_DB_First;...`

### 3. **Program.cs**

- Changed from `UseNpgsql()` to `UseSqlServer()`

### 4. **DbContext Configuration** (`ApplicationDbContext.cs`)

#### Removed PostgreSQL-Specific Code:

- ✅ Removed all `HasPostgresEnum()` calls
- ✅ Removed `HasPostgresExtension()` calls

#### Function Replacements:

- ✅ `uuid_generate_v4()` → `NEWID()` (for GUID generation)
- ✅ `now()` → `GETDATE()` (for datetime defaults)

#### Data Type Changes:

- ✅ `timestamp without time zone` → `datetime2`

#### Enum Handling:

- ✅ All enums now use `.HasConversion<string>()` with `.HasMaxLength(50)`
- Enums are stored as `nvarchar(50)` strings in SQL Server
- EF Core automatically converts between C# enum values and string values

#### Delete Behavior:

- ✅ `DeleteBehavior.ClientSetNull` → `DeleteBehavior.SetNull`
- SQL Server doesn't support `ClientSetNull` the same way PostgreSQL does

## 📋 Next Steps

### 1. **Restore NuGet Packages**

```bash
cd backend/HamzaTex.Api
dotnet restore
```

### 2. **Delete Old Migrations** (if you have existing PostgreSQL migrations)

```bash
# Navigate to Migrations folder
cd backend/HamzaTex.Api/Migrations
# Delete all existing migration files
# Or keep them for reference and create new ones
```

### 3. **Create New Migration for SQL Server**

```bash
cd backend/HamzaTex.Api
dotnet ef migrations add InitialSqlServerMigration
```

### 4. **Update Database**

```bash
dotnet ef database update
```

**OR** if you want to start fresh:

```bash
dotnet ef database drop
dotnet ef database update
```

### 5. **Verify Connection String**

Make sure your SQL Server connection string in `appsettings.json` matches your SQL Server instance:

- Check if SQL Server is running
- Verify database name
- Verify authentication method (SQL Server Auth vs Windows Auth)
- For SQL Server Express, use: `Server=localhost\\SQLEXPRESS`

### 6. **Test the Application**

- Run the application
- Verify database connection
- Test CRUD operations
- Verify enum values are stored/retrieved correctly as strings

## 🔍 Key Differences: PostgreSQL vs SQL Server

| Feature           | PostgreSQL                    | SQL Server                  |
| ----------------- | ----------------------------- | --------------------------- |
| GUID Generation   | `uuid_generate_v4()`          | `NEWID()`                   |
| Current Date/Time | `now()`                       | `GETDATE()`                 |
| DateTime Type     | `timestamp without time zone` | `datetime2`                 |
| Enums             | Native enum type              | `nvarchar` (string)         |
| Delete Behavior   | `ClientSetNull` supported     | Use `SetNull` or `NoAction` |

## ⚠️ Important Notes

1. **Enum Storage**: Enums are now stored as strings (`nvarchar(50)`). This means:

   - Existing data migration may be needed if you have a PostgreSQL database with enum values
   - Enum values will be stored as their string representation (e.g., "Cash", "Credit")

2. **Data Migration**: If you have existing PostgreSQL data:

   - Export data from PostgreSQL
   - Transform enum values to strings
   - Import into SQL Server
   - Or write a migration script

3. **Constraint Names**: The constraint names (like `clients_pkey`) are kept the same for consistency, but SQL Server may generate different names if you recreate the database.

4. **Views**: The views (`VClientBalance`, `VMonthlyProfitLoss`) will need to be recreated in SQL Server with SQL Server syntax if they contain PostgreSQL-specific SQL.

## 🐛 Troubleshooting

### Connection Issues

- **Error: "Cannot open database"**

  - Verify SQL Server is running
  - Check database name exists
  - Verify user has permissions

- **Error: "Login failed"**
  - Check username/password
  - Try Windows Authentication instead
  - Verify SQL Server allows SQL authentication

### Migration Issues

- **Error: "Migration already exists"**

  - Delete old migration files
  - Or use a different migration name

- **Error: "Cannot drop database"**
  - Close all connections to the database
  - Stop the application
  - Try again

## 📚 Additional Resources

- [EF Core SQL Server Provider](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/)
- [SQL Server Connection Strings](https://www.connectionstrings.com/sql-server/)
- [EF Core Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
