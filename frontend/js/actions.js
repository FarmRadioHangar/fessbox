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

export function updateMasterLevel(level) {
  return {
    type : 'update-master-level', level
  }
}
