import { 
  APP_INITIALIZE, 
  APP_UPDATE_STATUS, 
  MESSAGE_MARK_READ,
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

export function markMessageRead(id) {
  return {
    type : MESSAGE_MARK_READ, 
    id,
  }
}
