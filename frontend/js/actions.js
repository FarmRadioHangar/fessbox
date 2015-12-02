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

export function updateMode(channel, mode) {
  return {
    type : 'update-mode', channel, mode
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
