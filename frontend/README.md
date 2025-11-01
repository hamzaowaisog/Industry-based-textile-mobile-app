# Hamza Tex - Frontend

React Native mobile application built with Expo, Redux, and React Navigation.

## 🏗️ Architecture

### Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.js
│   └── Card.js
├── screens/            # Screen components
│   ├── HomeScreen.js
│   ├── AddItemScreen.js
│   └── ItemDetailsScreen.js
├── navigation/         # Navigation configuration
│   └── AppNavigator.js
├── store/              # Redux store
│   ├── index.js
│   └── slices/
│       └── itemsSlice.js
└── utils/              # Utility functions
    ├── api.js          # API client
    ├── validation.js   # Validation helpers
    └── storage.js      # AsyncStorage helpers
```

## 🎯 Key Features

- **Redux Toolkit**: Simplified Redux with slices and async thunks
- **React Navigation**: Stack-based navigation
- **API Integration**: Axios-based API client with interceptors
- **Local Storage**: AsyncStorage for data persistence
- **Form Validation**: Reusable validation utilities
- **Error Handling**: Centralized error handling

## 📱 Screens

### HomeScreen
- Displays list of items
- Pull-to-refresh functionality
- Delete items with confirmation
- Navigate to item details
- Floating action button to add new items

### AddItemScreen
- Form to create new items
- Input validation
- Success/error feedback

### ItemDetailsScreen
- View and edit item details
- Update functionality
- Form validation

## 🔄 State Management

### Redux Slices

#### itemsSlice
Manages item-related state with the following actions:
- `fetchItemsAsync`: Get all items
- `createItemAsync`: Create new item
- `updateItemAsync`: Update existing item
- `deleteItemAsync`: Delete item
- `clearError`: Clear error state

State structure:
```javascript
{
  items: [],
  loading: false,
  error: null
}
```

## 🌐 API Integration

The API client is configured in `src/utils/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Update this URL for different environments:
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-api-domain.com/api`
- **Android Emulator**: `http://10.0.2.2:5000/api`

## 🎨 UI Components

### Button
Reusable button component with loading state:
```jsx
<Button 
  title="Submit" 
  onPress={handleSubmit} 
  loading={isLoading} 
/>
```

### Card
Container component with shadow styling:
```jsx
<Card>
  <Text>Card Content</Text>
</Card>
```

## 🧰 Utilities

### Validation (validation.js)
- `isValidEmail(email)`: Email validation
- `isValidPhone(phone)`: Phone number validation
- `isRequired(value)`: Required field validation
- `minLength(value, min)`: Minimum length validation
- `maxLength(value, max)`: Maximum length validation

### Storage (storage.js)
- `setItem(key, value)`: Save data
- `getItem(key)`: Retrieve data
- `removeItem(key)`: Delete data
- `clear()`: Clear all data
- `multiGet(keys)`: Get multiple items
- `multiSet(pairs)`: Set multiple items

### API (api.js)
- Pre-configured Axios instance
- Request/response interceptors
- Error handling
- CRUD operations for items

## 📦 Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android

# Run on web
yarn web
```

## 🧪 Testing

```bash
# Run tests
yarn test

# Run tests with coverage
yarn test --coverage

# Run tests in watch mode
yarn test --watch
```

## 🔧 Configuration

### Expo Configuration (app.json)
Update the `app.json` file for:
- App name and slug
- Bundle identifiers
- App icons and splash screens
- Build configurations

### Babel Configuration (babel.config.js)
Configured with:
- babel-preset-expo
- react-native-reanimated/plugin

## 📱 Running on Devices

### iOS
1. Install Expo Go from App Store
2. Scan QR code from terminal
3. App will load on your device

### Android
1. Install Expo Go from Play Store
2. Scan QR code from terminal
3. App will load on your device

### Physical Device on Same Network
Ensure your device and computer are on the same network for the app to connect to the backend API.

## 🚀 Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
yarn start --clear
```

### Network Errors
- Ensure backend is running
- Check API_BASE_URL in `api.js`
- For Android emulator, use `10.0.2.2` instead of `localhost`

### Module Resolution Issues
```bash
# Clean and reinstall
rm -rf node_modules
yarn install
```

## 📖 Learn More

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Navigation Documentation](https://reactnavigation.org/)
