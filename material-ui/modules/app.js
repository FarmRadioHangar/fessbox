import React       from 'react'

import { connect } 
  from 'react-redux'

class App extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        Hello
      </div>
    )
  }
}

const AppComponent = connect(state => ({
  //inbox : state.inbox,
  app   : state.app,
}))(App)

export default AppComponent
