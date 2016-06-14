import { 
  APP_INITIALIZE, 
} from '../constants'

const initialState = {}

export default function(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE:
      return action.data.users ? action.data.users : state
    default:
      return state
  }
}
