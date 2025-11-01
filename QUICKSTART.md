# Quick Start Guide - Hamza Tex

Get up and running with Hamza Tex in 5 minutes!

## 🚀 Quick Start

### Step 1: Start the Backend

```bash
# Navigate to backend
cd backend/HamzaTex.Api

# Run the API
dotnet run
```

The API will start at `http://localhost:5225` (or `http://localhost:5000` depending on your configuration)

✅ Access Swagger UI at: `http://localhost:5225/swagger`

### Step 2: Set Up the Frontend

Open a **new terminal** window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies with Yarn
yarn install

# Start the development server
yarn start
```

### Step 3: Run the App

After `yarn start`, you'll see a QR code and options:

- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

## ⚡ Testing the API

### Using curl

```bash
# Get all items
curl http://localhost:5225/api/items

# Get single item
curl http://localhost:5225/api/items/1

# Create item
curl -X POST http://localhost:5225/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"New Item","description":"Description"}'

# Update item
curl -X PUT http://localhost:5225/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","description":"Updated"}'

# Delete item
curl -X DELETE http://localhost:5225/api/items/1
```

### Using Swagger UI

1. Open browser to `http://localhost:5225/swagger`
2. Click on any endpoint to expand it
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"

## 🔧 Configuration

### Update Frontend API URL

If your backend runs on a different port, update `frontend/src/utils/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5225/api';
```

**Note for Android Emulator:** Use `http://10.0.2.2:5225/api` instead of `localhost`

### Database Location

The SQLite database is created at `backend/HamzaTex.Api/hamzatex.db`

To reset the database:
```bash
cd backend/HamzaTex.Api
rm hamzatex.db
dotnet run
```

## 📱 Running on Physical Device

### Same Network Setup

1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update `frontend/src/utils/api.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:5225/api';
   ```

3. Make sure your phone and computer are on the same WiFi network

4. Scan QR code with Expo Go app

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check if port is in use
netstat -an | grep 5225

# Try a different port by updating launchSettings.json
```

### Frontend Can't Connect to API

1. Check backend is running
2. Verify API URL in `api.js`
3. For Android emulator, use `10.0.2.2` instead of `localhost`
4. Check CORS is enabled in backend

### Metro Bundler Issues

```bash
# Clear cache
cd frontend
yarn start --clear
```

### Module Not Found

```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules
yarn install
```

## 📚 Next Steps

- Read the full [README.md](README.md)
- Explore [Backend README](backend/README.md)
- Check [Frontend README](frontend/README.md)
- Review API documentation in Swagger UI
- Customize the app for your needs

## ✨ Features Available Out of the Box

- ✅ Full CRUD operations on Items
- ✅ Redux state management
- ✅ Navigation between screens
- ✅ Form validation
- ✅ Error handling
- ✅ API documentation (Swagger)
- ✅ Sample data pre-loaded
- ✅ CORS enabled
- ✅ Responsive UI components

## 🎯 Your First Customization

Try adding a new field to items:

1. Update `backend/HamzaTex.Api/Entities/Item.cs`
2. Update `backend/HamzaTex.Api/Models/ItemDto.cs`
3. Update `frontend/src/screens/AddItemScreen.js`
4. Update `frontend/src/screens/ItemDetailsScreen.js`
5. Delete and recreate the database

Happy Coding! 🚀
