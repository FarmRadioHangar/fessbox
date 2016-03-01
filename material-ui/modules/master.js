import React from 'react'

import { connect } 
  from 'react-redux'

class Master extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        Master
      </div>
    )
  }
}

const MasterComponent = connect(state => ({
  mixer : state.mixer,
}))(Master)

export default MasterComponent
