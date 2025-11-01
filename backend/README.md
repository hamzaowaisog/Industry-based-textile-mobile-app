# Hamza Tex - Backend API

ASP.NET Core Web API with Entity Framework Core and SQLite.

## 🏗️ Architecture

### Folder Structure

```
HamzaTex.Api/
├── Controllers/         # API controllers
│   └── ItemsController.cs
├── Models/             # DTOs and view models
│   └── ItemDto.cs
├── Entities/           # Database entities
│   └── Item.cs
├── Services/           # Business logic layer
│   ├── IItemService.cs
│   └── ItemService.cs
├── Data/               # EF Core context
│   └── ApplicationDbContext.cs
├── Program.cs          # Application configuration
└── appsettings.json    # Configuration settings
```

## 🎯 Key Features

- **ASP.NET Core 8.0**: Modern web framework
- **Entity Framework Core**: ORM for data access
- **SQLite Database**: Lightweight embedded database
- **RESTful API**: Following REST conventions
- **Swagger/OpenAPI**: Interactive API documentation
- **CORS Enabled**: Cross-origin resource sharing
- **Dependency Injection**: Built-in DI container
- **Service Layer**: Separation of concerns

## 📊 Database Schema

### Item Entity

```csharp
public class Item
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

## 🔌 API Endpoints

### Items Resource

#### Get All Items
```
GET /api/items
Response: 200 OK
[
  {
    "id": 1,
    "name": "Sample Item",
    "description": "Description"
  }
]
```

#### Get Item by ID
```
GET /api/items/{id}
Response: 200 OK | 404 Not Found
{
  "id": 1,
  "name": "Sample Item",
  "description": "Description"
}
```

#### Create Item
```
POST /api/items
Content-Type: application/json

{
  "name": "New Item",
  "description": "Item description"
}

Response: 201 Created
Location: /api/items/3
{
  "id": 3,
  "name": "New Item",
  "description": "Item description"
}
```

#### Update Item
```
PUT /api/items/{id}
Content-Type: application/json

{
  "name": "Updated Item",
  "description": "Updated description"
}

Response: 200 OK | 404 Not Found
{
  "id": 1,
  "name": "Updated Item",
  "description": "Updated description"
}
```

#### Delete Item
```
DELETE /api/items/{id}
Response: 204 No Content | 404 Not Found
```

## 🚀 Getting Started

### Prerequisites
- .NET 8.0 SDK or later
- Visual Studio 2022, VS Code, or Rider (optional)

### Installation

1. Navigate to the project directory:
   ```bash
   cd backend/HamzaTex.Api
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Run the application:
   ```bash
   dotnet run
   ```

4. Access the API:
   - API: http://localhost:5000
   - Swagger UI: http://localhost:5000/swagger

## 🔧 Configuration

### Connection String

Update `appsettings.json` to configure the database:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=hamzatex.db"
  }
}
```

### CORS Policy

The default CORS policy allows all origins. For production, update `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", builder =>
    {
        builder.WithOrigins("https://yourdomain.com")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Use the policy
app.UseCors("Production");
```

### Swagger Configuration

Swagger is enabled in development mode. To enable in production:

```csharp
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hamza Tex API v1");
});
```

## 📦 Dependencies

### NuGet Packages
- **Microsoft.EntityFrameworkCore.Sqlite** (9.0.10): SQLite provider
- **Microsoft.EntityFrameworkCore.Design** (9.0.10): Design-time tools
- **Microsoft.EntityFrameworkCore.Tools** (9.0.10): EF Core CLI tools
- **Swashbuckle.AspNetCore**: Swagger/OpenAPI (built-in)

## 🗄️ Database Management

### Create Database
The database is created automatically on first run:
```bash
dotnet run
```

### Reset Database
```bash
rm hamzatex.db
dotnet run
```

### Entity Framework Migrations (Optional)

If you want to use migrations instead of EnsureCreated:

```bash
# Install EF Core CLI
dotnet tool install --global dotnet-ef

# Create initial migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Remove last migration
dotnet ef migrations remove
```

## 🧪 Testing

### Run Tests
```bash
dotnet test
```

### API Testing with curl

```bash
# Get all items
curl http://localhost:5000/api/items

# Get single item
curl http://localhost:5000/api/items/1

# Create item
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","description":"Test Description"}'

# Update item
curl -X PUT http://localhost:5000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Item","description":"Updated Description"}'

# Delete item
curl -X DELETE http://localhost:5000/api/items/1
```

## 🏛️ Architecture Patterns

### Service Layer Pattern
Business logic is separated into service classes:
- **IItemService**: Service interface
- **ItemService**: Service implementation
- Injected into controllers via DI

### Repository Pattern
Entity Framework DbContext acts as the repository:
- `ApplicationDbContext`: Database context
- `DbSet<Item>`: Item repository

### DTO Pattern
Data Transfer Objects separate API models from entities:
- **ItemDto**: Response model
- **CreateItemDto**: Creation model
- **UpdateItemDto**: Update model

## 🔒 Security Considerations

### Production Checklist
- [ ] Update CORS policy to allow specific origins
- [ ] Add authentication/authorization
- [ ] Use secure connection strings
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Use logging and monitoring
- [ ] Implement proper error handling

### Adding Authentication

Example with JWT:

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
```

## 📈 Performance Optimization

### Database Indexing
Add indexes to frequently queried columns:

```csharp
modelBuilder.Entity<Item>()
    .HasIndex(e => e.Name);
```

### Async/Await
All database operations use async/await for better scalability.

### Response Caching
Add response caching for GET endpoints:

```csharp
[ResponseCache(Duration = 60)]
[HttpGet]
public async Task<ActionResult<IEnumerable<ItemDto>>> GetAllItems()
```

## 🚢 Deployment

### Publish for Production

```bash
# Publish the application
dotnet publish -c Release -o ./publish

# Run published app
cd publish
dotnet HamzaTex.Api.dll
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["HamzaTex.Api.csproj", "./"]
RUN dotnet restore "HamzaTex.Api.csproj"
COPY . .
RUN dotnet build "HamzaTex.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HamzaTex.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HamzaTex.Api.dll"]
```

Build and run:
```bash
docker build -t hamzatex-api .
docker run -p 5000:80 hamzatex-api
```

## 📖 Additional Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core Documentation](https://docs.microsoft.com/ef/core)
- [Swagger/OpenAPI](https://swagger.io/)
- [RESTful API Design](https://restfulapi.net/)
