import React    from 'react'
import Channel  from './Channel'
import Master   from './Master'
import _        from 'lodash'

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

class Mixer extends React.Component {
  constructor(props) {
    super(props)
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
        <div style={styles.topWrapper}> 
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
        <div style={styles.bottomWrapper}> 
          {!!master && !!Object.keys(master).length && (
            <Master {...master} 
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
    display   : 'flex'
  },
  topWrapper : {
    flex      : 11
  },
  bottomWrapper : {
    flex      : 1, 
    textAlign : 'center'
  }
}

export default Mixer
