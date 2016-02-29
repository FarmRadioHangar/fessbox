//import inbox from './reducers/inbox'
//import mixer from './reducers/mixer'
import app   from './reducers/app'
import users from './reducers/users'

import { combineReducers } 
  from 'redux'

export default combineReducers({
//  ui,
//  mixer,
//  inbox,
  app,
  users,
})
