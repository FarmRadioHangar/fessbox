import React            from 'react'
import ReactDOM         from 'react-dom'
import Channel          from './Channel'
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
        mixer : { channels, master }, 
      client, 
      dispatch, 
      sendMessage 
    } = this.props
    return (
      <div style={styles.wrapper}>
        <audio ref='audio' loop='true'>
          <source src='wav/ring.wav' type='audio/wav' />
        </audio>
        <div style={styles.main}> 
          <div>
            {_.pairs(channels).sort(compareChannels).map(pair => {
              const [id, chan] = pair
              return (id != client.userId) ? (
                <Channel {...chan} 
                  key         = {id}
                  channelId   = {id}
                  client      = {client}
                  dispatch    = {dispatch}
                  sendMessage = {sendMessage} />
              ) : (
                <span key={id} />
              )
            })}
          </div>
        </div>
        <div style={styles.master}> 
          {!!master && !!Object.keys(master).length && (
            <Master {...master} 
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
  master : {
    flex       : 2, 
    textAlign  : 'center'
  }
}

export default Mixer
