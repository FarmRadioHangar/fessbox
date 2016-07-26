import { combineReducers, createStore } from 'redux'
import messages from './reducers/messages'
import toastr from './reducers/toastr'
import mixer from './reducers/mixer'
import app from './reducers/app'

const reducers = combineReducers({
  app,
  messages,
  toastr,
  mixer,
})

export default createStore(reducers, {})
