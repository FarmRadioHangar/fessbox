import app    from './reducers/app'
import inbox  from './reducers/inbox'
import mixer  from './reducers/mixer'
import toastr from './reducers/toastr'
import users  from './reducers/users'

import { combineReducers } 
  from 'redux'
import {reducer as formReducer} 
  from 'redux-form'

export default combineReducers({
  mixer,
  inbox,
  app,
  users,
  toastr,
  form: formReducer,    
})
