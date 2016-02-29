import { 
  APP_INITIALIZE, 
} from '../constants'

const initialState = {}

function reducer(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE:
    default:
      return state
  }
}

export default reducer
