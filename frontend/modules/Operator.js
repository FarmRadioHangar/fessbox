import React       from 'react'
import classNames  from 'classnames'
import Slider      from './Slider'

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
      onToggleMuted,
      panelStyle,
    } = this.props
    return (
      <div className='panel panel-default' style={panelStyle}>
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
            <i className = {`glyphicon glyphicon-volume-${muted ? 'off' : 'up'}`} />
          </button>
        </div>
        <div style={styles.iconWrapper}> 
          <i className={`fa fa-${icon}`} />
        </div>
      </div>
    )
  }
}

class Operator extends React.Component {
  constructor(props) {
    super(props)
  }
  setChannelMuted(muted) {
    const { sendMessage, client, users : { _userId } } = this.props
    sendMessage('channelMuted', {
      [_userId] : muted
    })
  }
  updateChannelLevel(level) {
    const { sendMessage, client, dispatch, users : { _userId } } = this.props
    sendMessage('channelVolume', {
      [_userId] : level
    })
    dispatch(updateLevel(_userId, level))
  }
  setUserMuted(muted) {
    const { sendMessage, client, dispatch, users : { _userId } } = this.props
    sendMessage('userMuted', {
      [_userId] : muted 
    })
  }
  updateUserLevel(level) {
    const { sendMessage, client, dispatch, users : { _userId } } = this.props
    sendMessage('userVolume', {
      [_userId] : level 
    })
    dispatch(updateUserLevel(_userId, level))
  }
  toggleMode(mode) {
    const { sendMessage, users } = this.props
    sendMessage('channelMode', {
      [users._userId] : mode
    })
  }
  render() {
    const { client, mixer, users, t } = this.props
    const userId = users._userId
    const user = users[userId]
    const channel = mixer.channels[userId]
    if (!channel || !user) {
      return <span />
    }
    return (
      <div style={{display : 'flex', flexDirection: 'column'}}>
        <div>
          <div style={styles.wrapper}>
            <div style={styles.bar}>
              <SliderBar 
                panelStyle    = {{
                  backgroundColor : 'master' == channel.mode ? '#f04124' : 'transparent'
                }}
                icon          = 'microphone' 
                value         = {channel.level}
                defaultValue  = {channel.level}
                muted         = {channel.muted}
                onChange      = {(from, to) => { this.updateChannelLevel(to) }}
                onToggleMuted = {() => { this.setChannelMuted(!channel.muted) }} />
            </div>
            <div style={{...styles.bar, margin: '11px'}}> 
              <SliderBar 
                icon          = 'headphones' 
                value         = {user.level}
                defaultValue  = {user.level}
                muted         = {user.muted}
                onChange      = {(from, to) => { this.updateUserLevel(to) }}
                onToggleMuted = {() => { this.setUserMuted(!user.muted) }} />
            </div>
          </div>
        </div>
        <div>
          <div style={{
            width     : '100%',
            textAlign : 'center',
          }}>
            {/*
            <div>
              Channel mode : {channel.mode}
            </div>
            */}
            <button 
              style     = {{width: '80%'}}
              type      = 'button'
              className = {`btn btn-default ${'master' == channel.mode ? 'btn-danger' : 'btn-success'}`} 
              onClick   = {() => { this.toggleMode('master' == channel.mode ? 'free' : 'master') }}>
              {t('Master')}
            </button>
          </div>
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
    margin       : '0 0 12px', 
    fontSize     : '150%'
  },
  wrapper : {
    display      : 'flex'
  },
  bar : {
    flex         : 1, 
    minWidth     : '80px', 
    margin       : '11px 6px 11px 11px'
  },
}

export default Operator
