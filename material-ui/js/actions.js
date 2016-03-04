import { 
  APP_INITIALIZE, 
  APP_UPDATE_STATUS, 
  CHANNEL_UPDATE,
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

export function updateChannel(id, data) {
  return {
    type : CHANNEL_UPDATE, 
    id,
    data,
  }
}
