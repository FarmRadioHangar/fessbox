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
import Subheader 
  from 'material-ui/lib/Subheader'
import Divider 
  from 'material-ui/lib/divider'
import IconButton
  from 'material-ui/lib/icon-button'

class Master extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { 
      mixer : { 
        master,
      }, 
      sendMessage,
    } = this.props
    return (
      <Paper>
        <Subheader>Master</Subheader>
        <Divider />
        <div style={styles.controls}>
          <div>
            <IconButton>
              <IconVolumeUp />
            </IconButton>
          </div>
          <div style={styles.slider}>
            <Slider 
              min           = {1}
              max           = {100}
              defaultValue  = {master.out ? master.out.level : 1}
              onChange      = {e => {}}
            />
          </div>
          <div>
            <IconButton>
              <IconMic />
            </IconButton>
          </div>
          <div style={styles.slider}>
            <Slider 
              min           = {1}
              max           = {100}
              defaultValue  = {master.in ? master.in.level : 1}
              onChange      = {e => {}}
            />
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

export default connect(state => ({
  mixer : state.mixer,
}))(Master)
