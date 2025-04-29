// frontend/src/store/slices/debateSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import debateService from '../../services/debateService';

// Estado inicial
const initialState = {
  debates: [],
  currentDebate: null,
  isLoading: false,
  error: null,
};

// Thunks
export const fetchDebates = createAsyncThunk(
  'debate/fetchAll',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await debateService.getDebates(projectId);
      return response.debates;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchDebate = createAsyncThunk(
  'debate/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await debateService.getDebate(id);
      return response.debate;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createDebate = createAsyncThunk(
  'debate/create',
  async (debateData, { rejectWithValue }) => {
    try {
      const response = await debateService.createDebate(debateData);
      return response.debate;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const generateNextTurn = createAsyncThunk(
  'debate/nextTurn',
  async (id, { rejectWithValue }) => {
    try {
      const response = await debateService.generateNextTurn(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Slice
const debateSlice = createSlice({
  name: 'debate',
  initialState,
  reducers: {
    clearDebateError: (state) => {
      state.error = null;
    },
    clearCurrentDebate: (state) => {
      state.currentDebate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Debates
      .addCase(fetchDebates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDebates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.debates = action.payload;
      })
      .addCase(fetchDebates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch One Debate
      .addCase(fetchDebate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDebate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDebate = action.payload;
      })
      .addCase(fetchDebate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Debate
      .addCase(createDebate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDebate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.debates.push(action.payload);
        state.currentDebate = action.payload;
      })
      .addCase(createDebate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Generate Next Turn
      .addCase(generateNextTurn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateNextTurn.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentDebate) {
          // Añadir nueva entrada
          if (!state.currentDebate.entries) {
            state.currentDebate.entries = [];
          }
          state.currentDebate.entries.push(action.payload.entry);
          
          // Actualizar turno actual
          state.currentDebate.current_turn += 1;
          
          // Actualizar estado si completado
          if (action.payload.isCompleted) {
            state.currentDebate.status = 'completed';
          }
        }
      })
      .addCase(generateNextTurn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDebateError, clearCurrentDebate } = debateSlice.actions;
export default debateSlice.reducer;
