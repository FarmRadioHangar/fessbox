import React from 'react'

import { connect } 
  from 'react-redux'

class Mixer extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        Mixer
      </div>
    )
  }
}

const MixerComponent = connect(state => ({
  mixer : state.mixer,
}))(Mixer)

export default MixerComponent
