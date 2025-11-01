import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchItems, createItem, updateItem, deleteItem } from '../../utils/api';

// Async thunks
export const fetchItemsAsync = createAsyncThunk(
  'items/fetchItems',
  async () => {
    const response = await fetchItems();
    return response.data;
  }
);

export const createItemAsync = createAsyncThunk(
  'items/createItem',
  async (itemData) => {
    const response = await createItem(itemData);
    return response.data;
  }
);

export const updateItemAsync = createAsyncThunk(
  'items/updateItem',
  async ({ id, data }) => {
    const response = await updateItem(id, data);
    return response.data;
  }
);

export const deleteItemAsync = createAsyncThunk(
  'items/deleteItem',
  async (id) => {
    await deleteItem(id);
    return id;
  }
);

// Slice
const itemsSlice = createSlice({
  name: 'items',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchItemsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItemsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItemsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create item
      .addCase(createItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update item
      .addCase(updateItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete item
      .addCase(deleteItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = itemsSlice.actions;
export default itemsSlice.reducer;
