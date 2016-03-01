import React from 'react'

import { connect } 
  from 'react-redux'

import Paper 
  from 'material-ui/lib/paper'
import IconMic
  from 'material-ui/lib/svg-icons/av/mic'
import IconVolumeUp
  from 'material-ui/lib/svg-icons/av/volume-up'
import Slider 
  from 'material-ui/lib/slider'

class Master extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <Paper>
        <div style={styles.controls}>
          <div>
            <IconVolumeUp />
          </div>
          <div style={styles.slider}>
            <Slider />
          </div>
          <div>
            <IconMic />
          </div>
          <div style={styles.slider}>
            <Slider />
          </div>
        </div>
      </Paper>
    )
  }
}

const styles = {
  controls: {
    display       : 'flex',
    flexDirection : 'row', 
    alignItems    : 'center',
    height        : '30px',
    padding       : '10px 0',
    marginLeft    : '20px',
  },
  slider: {
    width         : '100%',
    marginTop     : '22px',
    padding       : '0 20px 0 20px',
  },
}

const MasterComponent = connect(state => ({
  mixer : state.mixer,
}))(Master)

export default MasterComponent
