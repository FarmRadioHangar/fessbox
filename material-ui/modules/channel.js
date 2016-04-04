import React          from 'react'
import ChannelToolbar from './channel-toolbar'

import Paper 
  from 'material-ui/lib/paper'
import Avatar 
  from 'material-ui/lib/avatar'
import Slider 
  from 'material-ui/lib/slider'
import FlatButton 
  from 'material-ui/lib/flat-button'
import Divider
  from 'material-ui/lib/divider'
import IconVolumeUp
  from 'material-ui/lib/svg-icons/av/volume-up'
import IconButton
  from 'material-ui/lib/icon-button'

import { green400 } 
  from 'material-ui/lib/styles/colors'

class Channel extends React.Component {
  updateVolume(e, value) {
    const { id, sendMessage } = this.props
    sendMessage('channelVolume', { 
      [id]: value
    })
  }
  setMode(newMode) {
    const { id, mode, sendMessage } = this.props
    if ('free' != mode) {
      sendMessage('channelMode', { 
        [id]: newMode 
      })
    }
  }
  renderControls() {
    const { 
      id, 
      level, 
      mode, 
      muted,
      sendMessage,
    } = this.props
    switch (mode) {
      case 'defunct':
        return (
          <span />
        ) 
      case 'free':
      default:
        return (
          <div style={styles.controls}>
            <div style={styles.avatar}>
              <Avatar icon={<i className='material-icons'>remove</i>} />
            </div>
            <IconButton>
              <IconVolumeUp />
            </IconButton>
            <div style={styles.slider}>
              <Slider 
                onChange      = {::this.updateVolume}
                disabled      = {muted}
                min           = {1}
                max           = {100}
                value         = {level}
                defaultValue  = {level} />
            </div>
          </div>
        )
    }
  }
  renderActions() {
    const { mode } = this.props
    switch (mode) {
      case 'free':
      case 'defunct':
        return (
          <span />
        ) 
      default:
        return (
          <div>
            <Divider />
            <div style={{padding: '10px'}}>
              <FlatButton
                style      = {styles.button}
                primary    = {true} 
                label      = 'Master'
                icon       = {<i className='material-icons'>speaker</i>}
                onClick    = {() => this.setMode('master')}
              />
              <FlatButton
                style      = {styles.button}
                primary    = {true} 
                label      = 'On hold'
                icon       = {<i className='material-icons'>pause</i>}
                onClick    = {() => this.setMode('on_hold')}
              />
              <FlatButton
                style      = {styles.button}
                secondary  = {true}
                label      = 'Reject'
                icon       = {<i className='material-icons'>cancel</i>}
                onClick    = {() => this.setMode('free')}
              />
            </div>
          </div>
        )
    }
  }
  render() {
    const { mode } = this.props
    const colors = {
      defunct : '#dedede',
    }
    return (
      <div style={styles.component}>
        <Paper style={{
            ...styles.paper,
            borderLeft : `12px solid ${colors[mode] || green400}`,
          }}>
          <ChannelToolbar {...this.props} />
          {this.renderControls()}
          {this.renderActions()}
        </Paper>
      </div>
    )
  }
}

const styles = {
  component: {
    padding         : '1em 1em 0 1em',
  },
  paper: {
    width           : '100%',
  },
  controls: {
    display         : 'flex',
    flexDirection   : 'row', 
    alignItems      : 'center',
    height          : '60px',
    marginBottom    : '10px',
    padding         : '10px 0',
  },
  avatar: {
    padding         : '0 0 0 20px',
  },
  slider: {
    margin          : '22px 20px 0 20px',
    width           : '100%',
  },
}

export default Channel
