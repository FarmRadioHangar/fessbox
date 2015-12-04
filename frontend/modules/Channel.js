import React       from 'react'
import classNames  from 'classnames'
import PhoneLookup from 'frh-react-phone-lookup'
import Switch      from 'react-bootstrap-switch'
import Slider      from './Slider'
import moment      from 'moment'

import { updatePreset, updateLevel, updateCaller } 
  from '../js/actions'
import { ListGroupItem } 
  from 'react-bootstrap'

import entries     from './testdata/entries'
import randomize   from './testdata/randomize'

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
            className = 'form-control'
            type      = 'text'
            style     = {inputStyle}
            value     = {value}
            onChange  = {onChange} />
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
    const { dispatch, muted, channelId, sendMessage } = this.props
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
    const { dispatch, channelId, sendMessage, client } = this.props
    const chan = client.channels[channelId] || {preset: 'master'}
    console.log(`answer in mode ${chan.preset}`)
    sendMessage('channelMode', {
      [channelId] : 'host' === chan.preset ? ''+client.userId : chan.preset
    })
  }
  rejectCall() {
    const { channelId, sendMessage } = this.props
    sendMessage('channelMode', {
      [channelId] : 'free'
    })
  }
  hangUpCall() {
    console.log('hang up')
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
    this.setState({
      editMode : true
    })
  }
  endEditCaller() {
    this.setState({
      editMode : false
    })
  }
  updateCaller() {
    const { channelId, dispatch, sendMessage } = this.props
    const caller = {
      'name'     : this.refs.callerName.value,
      'location' : this.refs.callerLocation.value
    }
    dispatch(updateCaller(channelId, caller))
    sendMessage('channelContactInfo', { [channelId] : caller })
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
    if ('free' === mode) {
      return (
        <div>
          <PhoneLookup 
            inputComponent   = {LookupInput}
            resultsComponent = {LookupResults}
            entries          = {entries.map(entry => ({ ...entry, phone : randomize() }))} />
        </div>
      )
    } else if ('ring' === mode) {
      return (
        <div style={{textAlign: 'center'}}>
          <h4 style={{marginBottom: '3px'}}>
            {contact.number}
          </h4>
          {contact.name && (
            <p>
              {contact.location ? `${contact.name}, ${contact.location}` : contact.name}
            </p>
          )}
          <button onClick={this.answerCall.bind(this)} type='button' style={{borderRadius: '22px', minWidth: '130px'}} className='btn btn-default btn-success'>
            <span style={{top: '2px'}} className='glyphicon glyphicon-earphone'></span>&nbsp;Accept
          </button>
          &nbsp;&nbsp;<button onClick={this.rejectCall.bind(this)} type='button' style={{borderRadius: '22px', minWidth: '130px'}} className='btn btn-default btn-danger'>
            <span style={{top: '2px'}} className='glyphicon glyphicon-remove'></span>&nbsp;Reject
          </button>
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
        <div style={{textAlign: 'center'}}>
          {contact && (
            <div>
              <h4 style={{marginBottom: '3px'}}>
                {contact.number}
              </h4>
              {contact.name && (
                <p>
                  {contact.location ? `${contact.name}, ${contact.location}` : contact.name}
                </p>
              )}
            </div>
          )}
          <button onClick={this.beginEditCaller.bind(this)} type='button' style={{borderRadius: '22px', minWidth: '130px'}} className='btn btn-default'>
            Edit caller details
          </button>
          &nbsp;&nbsp;<button onClick={this.hangUpCall.bind(this)} type='button' style={{borderRadius: '22px', minWidth: '130px'}} className='btn btn-default btn-danger'>
            <span style={{top: '2px'}} className='glyphicon glyphicon-remove'></span>&nbsp;Hang up
          </button>
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
  renderIcon(mode) {
    if ('host' === mode) {
      return (
        <i className='material-icons'>mic</i>
      )
    } else if ('master' === mode) {
      return (
        <i className='material-icons'>radio</i>
      )
    } else if ('on_hold' === mode) {
      return (
        <i className='material-icons'>pause</i>
      )
    } else if ('ivr' === mode) {
      return (
        <i className='material-icons'>voicemail</i>
      )
    }
    return <span />
  }
  renderModeSwitch() {
    const modes = ['host', 'master', 'on_hold', 'ivr']
    const labels = {
      host    : 'Host',
      master  : 'Master',
      on_hold : 'On hold',
      ivr     : 'IVR'
    }
    const { channelId, client : { channels } } = this.props
    const chan = channels[channelId] || {preset: 'master'}
    return (
      <div className='btn-group btn-group-lg' role='group'>
        {modes.map((mode, i) => {
          return (
            <button 
              disabled  = {'ivr' === this.props.mode}
              key       = {i}
              type      = 'button'
              className = {classNames('btn btn-default', { 'active' : chan.preset == mode })}
              onClick   = {() => { this.updateMode(mode) }}>
              {/*this.renderIcon(mode)*/}
              {labels[mode]}
            </button>
          )
        })}
      </div>
    )
  }
  getBgColor(mode) {
    if ('free' === mode) {
      return '#fff'
    } else if ('master' === mode) {
      return '#ffc'
    } else if ('on_hold' === mode) {
      return '#fdd'
    } else if ('ivr' === mode) {
      return '#ddf'
    } else if ('ring' === mode) {
      return '#fdf'
    } else {
      /* host */
      return '#dfd'
    }
  }
  render() {
    const { channelId, number, contact, mode, level, muted, timestamp } = this.props
    const { now } = this.state
    const hours = moment(now).diff(timestamp, 'hours')
    return (
      <div>
        <div style={{background: this.getBgColor(mode), border: '1px solid #ddd', margin: '11px'}}>
          <div style={{__border: '1px solid #ddd'}}> 
            <div style={{display: 'flex', padding: '8px'}}>
              <div style={{flex: 11, __border: '1px solid #ddd'}}>
                <h3>
                  {channelId}&nbsp;{number}
                </h3>
              </div>
              {!!timestamp && (
                <div style={{flex: 1, __border: '1px solid #ddd', textAlign: 'right'}}>
                  {hours > 0 && <span>{hours}:</span>}{moment(moment(now).diff(timestamp)).format('mm:ss')}
                </div>
              )}
            </div>
          </div>
          <div style={{__border: '1px solid #ddd', padding: '8px'}}> 
            {this.renderChannelMode()}
          </div>
          {'defunct' !== mode && (
            <div>
              <div style={{__border: '1px solid #f00', display: 'flex', padding: '8px'}}> 
                <button className='btn btn-default btn-large' onClick={this.toggleMuted.bind(this)} style={{marginTop: '6px'}}>
                  <i className={muted ? 'glyphicon glyphicon-volume-off' : 'glyphicon glyphicon-volume-up'} />
                </button>
                <div style={{__border: '1px solid #f00', flex: 6, padding: '18px 10px 0 16px'}}>
                  <Slider 
                    min          = {1}
                    max          = {100}
                    style        = {{width: '100%'}}
                    value        = {level}
                    defaultValue = {level}
                    onChange     = {(from, to) => this.updateLevel(to)}
                    disabled     = {!!muted} />
                </div>
                <div style={{__border: '1px solid #f00', padding: '6px 0 0 6px'}}>
                  {this.renderModeSwitch()}
                  {/*
                  <span style={{marginLeft: '10px'}}>
                    <Switch 
                      labelText = 'Auto-answer'
                      onText    = 'On'
                      offText   = 'Off'
                      size      = 'mini' />
                  </span>
                  */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default Channel
