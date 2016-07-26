// @flow
import store from './store'

let messages = []

const queueMessage = (id, message) => {
  messages.push({id, message})
}

setInterval(() => {
  if (messages.length) {
    const { id, message } = messages.shift()
    store.dispatch({
      type : 'MESSAGES_ADD_ONE',
      message,
      id,
    })
  }
}, 20)

const showDesktopNotification = (msg) => {
  if (!('Notification' in window)) {
    return
  } else if (Notification.permission === 'granted') {
    new Notification(msg)
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission((permission) => {
      if (permission === 'granted') {
        new Notification(msg)
      }
    })
  }
}

export default function(type: string, data: Object): void {
  switch (type) {
    case 'echo':
      if ('noop' !== data.event) {
        console.log(`>>> echo >>>\n${JSON.stringify(data)}\n<<<<<<<<<<<<`)
      }
      break
    case 'initialize':
      store.dispatch({
        type : 'APP_INITIALIZE',
        data,
      })
      store.dispatch({
        type : 'APP_SET_DIFF',
        diff : Date.now()-data.server_time,
      })
      break
    case 'channelUpdate':
      Object.keys(data).forEach(id => {
        const chan = data[id]
        if (chan) {
          store.dispatch({
            type : 'CHANNEL_UPDATE', id,
            data : chan,
          })
          if ('ring' == chan.mode && 'incoming' == chan.direction && chan.contact) {
            showDesktopNotification(`Incoming call from ${chan.contact.number}.`)
          }
        } 
      })
      break
    case 'userUpdate':
      /*
      Object.keys(data).forEach(id => {
        const user = data[user]
        if (user) {
          store.dispatch({
            type : 'UPDATE_USER', id,
            info : user,
          }) 
        } else {
          store.dispatch({
            type : 'REMOVE_USER', id,
          }) 
        }
      })
      */
      console.log('userUpdate: Not implemented.')
      break
    case 'inboxUpdate':
      Object.keys(data).forEach(id => {
        const message = data[id]
        if (message) {
          queueMessage(id, message)
        } else {
          store.dispatch({
            type : 'MESSAGES_DELETE_ONE', id,
          })
        }
      })
      break
    case 'channelContactInfo':
      Object.keys(data).forEach(id => {
        store.dispatch({
          type : 'CHANNEL_CONTACT_UPDATE', id,
          info : data[id],
        })
      })
      break
    case 'channelVolumeChange':
      Object.keys(data).forEach(id => {
        store.dispatch({
          type  : 'CHANNEL_VOLUME_UPDATE', id,
          level : data[id],
        })
      })
      break
    case 'messageSent':
      store.dispatch({
        type    : 'TOASTR_ADD_MESSAGE',
        message : 'SMS message sent.',
      }) 
      break
    case 'event_error':
    case 'input_error':
      console.log(`Error: ${type}`)
      console.error(data.msg)
      break
    default:
      console.log(data)
      console.error(`Unknown event type: ${type}.`)
      break
  }
}
