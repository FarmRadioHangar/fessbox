import React  from 'react'
import Slider from './Slider'

import { updateHostLevel, updateLevel }
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
            disabled     = {!!muted}
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
      [client.hostId] : muted
    })
  }
  updateChannelLevel(level) {
    const { sendMessage, client, dispatch } = this.props
    sendMessage('channelVolume', {
      [client.hostId] : level
    })
    dispatch(updateLevel(client.hostId, level))
  }
  setHostMuted(muted) {
    const { sendMessage, client } = this.props
    sendMessage('hostMuted', {
      [client.hostId] : { muted }
    })
  }
  updateHostLevel(level) {
    const { sendMessage, client, dispatch } = this.props
    sendMessage('hostVolume', {
      [client.hostId] : level 
    })
    dispatch(updateHostLevel(client.hostId, level))
  }
  render() {
    const { client, mixer } = this.props
    if (!mixer.hosts || !mixer.channels) {
      return <span />
    }
    const host = mixer.hosts[client.hostId]
    const channel = mixer.channels[client.hostId]
    const hostMuted = host.muted_out || host.muted
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
            value         = {host.level_out || host.level}
            defaultValue  = {host.level_out || host.level}
            muted         = {hostMuted}
            onChange      = {(from, to) => { this.updateHostLevel(to) }}
            onToggleMuted = {() => { this.setHostMuted(!hostMuted) }} />
        </div>
      </div>
    )
  }
}

export default Host
