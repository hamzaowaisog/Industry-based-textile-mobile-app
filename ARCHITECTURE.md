# Hamza Tex - Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HAMZA TEX SYSTEM                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐                  ┌──────────────────────┐
│   MOBILE CLIENT      │                  │   BACKEND API        │
│   (React Native)     │ ◄────HTTP────► │   (ASP.NET Core)     │
└──────────────────────┘                  └──────────────────────┘
          │                                         │
          │                                         │
          ▼                                         ▼
┌──────────────────────┐                  ┌──────────────────────┐
│   Redux Store        │                  │   SQLite Database    │
│   (State Mgmt)       │                  │   (Data Storage)     │
└──────────────────────┘                  └──────────────────────┘
```

## Frontend Architecture (React Native)

### Component Hierarchy

```
App.js
  └── NavigationContainer
      └── Provider (Redux)
          └── AppNavigator (Stack Navigator)
              ├── HomeScreen
              │   ├── FlatList (Item List)
              │   └── FAB (Add Button)
              ├── ItemDetailsScreen
              │   └── Form (Edit Item)
              └── AddItemScreen
                  └── Form (Create Item)
```

### State Management Flow (Redux)

```
┌──────────────┐
│   UI/Screen  │
└──────┬───────┘
       │ Dispatch Action
       ▼
┌──────────────────┐
│  Redux Store     │
│  ┌────────────┐  │
│  │  Slice     │  │
│  │  (Items)   │  │
│  └────────────┘  │
└────────┬─────────┘
         │
         │ Async Thunk
         ▼
┌──────────────────┐
│   API Client     │
│   (Axios)        │
└────────┬─────────┘
         │ HTTP Request
         ▼
┌──────────────────┐
│   Backend API    │
└──────────────────┘
```

### Folder Structure (Frontend)

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.js      # Custom button with loading state
│   │   └── Card.js        # Card container component
│   │
│   ├── screens/           # Screen components (route handlers)
│   │   ├── HomeScreen.js          # List view with CRUD operations
│   │   ├── AddItemScreen.js       # Create new item form
│   │   └── ItemDetailsScreen.js   # View/Edit item details
│   │
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.js        # Stack navigator setup
│   │
│   ├── store/             # Redux state management
│   │   ├── index.js               # Store configuration
│   │   └── slices/
│   │       └── itemsSlice.js      # Items state & actions
│   │
│   └── utils/             # Helper functions
│       ├── api.js         # Axios API client
│       ├── storage.js     # AsyncStorage helpers
│       └── validation.js  # Form validation
│
├── App.js                 # Root component
├── index.js              # Entry point
└── package.json          # Dependencies
```

## Backend Architecture (ASP.NET Core)

### Layer Architecture

```
┌──────────────────────────────────────┐
│         Presentation Layer            │
│  ┌────────────────────────────────┐  │
│  │   Controllers (API Endpoints)  │  │
│  │   - ItemsController            │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│          Business Layer               │
│  ┌────────────────────────────────┐  │
│  │   Services (Business Logic)    │  │
│  │   - IItemService               │  │
│  │   - ItemService                │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│          Data Access Layer            │
│  ┌────────────────────────────────┐  │
│  │   DbContext (EF Core)          │  │
│  │   - ApplicationDbContext       │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│            Database                   │
│         SQLite (hamzatex.db)         │
└──────────────────────────────────────┘
```

### Request Flow

```
HTTP Request
     │
     ▼
┌──────────────┐
│  Middleware  │  (CORS, Routing, etc.)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Controller  │  (ItemsController)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Service    │  (ItemService)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   DbContext  │  (ApplicationDbContext)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Database   │  (SQLite)
└──────┬───────┘
       │
       ▼
Response (JSON)
```

### Folder Structure (Backend)

```
backend/HamzaTex.Api/
├── Controllers/              # API endpoints
│   └── ItemsController.cs    # Items CRUD endpoints
│
├── Models/                   # DTOs (Data Transfer Objects)
│   └── ItemDto.cs           # Request/Response models
│
├── Entities/                 # Database entities
│   └── Item.cs              # Item entity
│
├── Services/                 # Business logic layer
│   ├── IItemService.cs      # Service interface
│   └── ItemService.cs       # Service implementation
│
├── Data/                     # Database context
│   └── ApplicationDbContext.cs  # EF Core context
│
├── Program.cs               # App configuration & startup
├── appsettings.json        # Configuration
└── HamzaTex.Api.csproj     # Project file
```

## Data Flow Diagrams

### CREATE Operation Flow

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   User      │       │  Frontend   │       │   Backend   │       │  Database   │
└──────┬──────┘       └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
       │                     │                     │                     │
       │ Enter item data     │                     │                     │
       ├────────────────────>│                     │                     │
       │                     │                     │                     │
       │                     │ POST /api/items     │                     │
       │                     ├────────────────────>│                     │
       │                     │                     │                     │
       │                     │                     │ INSERT INTO Items   │
       │                     │                     ├────────────────────>│
       │                     │                     │                     │
       │                     │                     │ Return new item     │
       │                     │                     │<────────────────────┤
       │                     │                     │                     │
       │                     │ 201 Created         │                     │
       │                     │<────────────────────┤                     │
       │                     │                     │                     │
       │ Show success        │                     │                     │
       │<────────────────────┤                     │                     │
       │                     │                     │                     │
