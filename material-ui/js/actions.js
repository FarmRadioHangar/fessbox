import { 
  APP_INITIALIZE, 
  APP_UPDATE_STATUS, 
  TOASTR_ADD_MESSAGE,
  TOASTR_REMOVE_MESSAGE,
  TOASTR_REFRESH,
} from './constants'

export function updateAppStatus(status, error) {
  return { 
    type: APP_UPDATE_STATUS, 
    error,
    status,
  }
}

export function showNotification(message) {
  return {
    type: TOASTR_ADD_MESSAGE,
    message,
  }
}

export function hideNotification(key) {
  return {
    type: TOASTR_REMOVE_MESSAGE,
    key,
  }
}

export function refreshToastr() {
  return {
    type: TOASTR_REFRESH,
  }
}

export function initializeApp(data) { 
  return {
    type : APP_INITIALIZE, 
    data,
  }
}
