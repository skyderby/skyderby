import Api from 'api'

const prefix = '[suits/usageStat]'

const LOAD_REQUEST = `${prefix} LOAD_REQUEST`
const LOAD_SUCCESS = `${prefix} LOAD_SUCCESS`
const LOAD_ERROR = `${prefix} LOAD_ERROR`

export const loadUsageStats = suitIds => {
  return async (dispatch, getState) => {
    if (suitIds.length === 0) return

    const stateData = getState().suits.usageStats
    const idsToLoad = suitIds.filter(
      id => !stateData.allIds.concat(stateData.loading).includes(id)
    )

    if (idsToLoad.length === 0) return

    dispatch({ type: LOAD_REQUEST, payload: { ids: idsToLoad } })

    try {
      const data = await Api.Suit.Stats.findAll(idsToLoad)

      dispatch({ type: LOAD_SUCCESS, payload: data })
    } catch (err) {
      dispatch({ type: LOAD_ERROR, payload: { ids: idsToLoad } })

      throw err
    }
  }
}

const initialState = {
  allIds: [],
  byId: {},
  loading: []
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
      return {
        ...state,
        loading: state.loading.concat(action.payload.ids)
      }
    case LOAD_SUCCESS:
      return {
        allIds: state.allIds.concat(action.payload.map(el => el.id)),
        byId: {
          ...state.byId,
          ...Object.fromEntries(action.payload.map(el => [el.id, el]))
        },
        loading: state.loading.filter(id => !action.payload.find(el => el.id === id))
      }
    case LOAD_ERROR:
      return {
        ...state,
        loading: state.loading.filter(id => !action.payload.ids.find(el => el.id === id))
      }
    default:
      return state
  }
}

export default reducer
