import React       from 'react'
import PhoneLookup from './PhoneLookup'

import { updateMode } 
  from '../js/actions'
import { ListGroupItem } 
  from 'react-bootstrap'

import entries     from '../tmp/entries'
import randomize   from '../tmp/randomize'

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
  updateMode(mode) {
    const { channelId, dispatch, ws } = this.props
    dispatch(updateMode(channelId, mode))
  }
  renderChannelMode() {
    const { mode, contact } = this.props
    if ('free' === mode) {
      return (
        <div>
          Free: <PhoneLookup entries={entries.map(entry => ({ ...entry, phone : randomize() }))} />
        </div>
      )
    } else if ('ring' === mode) {
      return (
        <div>
          <div style={{float: 'right'}}>
            <button>
              Answer
            </button>
            <button>
              Reject
            </button>
          </div>
          <h2>
            Number: {contact.number}
          </h2>
        </div>
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
      <div>
        {modes.map((mode, i) => {
          return (
            <span key={i}>
              {chan.mode == mode ? mode : (
                <button onClick={() => { this.updateMode(mode) }}>
                  {mode}
                </button>
              )}
            </span>
          )
        })}
      </div>
    )
  }
  render() {
    const { channelId, number, contact, mode, level, muted } = this.props
    return (
      <div style={{background: '#fff', border: '1px solid #ddd'}}>
        <div>
          <div style={{border: '1px solid #ddd'}}> 
            <div style={{display: 'flex'}}>
              <div style={{flex: 11, border: '1px solid #ddd'}}>
                {channelId}
                {number}
              </div>
              <div style={{flex: 1, border: '1px solid #ddd'}}>
                00:00
              </div>
            </div>
          </div>
          <div style={{border: '1px solid #ddd'}}> 
            <div style={{flex: 6, border: '1px solid #ddd'}}>
              <div style={{float: 'left', width: '50px'}}>
                Icon
              </div>
              <div style={{marginLeft: '50px'}}>
                {this.renderChannelMode()}
              </div>
            </div>
          </div>
          <div style={{border: '1px solid #ddd'}}> 
            <div style={{display: 'flex'}}>
              <div style={{flex: 1, border: '1px solid #ddd'}}>
                <input onChange={this.toggleMuted.bind(this)} type='checkbox' checked={!!muted} />Mute
              </div>
              <div style={{flex: 11, border: '1px solid #ddd'}}>
                <input style={{width: '100%'}} type='range' min={0} max={100} onChange={this.updateLevel.bind(this)} disabled={!!muted} value={level} />
              </div>
            </div>
          </div>
          <div style={{border: '1px solid #ddd'}}> 
            {this.renderModeSwitch()}
          </div>
        </div>
      </div>
    )
  }
}

export default Channel
