import reducers from './reducers'

import { createStore } 
  from 'redux'

const store = createStore(reducers, {})

/* 
 * LiveReactload hack 
 */
if (module.onReload) {
  module.onReload(() => {
    console.log('LiveReactload reload')
    const nextReducer = require('./reducers')
    store.replaceReducer(nextReducer.default || nextReducer)
    return true
  })
}

export default store
