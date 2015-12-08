import React       from 'react'
import classNames  from 'classnames'
import moment      from 'moment'
import Slider      from './Slider'

import { updatePreset, updateLevel, updateCaller } 
  from '../js/actions'
import { Modal }   from 'react-bootstrap'

import entries     from './testdata/entries'
import randomize   from './testdata/randomize'

/*
class LookupResults extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { results, onSelectionChange } = this.props
    return (
      <div 
        className = 'list-group ' 
        style     = {{position: 'absolute', width: '500px', margin: '-1px 0 0 0', padding: 0, zIndex: 4}}>
        {results.map((result, key) => {
          return (
            <a 
              key       = {key} 
              className = 'list-group-item' 
              href      = '#' 
              onClick   = {() => onSelectionChange(result)}>
              <p className='list-group-item-text'>
                <span style={{float: 'right', minWidth: '180px'}}>
                  {result.phone}
                </span>
                <b>{result.name}</b>
              </p>
            </a>
          )
        })}
      </div>
    )
  }
}

class LookupInput extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { 
      hasEntry, 
      value, 
      onChange, 
      onReset, 
      onCallNumber, 
      isValidNumber
    } = this.props
    const inputStyle = hasEntry ? {
      backgroundColor: '#fff4a8'
    } : isValidNumber ? {
      backgroundColor: '#a8f4a8'
    } : {}
    return (
      <div>
        <div className='input-group input-group-sm'>
          <input 
            className   = 'form-control'
            type        = 'text'
            style       = {inputStyle}
            value       = {value}
            onChange    = {onChange} />
          <div className='input-group-btn'>
            <button 
              disabled  = {!value}
              onClick   = {onReset} 
              type      = 'button' 
              className = 'btn btn-default'>
              <span className='glyphicon glyphicon-remove'></span>
            </button>
            <button 
              disabled  = {!hasEntry && !isValidNumber}
              onClick   = {onCallNumber} 
              type      = 'button' 
              className = 'btn btn-default'>
              <span style={{top: '1px'}} className='glyphicon glyphicon-earphone'></span>
            </button>
          </div>
        </div>
      </div>
    )
  }
}
*/


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
      'name'     : this.refs.callerName.value,
      'location' : this.refs.callerLocation.value
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
    const { mode, contact } = this.props
    const { editMode } = this.state
    if ('free' === mode) {
      return (
        <div>
          <p style={{margin: 0}}>Free line</p>
          {/*
          <PhoneLookup 
            inputComponent   = {LookupInput}
            resultsComponent = {LookupResults}
            entries          = {entries.map(entry => ({ ...entry, phone : randomize() }))} />
          */}
        </div>
      )
    } else if ('ring' === mode) {
      return (
        <div style={{display: 'flex'}}>
          <div style={{flex: 1}}>
            <div>
              <p style={{margin: 0}}>
                Incoming call:
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
      return (
        <div style={{textAlign: 'center', fontSize: '160%'}}> 
          Defunct
          {/*
          <span className='fa-stack fa-lg'>
            <i className='fa fa-circle fa-stack-2x' style={{color: '#5cb85c'}} />
            <i className='fa fa-phone fa-stack-1x fa-inverse' />
          </span>
          */}
        </div>
      )
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
                <span className='glyphicon glyphicon-pen' />&nbsp;Edit caller 
              </button>&nbsp;&nbsp;
              <button 
                onClick   = {() => this.disconnectCall()}
                type      = 'button'
                style     = {styles.callButton}
                className = 'btn btn-default btn-lg btn-danger'>
                <span style={{'top': '2px'}} className='glyphicon glyphicon-remove'></span>&nbsp;Hang up
              </button>
            </div>
          </div>
          <Modal show={editMode} onHide={() => this.endEditCaller()}>
            <Modal.Header>
              Edit caller details
            </Modal.Header>
            <Modal.Body>
              <div>
                <label>Name</label>
                <input 
                  ref          = 'callerName'
                  type         = 'text'
                  className    = 'form-control'
                  placeholder  = 'Name'
                  defaultValue = {contact ? contact.name : ''} />
              </div>
              <div>
                <label style={{marginTop: '8px'}}>Location</label>
                <input 
                  ref          = 'callerLocation'
                  type         = 'text'
                  className    = 'form-control'
                  placeholder  = 'Location'
                  defaultValue = {contact ? contact['location'] : ''} />
              </div>
              <div style={{marginTop: '10px'}}>
                <button 
                  onClick      = {() => this.updateCaller()}
                  type         = 'button'
                  className    = 'btn btn-default btn-primary'>
                  <span className='glyphicon glyphicon-ok' />&nbsp;Save
                </button>&nbsp;&nbsp;
                <button 
                  onClick      = {() => this.endEditCaller()} 
                  type         = 'button' 
                  className    = 'btn btn-default'>
                  Cancel
                </button>
              </div>
            </Modal.Body>
          </Modal>
          {/*
          {!!this.state.editMode && (
            <div style={{
              margin    : '20px 100px',
              textAlign : 'left'
            }}>
              <div>
                <label>Name</label>
                <input ref='callerName' type='text' className='form-control' placeholder='Name' defaultValue={contact ? contact.name : ''} />
              </div>
              <div>
                <label style={{marginTop: '8px'}}>Location</label>
                <input ref='callerLocation' type='text' className='form-control' placeholder='Location' defaultValue={contact ? contact.location : ''} />
              </div>
              <div style={{marginTop: '10px'}}>
                <button onClick={this.updateCaller.bind(this)} type='button' className='btn btn-default btn-primary'>
                  Save
                </button>
                &nbsp;&nbsp;<button onClick={this.endEditCaller.bind(this)} type='button' className='btn btn-default'>
                  Cancel
                </button>
              </div>
            </div>
          )}
          */}
          {/*
          <span className='fa-stack fa-lg'>
            <i className='fa fa-circle fa-stack-2x' style={{color: '#337ab7'}} />
            <i className='fa fa-phone fa-stack-1x fa-inverse' />
          </span>
          <h4>
            {mode}
          </h4>
          */}
        </div>
      )
    }
  }
  renderModeSwitch(color) {
    const modes = ['host', 'master', 'on_hold', 'ivr']
    const labels = {
      host    : 'Host',
      master  : 'Master',
      on_hold : 'On hold',
      ivr     : 'IVR'
    }
    const icons = {
      host    : 'mic',
      master  : 'radio',
      on_hold : 'pause',
      ivr     : 'voicemail'
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
                {/* <i className='material-icons'>{icons[mode]}</i> */}
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
        color : 'info',
        bg    : 'rgba(91, 192, 222, .2)'
      }
    } else if ('master' === mode) {
      return {
        color : 'primary',
        bg    : 'rgba(69, 130, 236, .2)'
      }
    } else if ('on_hold' === mode) {
      return {
        color : 'success',
        bg    : 'rgba(63, 173, 70, .2)'
      }
    } else if ('ivr' === mode) {
      return {
        color : 'warning',
        bg    : 'rgba(240, 173, 78, .2)'
      }
    } else if ('ring' === mode) {
      return {
        color : 'danger',
        bg    : 'rgba(217, 83, 79, .2)'
      }
    } else { /* host */
      return {
        color : 'default',
        bg    : 'transparent'
      }
    }
  }
  render() {
    const { channelId, number, contact, mode, level, muted, timestamp } = this.props
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
          </div>
        </div>
        <div className='panel-body' style={{backgroundColor: bg}}>
          {this.renderChannelMode()}
        </div>
        {'defunct' !== mode && (
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
  }
}

//                  {/*
//                  <span style={{marginLeft: '10px'}}>
//                    <Switch 
//                      labelText = 'Auto-answer'
//                      onText    = 'On'
//                      offText   = 'Off'
//                      size      = 'mini' />
//                  </span>
//                  */}

//          <div style={{__border: '1px solid #ddd'}}> 
//        <div style={{background: this.getBgColor(mode), border: '1px solid #ddd', margin: '11px'}}>
//        </div>
//            <div style={{display: 'flex', padding: '8px'}}>
//              <div style={{flex: 11, __border: '1px solid #ddd'}}>
//                <h4 style={{margin: 0}}>{channelId}&nbsp;{number}</h4>
//              </div>
//              {!!timestamp && (
//                <div style={{flex: 1, __border: '1px solid #ddd', textAlign: 'right'}}>
//                  {hours > 0 && <span>{hours}:</span>}{moment(moment(now).diff(timestamp)).format('mm:ss')}
//                </div>
//              )}
//            </div>
//          </div>
//          <div> 
//            {this.renderChannelMode()}
//          </div>
//          {'defunct' !== mode && (
//            <div>
//              <div style={{__border: '1px solid #f00', display: 'flex', padding: '8px'}}> 
//                <button 
//                  disabled  = {'ivr' === mode}
//                  className = 'btn btn-default btn-large'
//                  onClick   = {this.toggleMuted.bind(this)}
//                  style     = {{marginTop: '6px'}}>
//                  <i className={muted ? 'glyphicon glyphicon-volume-off' : 'glyphicon glyphicon-volume-up'} />
//                </button>
//                <div style={{__border: '1px solid #f00', flex: 6, padding: '18px 10px 0 16px'}}>
//                  <Slider 
//                    min          = {1}
//                    max          = {100}
//                    style        = {{width: '100%'}}
//                    value        = {level}
//                    defaultValue = {level}
//                    onChange     = {(from, to) => this.updateLevel(to)}
//                    enabled      = {!muted && 'ivr' !== mode} />
//                </div>
//                <div style={{__border: '1px solid #f00', padding: '6px 0 0 6px'}}>
//                  {this.renderModeSwitch()}
//                  {/*
//                  <span style={{marginLeft: '10px'}}>
//                    <Switch 
//                      labelText = 'Auto-answer'
//                      onText    = 'On'
//                      offText   = 'Off'
//                      size      = 'mini' />
//                  </span>
//                  */}
//                </div>
//              </div>
//            </div>
//          )}
//        </div>

export default Channel
