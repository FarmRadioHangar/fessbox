import { 
  APP_INITIALIZE, 
  APP_SET_DIALOG, 
  APP_UPDATE_STATUS, 
  CHANNEL_UPDATE,
  CHANNEL_VOLUME_UPDATE,
  CHANNEL_CONTACT_UPDATE,
  MESSAGE_FAVORITES_CLEAR,
  MESSAGE_MARK_ALL_READ,
  MESSAGE_ADD,
  MESSAGE_REMOVE,
  MESSAGE_TOGGLE_PROPERTY,
} from './constants'

export function updateAppStatus(status, error) {
  return { 
    type: APP_UPDATE_STATUS, 
    error,
    status,
  }
}

export function initializeApp(data) { 
  return {
    type : APP_INITIALIZE, 
    data,
  }
}

export function toggleMessageRead(id) {
  return {
    type     : MESSAGE_TOGGLE_PROPERTY, 
    property : 'read',
    id,
  }
}

export function markAllMessagesRead() {
  return {
    type     : MESSAGE_MARK_ALL_READ, 
  }
}

export function toggleMessageSelected(id) {
  return {
    type     : MESSAGE_TOGGLE_PROPERTY, 
    property : 'selected',
    id,
  }
}


export function toggleMessageFavorite(id) {
  return {
    type     : MESSAGE_TOGGLE_PROPERTY, 
    property : 'favorite',
    id,
  }
}

export function clearFavorites() {
  return {
    type     : MESSAGE_FAVORITES_CLEAR, 
  }
}

export function addMessage(id, message) {
  return {
    type : MESSAGE_ADD, 
    id,
    message,
  }
}

export function removeMessage(id) {
  return {
    type : MESSAGE_REMOVE, 
    id,
  }
}

export function updateChannel(id, data) {
  return {
    type : CHANNEL_UPDATE, 
    id,
    data,
  }
}

export function updateChannelVolume(id, level) {
  return {
    type : CHANNEL_VOLUME_UPDATE, 
    id,
    level,
  }
}

export function setDialog(dialog, state) {
  return {
    type : APP_SET_DIALOG,
    dialog,
    state,
  }
}

export function updateChannelContact(id, info) {
  return {
    type : CHANNEL_CONTACT_UPDATE,
    id,
    info,
  }
}

