import { 
  APP_INITIALIZE, 
  APP_UPDATE_STATUS, 
  MESSAGE_TOGGLE_READ,
  MESSAGE_TOGGLE_FAVORITE,
  MESSAGE_TOGGLE_SELECTED,
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
    type : MESSAGE_TOGGLE_READ, 
    id,
  }
}

export function toggleMessageSelected(id) {
  return {
    type : MESSAGE_TOGGLE_SELECTED, 
    id,
  }
}


export function toggleMessageFavorite(id) {
  return {
    type : MESSAGE_TOGGLE_FAVORITE, 
    id,
  }
}
