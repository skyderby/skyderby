import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import Api from 'api'

export const selectCurrentUser = state => state.session?.currentUser
const selectStatus = state => state.session.status

export const loadSession = createAsyncThunk(
  'session/load',
  async () => {
    const data = await Api.Session.load()

    return data
  },
  {
    condition: (_param, { getState }) => {
      const status = selectStatus(getState())

      if (['loaded', 'loading'].includes(status)) return false

      return true
    }
  }
)

export const logout = createAsyncThunk('session/logout', async () => {
  await Api.Session.logout()
})

export const login = createAsyncThunk('session/login', async credentials => {
  const session = await Api.Session.login(credentials)

  return session
})

const sessionSlice = createSlice({
  name: 'currentUser',
  initialState: { status: 'idle', currentUser: null },
  reducers: {},
  extraReducers: {
    [loadSession.pending]: state => {
      state.status = 'loading'
      state.currentUser = null
    },
    [loadSession.fulfilled]: (state, action) => {
      state.status = 'loaded'
      state.currentUser = action.payload
    },
    [loadSession.rejected]: state => {
      state.status = 'error'
    },
    [login.fulfilled]: (state, action) => {
      state.status = 'loaded'
      state.currentUser = action.payload
    },
    [logout.fulfilled]: state => {
      state.status = 'idle'
      state.currentUser = { authorized: false }
    }
  }
})

export default sessionSlice.reducer
