import React  from 'react'
import styles from '../styles/master'
import _      from 'lodash'

import { connect } 
  from 'react-redux'

import Paper 
  from 'material-ui/Paper'
import IconMic 
  from 'material-ui/svg-icons/av/mic'
import IconVolumeUp 
  from 'material-ui/svg-icons/av/volume-up'
import Slider 
  from 'material-ui/Slider'
import Subheader 
  from 'material-ui/Subheader'
import Divider 
  from 'material-ui/Divider'
import IconButton 
  from 'material-ui/IconButton'

class Master extends React.Component {
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

export default connect(state => _.pick(state, ['mixer']))(Master)
