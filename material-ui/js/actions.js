import { 
  APP_UPDATE_STATUS, 
} from './constants'

export function updateAppStatus(status, error) {
  return { 
    type: APP_UPDATE_STATUS, 
    error,
    status,
  }
}


