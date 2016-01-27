export function mute(channel) {
  return {
    type : 'mute', channel
  }
}

export function unmute(channel) {
  return {
    type : 'unmute', channel
  }
}

export function updateLevel(channel, level) {
  return {
    type : 'update-level', channel, level
  }
}

export function initializeMixer(state) {
  return {
    type : 'initialize-mixer', state
  }
}

export function initializeUsers(state) {
  return {
    type : 'initialize-users', state
  }
}

export function updateUser(userId, state) {
  return {
    type : 'update-user', userId, state
  }
}

export function removeUser(userId) {
  return {
    type : 'remove-user', userId
  }
}

export function updateUserLevel(userId, level) {
  return {
    type : 'update-user-level', userId, level
  }
}

export function updateMixer(state) {
  return {
    type : 'update-mixer', state
  }
}

export function updatePreset(channel, preset) {
  return {
    type : 'update-preset', channel, preset
  }
}

export function updateMaster(state) {
  return {
    type : 'update-master', state
  }
}

export function updateMasterLevel(level) {
  return {
    type : 'update-master-level', level
  }
}

export function updateCaller(channel, caller) {
  return {
    type : 'update-caller', channel, caller
  }
}

export function setTimeDiff(diff) {
  return {
    type : 'set-diff', diff
  }
}

export function updateInbox(id, payload) {
  return {
    type : 'update-inbox', id, payload
  }
}

export function removeMessage(id) {
  return {
    type : 'remove-message', id
  }
}

export function disableMixer() {
  return {
    type   : 'update-mixer-active',
    active : false,
  }
}
