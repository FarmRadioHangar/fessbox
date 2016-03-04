import reducers from './reducers'

import { createStore } 
  from 'redux'

const store = createStore(reducers, {})

/* 
 * LiveReactload hack 
 */
if (module.onReload) {
  module.onReload(() => {
    const nextReducer = require('./reducers')
    store.replaceReducer(nextReducer.default || nextReducer)
    return true
  })
}

export default store
