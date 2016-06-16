import _           from 'lodash'
import getUrlParam from '../url-params'

import { 
  APP_INITIALIZE, 
  USER_REMOVE,
  USER_UPDATE,
  USER_UPDATE_LEVEL,
} from '../constants'

const userId = getUrlParam('user_id') 

const initialState = {
  'userId'        : null,
  'connectedUser' : null,
}

export default function(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE: {
      const users = action.data.users || {}
      const connectedUser = userId ? users[userId] : null
      return {
        ...users,
        connectedUser,
        userId,
      }     
    }
    case USER_REMOVE: {
      const users = _.omit(state, action.userId)
      const connectedUser = userId ? users[userId] : null
      return {
        ...users,
        connectedUser,
        userId : state.userId,
      }
    }
    case USER_UPDATE: {
      return {
        ...state,
        [action.userId] : action.info,
      }
    }
    case USER_UPDATE_LEVEL: {
      return {
        ...state,
        [action.userId] : Object.assign({}, state[action.userId], { 
          level : action.level 
        }),
      }
    }
    default:
      return state
  }
}
