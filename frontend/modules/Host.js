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
      <div style={{marginTop: '12px'}}>
        <div style={{textAlign: 'center'}}> 
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
        <div style={{textAlign: 'center', margin: '12px 0'}}> 
          <button onClick={onToggleMuted}>
            <i className={muted ? 'glyphicon glyphicon-volume-off' : 'glyphicon glyphicon-volume-up'} />
          </button>
        </div>
        <div style={{textAlign: 'center', padding: '.7em'}}> 
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
    const { client, mixer, users } = this.props
    if (!users || !users[client.userId] || !mixer.channels) {
      return (
        <span>
          No host?
        </span>
      )
    }
    const user = users[client.userId]
    const channel = mixer.channels[client.userId]
    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 1, minWidth: '80px'}}> 
          <SliderBar 
            icon          = 'microphone' 
            value         = {channel.level}
            defaultValue  = {channel.level}
            muted         = {channel.muted}
            onChange      = {(from, to) => { this.updateChannelLevel(to) }}
            onToggleMuted = {() => { this.setChannelMuted(!channel.muted) }} />
        </div>
        <div style={{flex: 1, minWidth: '80px'}}> 
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

export default Host
