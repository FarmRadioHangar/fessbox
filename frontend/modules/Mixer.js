import React            from 'react'
import ReactDOM         from 'react-dom'
import Channel          from './Channel'
import Host             from './Host'
import Inbox            from './Inbox'
import Master           from './Master'
import _                from 'lodash'
import getQueryVariable from '../js/url-params'

function modeWeight(mode) {
  if ('master' === mode) {
    return 1
  } else if ('free' === mode) {
    return 4
  } else if ('on_hold' === mode) {
    return 3
  } else if ('ivr' === mode) {
    return 5
  } else if ('defunct' === mode) {
    return 6
  } else if ('ring' === mode) {
    return 0
  } else { /* host */
    return 2
  }
}

function compareChannels(a, b) {
  return modeWeight(a[1].mode) - modeWeight(b[1].mode)
}

const silent = getQueryVariable('silent') || false

class Mixer extends React.Component {
  constructor(props) {
    super(props)
  }
  componentWillReceiveProps(props) {
    if (!props.mixer || !props.mixer.hasOwnProperty('sound')) {
      return
    }
    const sound = ReactDOM.findDOMNode(this.refs.audio)
    if (true === props.mixer.sound) {
      if (sound.paused) {
        sound.currentTime = 0
        if (!silent) {
          sound.play()
        }
      }
    } else {
      if (!sound.paused) {
        sound.pause()
      }
    }
  }
  masterIsActive() {
    const { mixer : { channels } } = this.props
    for (let key in channels) {
      if ('master' === channels[key].mode) {
        return true
      }
    }
    return false
  }
  render() {
    const { 
      mixer : { channels, master, host }, 
      client, 
      inbox,
      dispatch, 
      sendMessage,
      users : { _userId, _connected },
      t,
    } = this.props
    /* 
     *
     * temp fix 
     *
     */ 
    const notFree = _connected && channels[_userId] && channels[_userId].mode !== 'free'
    return (
      <div style={styles.wrapper}>
        <audio ref='audio' loop='true'>
          <source src='wav/ring.wav' type='audio/wav' />
        </audio>
        <div style={styles.main}> 
          <div>
            {_.pairs(channels).sort(compareChannels).map(pair => {
              const [id, chan] = pair
              /* temp */
              if ('operator' === chan.direction) {
                return null
              }
              /* /temp */
              return (!_userId || id != _userId) ? (
                <Channel {...chan} 
                  t            = {t}
                  key          = {id}
                  channelId    = {id}
                  userChanFree = {!notFree}
                  userId       = {_userId}
                  isConnected  = {_connected}
                  client       = {client}
                  dispatch     = {dispatch}
                  sendMessage  = {sendMessage} />
              ) : (
                <span key={id} />
              )
            })}
          </div>
          <Inbox notifications={inbox.notifications} {...this.props} />
        </div>
        {!!client.isHost && (
          <div style={styles.host}> 
            <Host {...host} 
              t               = {t}
              dispatch        = {dispatch} 
              sendMessage     = {sendMessage} />
          </div>
        )}
        <div style={styles.master}> 
          {!!master && !!Object.keys(master).length && (
            <Master {...master} 
              t               = {t}
              active          = {this.masterIsActive()}
              dispatch        = {dispatch} 
              sendMessage     = {sendMessage} />
          )}
        </div>
      </div>
    )
  }
}

const styles = {
  wrapper : {
    display    : 'flex'
  },
  main : {
    flex       : 11,
    marginLeft : '40px'
  },
  host : {
    flex       : 2, 
    textAlign  : 'center'
  },
  master : {
    flex       : 2, 
    textAlign  : 'center'
  },
}

export default Mixer
