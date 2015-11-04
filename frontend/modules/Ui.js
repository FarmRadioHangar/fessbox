import React   from 'react'
import Host    from './Host'
import Mixer   from './Mixer'
import Stream  from './Stream'

import { connect } 
  from 'react-redux'

class Ui extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const MixerComponent = connect(state => state.mixer)(Mixer)
    return (
      <div>
        <div>
          <Host />
        </div>
        <MixerComponent />
        <Stream />
      </div>
    )
  }
}

export default Ui
