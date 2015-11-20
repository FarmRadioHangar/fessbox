import React  from 'react'
import Slider from './Slider'

class SliderBar extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { 
      icon, 
      muted, 
      defaultValue, 
      onChange, 
      onToggleMuted 
    } = this.props
    return (
      <div style={{marginTop: '12px'}}>
        <div style={{textAlign: 'center'}}> 
          <Slider 
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
  setMuted(direction, muted) {
    const { sendMessage, client } = this.props
    sendMessage('hostMuted', {
      [client.hostId] : { direction, muted }
    })
  }
  updateLevel(direction, level) {
    const { sendMessage, client } = this.props
    sendMessage('hostVolume', {
      [client.hostId] : { direction, level }
    })
  }
  render() {
    const { client, mixer } = this.props
    if (!mixer.hosts || !mixer.hosts[client.hostId]) {
      return (
        <div>
          No host
        </div>
      )
    }
    const { 
      level_in, 
      level_out, 
      muted_in, 
      muted_out 
    } = mixer.hosts[client.hostId]
    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 1, minWidth: '80px'}}> 
          <SliderBar 
            icon          = 'microphone' 
            defaultValue  = {level_in}
            muted         = {muted_in}
            onChange      = {(from, to) => { this.updateLevel('in', to) }}
            onToggleMuted = {() => { this.setMuted('in', !muted_in) }} />
        </div>
        <div style={{flex: 1, minWidth: '80px'}}> 
          <SliderBar 
            icon          = 'headphones' 
            defaultValue  = {level_out}
            muted         = {muted_out}
            onChange      = {(from, to) => { this.updateLevel('out', to) }}
            onToggleMuted = {() => { this.setMuted('out', !muted_out) }} />
        </div>
      </div>
    )
  }
}

export default Host
