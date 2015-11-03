import React       from 'react'
import ReactDOM    from 'react-dom'
import app         from './reducers'
import Ui          from '../modules/Ui'

import { createStore } 
  from 'redux'
import { Provider } 
  from 'react-redux'

const store = createStore(app)

class App extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <Ui />
    )
  }
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('main')
)
