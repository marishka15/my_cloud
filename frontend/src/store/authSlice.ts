import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../api/api'
import type { User } from '../api/api'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    data: { username: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const result = await api.login(
        data.username,
        data.password,
      )

      return result.user
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Ошибка входа',
      )
    }
  },
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    data: {
      username: string
      full_name: string
      email: string
      password: string
    },
    { rejectWithValue },
  ) => {
    try {
      const result = await api.register(
        data.username,
        data.full_name,
        data.email,
        data.password,
      )

      return result.user
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Ошибка регистрации',
      )
    }
  },
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const result = await api.getCurrentUser()
      return result.user
    } catch {
      return rejectWithValue(null)
    }
  },
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await api.logout()
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false
        state.user = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false
        state.user = null
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.loading = false
      })
  },
})

export const { clearError } = authSlice.actions

export default authSlice.reducer
