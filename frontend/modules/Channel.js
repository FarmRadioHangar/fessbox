import React       from 'react'
import classNames  from 'classnames'
import moment      from 'moment'
import Slider      from './Slider'

import { updatePreset, updateLevel, updateCaller } 
  from '../js/actions'
import { Modal }   from 'react-bootstrap'

class Channel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editMode : false,
      timer    : null,
      now      : Date.now()
    }
  }
  toggleMuted() {
    const { muted, channelId, sendMessage } = this.props
    sendMessage('channelMuted', {
      [channelId] : !muted
    })
  }
  updateLevel(event) {
    const { dispatch, channelId, sendMessage } = this.props
    const value = event.target ? event.target.value : event
    sendMessage('channelVolume', {
      [channelId] : value
    })
    dispatch(updateLevel(channelId, value))
  }
  answerCall() {
    const { channelId, sendMessage, client } = this.props
    const chan = client.channels[channelId] || { preset: 'master' }
    console.log(`answer in mode ${chan.preset}`)
    sendMessage('channelMode', {
      [channelId] : 'host' === chan.preset ? ''+client.userId : chan.preset
    })
  }
  disconnectCall() {
    const { channelId, sendMessage } = this.props
    sendMessage('channelMode', {
      [channelId] : 'free'
    })
  }
  updateMode(mode) {
    const { channelId, dispatch, sendMessage, client } = this.props
    sendMessage('channelMode', {
      [channelId] : 'host' === mode ? ''+client.userId : mode
    })
    dispatch(updatePreset(channelId, mode))
  }
  beginEditCaller() {
    this.setState({editMode : true})
  }
  endEditCaller() {
    this.setState({editMode : false})
  }
  updateCaller() {
    const { channelId, dispatch, sendMessage } = this.props
    const caller = {
      'name'     : this.refs.callerName.value
      //'location' : this.refs.callerLocation.value
    }
    dispatch(updateCaller(channelId, caller))
    sendMessage('channelContactInfo', { 
      [channelId] : caller 
    })
    this.endEditCaller()
  }
  timer() {
    const { timestamp, client : { diff } } = this.props
    if (timestamp) {
      this.setState({
        now : Date.now() - diff
      })
    }
  }
  componentDidMount() {
    this.setState({
      timer : window.setInterval(this.timer.bind(this), 1000)
    })
  }
  componentWillUnmount() {
    const { timer } = this.state
    if (timer) {
      window.clearInterval(timer) 
    }
  }
  renderChannelMode() {
    const { mode, contact, t } = this.props
    const { editMode } = this.state
    if ('free' === mode) {
      return (
        <p style={{margin: 0}}>{t('Free line')}</p>
      )
    } else if ('ring' === mode) {
      return (
        <div style={{display: 'flex'}}>
          <div style={{flex: 1}}>
            <div>
              <p style={{margin: 0}}>
                {t('Incoming call')}:
              </p>
              <h4 style={{margin: '4px 0'}}>
                {contact.number}
                {contact.name && (
                  <span>
                    <span style={{margin: '0 6px 0 20px'}} className='glyphicon glyphicon-user' />
                    {contact['location'] ? `${contact.name}, ${contact['location']}` : contact.name}
                  </span>
                )}
              </h4>
            </div>
          </div>
          <div style={{flex: 1}}>
            <div style={{textAlign: 'right'}}>
              <button 
                onClick     = {() => this.answerCall()}
                type        = 'button'
                style       = {styles.callButton}
                className   = 'btn btn-default btn-lg btn-success'>
                <span 
                  style     = {{'top': '2px'}} 
                  className = 'glyphicon glyphicon-earphone' />&nbsp;
                  Accept
              </button>&nbsp;&nbsp;
              <button 
                onClick     = {() => this.disconnectCall()} 
                type        = 'button' 
                style       = {styles.callButton} 
                className   = 'btn btn-default btn-lg btn-danger'>
                <span 
                  style     = {{'top': '2px'}} 
                  className = 'glyphicon glyphicon-remove' />&nbsp;
                  Reject
              </button>
            </div>
          </div>
        </div>
      )
    } else if ('defunct' === mode) {
      return <span />
    } else {
      return (
        <div>
          <div style={{display: 'flex'}}>
            <div style={{flex: 1}}>
              {contact && (
                <div>
                  <h4 style={{marginBottom: '8px'}}>{contact.number}</h4>
                  {contact.name && (
                    <p style={{margin: 0}}>
                      <span className='glyphicon glyphicon-user' />&nbsp;{contact['location'] ? `${contact.name}, ${contact['location']}` : contact.name}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div style={{flex: 1, textAlign: 'right'}}>
              <button 
                onClick   = {() => this.beginEditCaller()}
                type      = 'button'
                style     = {styles.callButton}
                className = 'btn btn-default btn-lg'>
                <span className='glyphicon glyphicon-pen' />&nbsp;{t('Edit caller')} 
              </button>&nbsp;&nbsp;
              <button 
                onClick   = {() => this.disconnectCall()}
                type      = 'button'
                style     = {styles.callButton}
                className = 'btn btn-default btn-lg btn-danger'>
                <span style={{'top': '2px'}} className='glyphicon glyphicon-remove'></span>&nbsp;{t('Hang up')}
              </button>
            </div>
          </div>
          <Modal show={editMode} onHide={() => this.endEditCaller()}>
            <Modal.Header>
              {t('Edit caller details')}
            </Modal.Header>
            <Modal.Body>
              <div>
                <label>{t('Name')}</label>
                <input 
                  ref          = 'callerName'
                  type         = 'text'
                  className    = 'form-control'
                  placeholder  = {t('Name')}
                  defaultValue = {contact ? contact.name : ''} />
              </div>
              {/*
              <div>
                <label style={{marginTop: '8px'}}>{t('Location')}</label>
                <input 
                  ref          = 'callerLocation'
                  type         = 'text'
                  className    = 'form-control'
                  placeholder  = {t('Location')}
                  defaultValue = {contact ? contact['location'] : ''} />
              </div>
              */}
              <div style={{marginTop: '10px'}}>
                <button 
                  onClick      = {() => this.updateCaller()}
                  type         = 'button'
                  className    = 'btn btn-default btn-primary'>
                  <span className='glyphicon glyphicon-ok' />&nbsp;{t('Save')}
                </button>&nbsp;&nbsp;
                <button 
                  onClick      = {() => this.endEditCaller()} 
                  type         = 'button' 
                  className    = 'btn btn-default'>
                  {t('Cancel')}
                </button>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      )
    }
  }
  renderModeSwitch(color) {
    const { t } = this.props
    /* const modes = ['host', 'master', 'on_hold', 'ivr'] */
    const modes = ['host', 'master', 'on_hold']
    const labels = {
      host    : t('Host'),
      master  : t('Master'),
      on_hold : t('On hold'),
      ivr     : t('IVR'),
    }
    const icons = {
      host    : 'mic',
      master  : 'radio',
      on_hold : 'pause',
      ivr     : 'voicemail',
    }
    const { channelId, client : { channels } } = this.props
    const chan = channels[channelId] || { preset : 'master' }
    return (
      <div style={styles.modeSwitchWrapper}>
        <div className='btn-group btn-group-lg' role='group'>
          {modes.map((mode, i) => {
            return (
              <button 
                disabled  = {'ivr' === this.props.mode}
                key       = {i}
                type      = 'button'
                className = {classNames(`btn btn-default btn-${color}`, { 'active' : chan.preset == mode })}
                onClick   = {() => { this.updateMode(mode) }}>
                {labels[mode]}
              </button>
            )
          })}
        </div>
      </div>
    )
  }
  getPanelStyle() {
    const { mode } = this.props
    if ('free' === mode) {
      return {
        color : 'success',
        bg    : 'rgba(63, 173, 70, .2)'
      }
    } else if ('master' === mode) {
      return {
        color : 'danger',
        bg    : 'rgba(217, 83, 79, .2)'
      }
    } else if ('on_hold' === mode) {
      return {
        color : 'warning',
        bg    : 'rgba(240, 173, 78, .2)'
      }
    } else if ('ivr' === mode) {
      return {
        color : 'primary',
        bg    : 'rgba(69, 130, 236, .2)'
      }
    } else if ('ring' === mode) {
      return {
        color : 'info',
        bg    : 'rgba(91, 192, 222, .2)'
      }
    } else if ('defunct' === mode) {
      return {
        color : 'default',
        bg    : 'transparent'
      }
    } else { /* host */
      return {
        color : 'default',
        bg    : 'transparent'
      }
    }
  }
  render() {
    const { channelId, number, contact, mode, level, muted, timestamp, t } = this.props
    const { color, bg } = this.getPanelStyle()
    const hours = moment(this.state.now).diff(timestamp, 'hours')
    return (
      <div className={`panel panel-default panel-${color}`} style={{margin: '11px'}}>
        <div className='panel-heading'>
          <div style={{display: 'flex'}}>
            <div style={{flex: 1}}>
              {channelId}&nbsp;{number}
            </div>
            {!!timestamp && (
              <div style={{width: '140px', textAlign: 'right'}}>
                {hours > 0 && <span>{hours}:</span>}{moment(moment(this.state.now).diff(timestamp)).format('mm:ss')}
              </div>
            )}
            {'defunct' === mode && (
              <span className='label label-danger' style={{
                fontWeight    : 700,
                lineHeight    : 1.6,
                textTransform : 'uppercase'
              }}>{t('Defunct')}</span>
            )}
          </div>
        </div>
        {'defunct' !== mode && (
          <div>
            <div className='panel-body' style={{backgroundColor: bg}}>
              {this.renderChannelMode()}
            </div>
            <div className='panel-footer'>
              <div style={styles.controls}> 
                <button 
                  disabled       = {'ivr' === mode}
                  className      = {`btn btn-default btn-${color} btn-large`}
                  onClick        = {() => this.toggleMuted()}
                  style          = {styles.muteButton}>
                  <i className={muted ? 'glyphicon glyphicon-volume-off' : 'glyphicon glyphicon-volume-up'} />
                </button>
                <div style={styles.sliderWrapper}>
                  <Slider 
                    min          = {1}
                    max          = {100}
                    style        = {styles.slider.horizontal}
                    value        = {level}
                    defaultValue = {level}
                    onChange     = {(from, to) => this.updateLevel(to)}
                    enabled      = {!muted && 'ivr' !== mode} />
                </div>
                {this.renderModeSwitch(color)}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

const styles = {
  modeSwitchWrapper : {
    padding      : '6px 0 0 6px'
  },
  muteButton : {
    marginTop    : '6px', 
    padding      : '0 20px'
  },
  sliderWrapper : {
    flex         : 6, 
    padding      : '21px 10px 0 16px'
  },
  controls : {
    display      : 'flex', 
    marginBottom : '6px'
  },
  callButton : {
    borderRadius : '32px', 
    minWidth     : '130px'
  },
  slider : {
    horizontal : {
      width      : '100%'
    }
  },
}

export default Channel
