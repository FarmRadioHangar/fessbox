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

class Master extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { mixer : { master } } = this.props
    return (
      <Paper>
        <Subheader>Master</Subheader>
        <Divider />
        <div style={styles.controls}>
          <div>
            <IconVolumeUp />
          </div>
          <div style={styles.slider}>
            <Slider 
              min           = {1}
              max           = {100}
              defaultValue  = {master.out.level}
            />
          </div>
          <div>
            <IconMic />
          </div>
          <div style={styles.slider}>
            <Slider 
              min           = {1}
              max           = {100}
              defaultValue  = {master.in.level}
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

const MasterComponent = connect(state => ({
  mixer : state.mixer,
}))(Master)

export default MasterComponent
