import { 
  APP_INITIALIZE, 
  APP_SET_DIALOG, 
  APP_SET_DIFF, 
  APP_UPDATE_STATUS, 
  CHANNEL_CONTACT_UPDATE,
  CHANNEL_SET_MUTED,
  CHANNEL_UPDATE,
  CHANNEL_VOLUME_UPDATE,
  MESSAGE_ADD,
  MESSAGE_BULK_ADD,
  MESSAGE_MARK_ALL_READ,
  MESSAGE_REMOVE,
  MESSAGE_STAR,
  MESSAGE_TOGGLE_PROPERTY,
  MESSAGE_UNSTAR,
  MESSAGE_WINDOW_GROW,
  MESSAGE_WINDOW_REQUEST_OLDER,
  SET_ONLY_FAVORITES_FILTER,
  TOASTR_ADD_MESSAGE,
  TOASTR_REFRESH,
  TOASTR_REMOVE_MESSAGE,
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

export function setDiff(diff) {
  return {
    type : APP_SET_DIFF,
    diff,
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

/*
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
*/

export function addMessage(id, message) {
  return {
    type : MESSAGE_ADD, 
    id,
    message,
  }
}

export function addBulkMessages(messages) {
  return {
    type : MESSAGE_BULK_ADD,
    messages
  }
}

export function messageWindowGrow() {
  return {
    type : MESSAGE_WINDOW_GROW
  }
}

export function messageWindowRequestOlder() {
  return {
    type : MESSAGE_WINDOW_REQUEST_OLDER
  }
}

export function removeMessage(id) {
  return {
    type : MESSAGE_REMOVE, 
    id,
  }
}

export function starMessage(id) {
  return {
    type : MESSAGE_STAR, 
    id,
  }
}

export function unstarMessage(id) {
  return {
    type : MESSAGE_UNSTAR, 
    id,
  }
}

export function setFilterOnlyFavorites(filter) {
  return {
    type : SET_ONLY_FAVORITES_FILTER, 
    filter,
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

export function setChannelMuted(id, muted) {
  return {
    type : CHANNEL_SET_MUTED, 
    id,
    muted,
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

export function toastrAddMessage(message) {
  return {
    type : TOASTR_ADD_MESSAGE,
    message,
  }
}

export function toastrRemoveMessage(key) {
  return {
    type : TOASTR_REMOVE_MESSAGE,
    key,
  }
}

export function toastrRefresh() {
  return {
    type : TOASTR_REFRESH,
  }
}
