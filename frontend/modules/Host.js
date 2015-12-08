import React  from 'react'
import Slider from './Slider'

import { updateUserLevel, updateLevel }
  from '../js/actions'

class SliderBar extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { 
      icon, 
      muted, 
      value,
      defaultValue, 
      onChange, 
      onToggleMuted 
    } = this.props
    return (
      <div className='panel panel-default'>
        <div className='panel-body' style={styles.panel}>
          <Slider 
            value        = {value} 
            defaultValue = {defaultValue} 
            onChange     = {onChange}
            enabled      = {!muted}
            orientation  = 'vertical'
            reversed     = {true}
            min          = {1}
            max          = {100} />
        </div>
        <div style={styles.buttonWrapper}> 
          <button 
            style        = {styles.button} 
            className    = 'btn btn-default btn-sm' 
            onClick      = {onToggleMuted}>
            <i className = {muted ? 'glyphicon glyphicon-volume-off' : 'glyphicon glyphicon-volume-up'} />
          </button>
        </div>
        <div style={styles.iconWrapper}> 
          <i className={`fa fa-${icon}`} />
        </div>
      </div>
    )
  }
}

class Host extends React.Component {
  constructor(props) {
    super(props)
  }
  setChannelMuted(muted) {
    const { sendMessage, client } = this.props
    sendMessage('channelMuted', {
      [client.userId] : muted
    })
  }
  updateChannelLevel(level) {
    const { sendMessage, client, dispatch } = this.props
    sendMessage('channelVolume', {
      [client.userId] : level
    })
    dispatch(updateLevel(client.userId, level))
  }
  setUserMuted(muted) {
    const { sendMessage, client } = this.props
    sendMessage('userMuted', {
      [client.userId] : muted 
    })
  }
  updateUserLevel(level) {
    const { sendMessage, client, dispatch } = this.props
    sendMessage('userVolume', {
      [client.userId] : level 
    })
    dispatch(updateUserLevel(client.userId, level))
  }
  render() {
    const user = users[client.userId]
    const channel = mixer.channels[client.userId]
    return (
      <div style={styles.wrapper}>
        <div style={styles.bar}> 
          <SliderBar 
            icon          = 'microphone' 
            value         = {channel.level}
            defaultValue  = {channel.level}
            muted         = {channel.muted}
            onChange      = {(from, to) => { this.updateChannelLevel(to) }}
            onToggleMuted = {() => { this.setChannelMuted(!channel.muted) }} />
        </div>
        <div style={styles.bar}> 
          <SliderBar 
            icon          = 'headphones' 
            value         = {user.level}
            defaultValue  = {user.level}
            muted         = {user.muted}
            onChange      = {(from, to) => { this.updateUserLevel(to) }}
            onToggleMuted = {() => { this.setUserMuted(!user.muted) }} />
        </div>
      </div>
    )
  }
}

const styles = {
  panel : { 
    textAlign    : 'center'
  },
  button : {
    lineHeight   : 1.9, 
    borderRadius : '50% 50%'
  },
  buttonWrapper : {
    textAlign    : 'center', 
    margin       : '0 0 12px 0'
  },
  iconWrapper : {
    textAlign    : 'center', 
    margin       : '0 0 8px', 
    fontSize     : '150%'
  },
  wrapper : {
    display      : 'flex'
  },
  bar : {
    flex         : 1, 
    minWidth     : '80px', 
    margin       : '11px 6px 11px 11px'
  }
}

export default Host