```

### READ Operation Flow

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   User      │       │  Frontend   │       │   Backend   │       │  Database   │
└──────┬──────┘       └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
       │                     │                     │                     │
       │ Open app            │                     │                     │
       ├────────────────────>│                     │                     │
       │                     │                     │                     │
       │                     │ GET /api/items      │                     │
       │                     ├────────────────────>│                     │
       │                     │                     │                     │
       │                     │                     │ SELECT * FROM Items │
       │                     │                     ├────────────────────>│
       │                     │                     │                     │
       │                     │                     │ Return items        │
       │                     │                     │<────────────────────┤
       │                     │                     │                     │
       │                     │ 200 OK + data       │                     │
       │                     │<────────────────────┤                     │
       │                     │                     │                     │
       │ Display items       │                     │                     │
       │<────────────────────┤                     │                     │
       │                     │                     │                     │
```

## Technology Stack

### Frontend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React Native | Cross-platform mobile development |
| Runtime | Expo | Development toolchain |
| State Management | Redux Toolkit | Global state management |
| Navigation | React Navigation | Screen routing |
| HTTP Client | Axios | API communication |
| Storage | AsyncStorage | Local data persistence |
| Language | JavaScript | Programming language |

### Backend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | ASP.NET Core 8.0 | Web API framework |
| ORM | Entity Framework Core | Database access |
| Database | SQLite | Embedded database |
| API Documentation | Swagger/OpenAPI | Interactive API docs |
| Language | C# | Programming language |
| DI Container | Built-in | Dependency injection |

## API Endpoints

### RESTful API Design

```
Base URL: http://localhost:5225/api

┌─────────┬──────────────────┬─────────────────────┬────────────────┐
│ Method  │ Endpoint         │ Description         │ Status Code    │
├─────────┼──────────────────┼─────────────────────┼────────────────┤
│ GET     │ /items           │ Get all items       │ 200 OK         │
│ GET     │ /items/{id}      │ Get item by ID      │ 200, 404       │
│ POST    │ /items           │ Create new item     │ 201 Created    │
│ PUT     │ /items/{id}      │ Update item         │ 200, 404       │
│ DELETE  │ /items/{id}      │ Delete item         │ 204, 404       │
└─────────┴──────────────────┴─────────────────────┴────────────────┘
```

## Database Schema

### Items Table

```sql
CREATE TABLE Items (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT NOT NULL,
    CreatedAt TEXT NOT NULL,
    UpdatedAt TEXT NOT NULL
);
```

### Entity Relationships

```
Currently: Single table (Items)

Future expansions could include:
- Users table (authentication)
- Categories table (item categorization)
- Orders table (e-commerce features)
- etc.
```

## Security Considerations

### Current Implementation

- ✅ CORS enabled (configured for development)
- ✅ Input validation on API endpoints
- ✅ DTOs to separate internal/external models
- ✅ Entity Framework parameterized queries (SQL injection protection)

### Production Recommendations

- 🔒 Add authentication (JWT tokens)
- 🔒 Add authorization (role-based access)
- 🔒 HTTPS only
- 🔒 Rate limiting
- 🔒 API versioning
- 🔒 Logging and monitoring
- 🔒 Input sanitization
- 🔒 CORS restricted to specific origins

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                       Production Setup                          │
└────────────────────────────────────────────────────────────────┘

┌──────────────────┐                           ┌──────────────────┐
│   Mobile Apps    │                           │   Cloud Server   │
│  (iOS/Android)   │────────HTTPS─────────────▶│   (Azure/AWS)    │
└──────────────────┘                           └──────────────────┘
                                                        │
                                                        │
                                        ┌───────────────┴───────────────┐
                                        │                               │
                                        ▼                               ▼
                              ┌──────────────────┐        ┌──────────────────┐
                              │   ASP.NET Core   │        │   Database       │
                              │   (Docker)       │────────│   (PostgreSQL)   │
                              └──────────────────┘        └──────────────────┘
```

## Performance Optimization

### Frontend

- Redux state caching
- AsyncStorage for offline support
- Lazy loading of screens
- Memoization of expensive components
- Debounced search/filter operations

### Backend

- Entity Framework query optimization
- Async/await for all I/O operations
- Database indexing on frequently queried columns
- Response caching
- Pagination for large datasets

## Extensibility Points

### Adding New Features

1. **New Entity**: Add to Entities/, create service, controller, DTOs
2. **New Screen**: Add to screens/, update navigation
3. **New Redux State**: Create slice in store/slices/
4. **New API Endpoint**: Add method to controller
5. **Authentication**: Add JWT middleware, user entity, auth service

## Development Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Design    │────▶│   Develop   │────▶│    Test     │
└─────────────┘     └─────────────┘     └─────────────┘
                            │                    │
                            ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Commit    │◀────│   Review    │
                    └─────────────┘     └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │   Deploy    │
                    └─────────────┘
```

## Testing Strategy

### Frontend Testing

- Unit tests for utilities (validation, storage)
- Component tests for UI components
- Integration tests for Redux slices
- E2E tests for critical user flows

### Backend Testing

- Unit tests for services
- Integration tests for controllers
- Database tests for data layer
- API tests for endpoints

## Monitoring & Logging

### Recommended Tools

- **Frontend**: Sentry (error tracking)
- **Backend**: Application Insights / Seq
- **Database**: Query performance monitoring
- **API**: Request/response logging

---

**Last Updated**: November 2025  
**Version**: 1.0.0
