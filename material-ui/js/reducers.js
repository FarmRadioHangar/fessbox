import app    from './reducers/app'
import inbox  from './reducers/inbox'
import mixer  from './reducers/mixer'
import toastr from './reducers/toastr'
import users  from './reducers/users'

import { combineReducers } 
  from 'redux'

export default combineReducers({
  mixer,
  inbox,
  app,
  users,
  toastr,
})
