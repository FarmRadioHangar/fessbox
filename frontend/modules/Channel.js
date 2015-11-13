import React       from 'react'
import classNames  from 'classnames'
import PhoneLookup from 'frh-react-phone-lookup'
import Switch      from 'react-bootstrap-switch'

import { updateMode } 
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
              <span style={{top: '2px'}} className='glyphicon glyphicon-earphone'></span>
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
  }
  toggleMuted() {
    const { dispatch, muted, channelId, ws } = this.props
    ws.send(JSON.stringify({
      event : 'channelMuted',
      data  : {
        [channelId] : !muted
      }
    }))
  }
  updateLevel(event) {
    const { dispatch, channelId, ws } = this.props
    ws.send(JSON.stringify({
      event : 'channelVolume',
      data  : {
        [channelId] : event.target.value
      }
    }))
  }
  answerCall() {
    const { dispatch, channelId, ws } = this.props
    ws.send(JSON.stringify({
      event : 'channelMode',
      data  : {
        [channelId] : 'master'             // tmp
      }
    }))
  }
  rejectCall() {
    const { dispatch, channelId, ws } = this.props
    ws.send(JSON.stringify({
      event : 'channelMode',
      data  : {
        [channelId] : 'free'
      }
    }))
  }
  updateMode(mode) {
    const { channelId, dispatch, ws } = this.props
    dispatch(updateMode(channelId, mode))
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
        <div>
          <div style={{float: 'right'}}>
            <button onClick={this.answerCall.bind(this)}>
              Answer
            </button>
            <button onClick={this.rejectCall.bind(this)}>
              Reject
            </button>
          </div>
          <h2>
            Number: {contact.number}
          </h2>
        </div>
      )
    } else if ('defunct' === mode) {
      return (
        <span>DEFUNCT</span>
      )
    } else {
      return (
        <div>
          {mode}
        </div>
      )
    }
  }
  renderModeSwitch() {
    const modes = ['host', 'master', 'on_hold', 'ivr']
    const { channelId, client : { channels } } = this.props
    const chan = channels[channelId] || {mode: 'free'}
    return (
      <div className='btn-group btn-group-xs' role='group'>
        {modes.map((mode, i) => {
          return (
            <button 
              key       = {i}
              type      = 'button'
              className = {classNames('btn btn-default', { 'active' : chan.mode == mode })}
              onClick   = {() => { this.updateMode(mode) }}>
              {mode}
            </button>
          )
        })}
      </div>
    )
  }
  render() {
    const { channelId, number, contact, mode, level, muted } = this.props
    return (
      <div style={{background: '#fff', __border: '1px solid #ddd'}}>
        <div>
          <div style={{__border: '1px solid #ddd'}}> 
            <div style={{display: 'flex', padding: '8px'}}>
              <div style={{flex: 11, __border: '1px solid #ddd'}}>
                {channelId}
                {number}
              </div>
              <div style={{flex: 1, __border: '1px solid #ddd'}}>
                00:00
              </div>
            </div>
          </div>
          <div style={{__border: '1px solid #ddd'}}> 
            <div style={{flex: 6, padding: '8px', __border: '1px solid #ddd'}}>
              <div style={{float: 'left', width: '50px'}}>
                Icon
              </div>
              <div style={{marginLeft: '50px'}}>
                {this.renderChannelMode()}
              </div>
            </div>
          </div>
          <div style={{__border: '1px solid #ddd', padding: '8px'}}> 
            <div style={{display: 'flex'}}>
              <div style={{flex: 1, __border: '1px solid #ddd'}}>
                {/*
                <input onChange={this.toggleMuted.bind(this)} type='checkbox' checked={!!muted} />Mute
                */}
              </div>
              <div style={{flex: 11, __border: '1px solid #ddd'}}>
                <input style={{width: '100%'}} type='range' min={0} max={100} onChange={this.updateLevel.bind(this)} disabled={!!muted} value={level} />
              </div>
            </div>
          </div>
          <div style={{__border: '1px solid #ddd', padding: '8px'}}> 
            {this.renderModeSwitch()}
            &nbsp;<Switch 
              labelText = 'Auto-answer'
              onText    = 'On'
              offText   = 'Off'
              size      = 'mini' />
          </div>
        </div>
      </div>
    )
  }
}

export default Channel
