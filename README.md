# Hamza Tex - Full Stack Application

A full-stack mobile and web application built with React Native (frontend) and ASP.NET Core (backend).

## 📁 Project Structure

```
hamza-tex/
├── frontend/                # React Native + Redux Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── screens/         # Screen components
│   │   ├── navigation/      # Navigation setup
│   │   ├── store/           # Redux store and slices
│   │   └── utils/           # Utility functions (API, validation, storage)
│   ├── App.js               # Main app component
│   ├── index.js             # App entry point
│   ├── package.json         # Node dependencies
│   └── app.json             # Expo configuration
│
└── backend/                 # ASP.NET Core Web API Backend
    └── HamzaTex.Api/
        ├── Controllers/     # API controllers
        ├── Models/          # DTOs and view models
        ├── Entities/        # Database entities
        ├── Services/        # Business logic services
        ├── Data/            # EF Core DbContext
        └── Program.cs       # App configuration
```

## 🚀 Features

### Frontend
- **React Native** with Expo for cross-platform mobile development
- **Redux Toolkit** for state management
- **React Navigation** for screen navigation
- **Axios** for API communication
- **AsyncStorage** for local data persistence
- Sample CRUD screens (Home, Add Item, Item Details)
- Reusable UI components (Button, Card)
- Validation utilities
- API integration with backend

### Backend
- **ASP.NET Core 8.0** Web API
- **Entity Framework Core** with SQLite database
- **CRUD operations** for Items resource
- **Swagger/OpenAPI** documentation
- **CORS** enabled for frontend communication
- Service layer architecture
- DTOs for data transfer
- Sample seed data

## 📋 Prerequisites

### Frontend
- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio (for emulator)

### Backend
- .NET 8.0 SDK or later
- SQLite (included)

## 🛠️ Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/HamzaTex.Api
   ```

2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```

3. Run the backend API:
   ```bash
   dotnet run
   ```

4. The API will be available at `http://localhost:5000`

5. Access Swagger documentation at `http://localhost:5000/swagger`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies using Yarn:
   ```bash
   yarn install
   ```

3. Update the API base URL in `src/utils/api.js` if needed:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

4. Start the development server:
   ```bash
   yarn start
   ```

5. Run on your preferred platform:
   - iOS: Press `i` or `yarn ios`
   - Android: Press `a` or `yarn android`
   - Web: Press `w` or `yarn web`

## 🔌 API Endpoints

### Items Resource

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items |
| GET | `/api/items/{id}` | Get item by ID |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/{id}` | Update item |
| DELETE | `/api/items/{id}` | Delete item |

### Sample Request (Create Item)

```json
POST /api/items
Content-Type: application/json

{
  "name": "New Item",
  "description": "Item description"
}
```

## 🧪 Testing

### Backend
```bash
cd backend/HamzaTex.Api
dotnet test
```

### Frontend
```bash
cd frontend
yarn test
```

## 📝 Development Notes

### Frontend Architecture
- **Redux Toolkit**: Used for global state management with slices
- **Async Thunks**: Handle API calls with loading and error states
- **React Navigation**: Stack navigator for screen transitions
- **Component Structure**: Functional components with hooks

### Backend Architecture
- **Repository Pattern**: Service layer separates business logic
- **Entity Framework Core**: ORM for database operations
- **DTOs**: Separate models for API responses
- **Dependency Injection**: Used throughout the application

### CORS Configuration
The backend is configured to allow all origins for development. Update the CORS policy in `Program.cs` for production:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", builder =>
    {
        builder.WithOrigins("https://your-domain.com")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
```

## 🗄️ Database

The application uses SQLite for simplicity. The database file (`hamzatex.db`) is created automatically on first run with seed data.

To reset the database:
```bash
cd backend/HamzaTex.Api
rm hamzatex.db
dotnet run
```

## 📦 Dependencies

### Frontend Key Dependencies
- react-native: 0.72.6
- expo: ~49.0.15
- @reduxjs/toolkit: ^1.9.7
- react-redux: ^8.1.3
- @react-navigation/native: ^6.1.9
- axios: ^1.6.0

### Backend Key Dependencies
- Microsoft.EntityFrameworkCore.Sqlite: 9.0.10
- Microsoft.EntityFrameworkCore.Design: 9.0.10
- Swashbuckle.AspNetCore (included in .NET 8)

## 🔧 Configuration

### Environment Variables (Frontend)
Create a `.env` file in the `frontend` directory:
```
API_BASE_URL=http://localhost:5000/api
```

### App Settings (Backend)
Update `appsettings.json` or `appsettings.Development.json` for environment-specific settings.

## 🚢 Deployment

### Frontend
1. Build for production:
   ```bash
   cd frontend
   expo build:android  # For Android
   expo build:ios      # For iOS
   ```

2. Follow Expo's deployment guide for app stores

### Backend
1. Publish the API:
   ```bash
   cd backend/HamzaTex.Api
   dotnet publish -c Release -o ./publish
   ```

2. Deploy to your preferred hosting service (Azure, AWS, etc.)

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using React Native and ASP.NET Core**