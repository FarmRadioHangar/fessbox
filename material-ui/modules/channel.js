import React from 'react'

import Paper 
  from 'material-ui/lib/paper'
import Toolbar 
  from 'material-ui/lib/toolbar/toolbar'
import ToolbarGroup 
  from 'material-ui/lib/toolbar/toolbar-group'
import ToolbarTitle 
  from 'material-ui/lib/toolbar/toolbar-title'
import Avatar 
  from 'material-ui/lib/avatar'
import Slider 
  from 'material-ui/lib/slider'
import FlatButton 
  from 'material-ui/lib/flat-button'
import Divider
  from 'material-ui/lib/divider'

class ChannelToolbar extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { id, label } = this.props
    return (
      <Toolbar>
        <ToolbarGroup 
          firstChild = {true}
          float      = 'left'>
          <ToolbarTitle 
            text     = {id}
            style    = {styles.toolbar.title}
          />
        </ToolbarGroup>
        <ToolbarGroup float='right'>
          <div style={styles.toolbar.label}>{label && (
            <div style={styles.toolbar.inner}>
              <i style={styles.toolbar.icon} className='material-icons'>sim_card</i>
              {label}
            </div>
          )}</div>
        </ToolbarGroup>
      </Toolbar>
    )
  }
}

class Channel extends React.Component {
  constructor(props) {
    super(props)
    this.renderControls = this.renderControls.bind(this)
    this.renderActions = this.renderActions.bind(this)
  }
  setMode(newMode) {
    const { id, mode, sendMessage } = this.props
    if ('free' != mode) {
      sendMessage('channelMode', { 
        [id]: newMode 
      })
    }
  }
  renderControls() {
    const { id, level, muted } = this.props
    return (
      <div style={styles.controls}>
        <div style={styles.avatar}>
          <Avatar icon={<i className='material-icons'>remove</i>} />
        </div>
        <div style={styles.slider}>
          <Slider 
            onChange      = {() => {}}
            disabled      = {muted}
            min           = {1}
            max           = {100}
            defaultValue  = {level} />
        </div>
      </div>
    )
  }
  renderActions() {
    const { mode } = this.props
    switch (mode) {
      case 'free':
      case 'defunct':
        return (
          <span />
        ) 
      default:
        return (
          <div>
            <Divider />
            <div style={{padding: '10px'}}>
              <FlatButton
                style      = {styles.button}
                secondary  = {true} 
                label      = 'Master'
                icon       = {<i className='material-icons'>speaker</i>}
                onClick    = {() => this.setMode('master')}
              />
              <FlatButton
                style      = {styles.button}
                secondary  = {true} 
                label      = 'On hold'
                icon       = {<i className='material-icons'>pause</i>}
                onClick    = {() => this.setMode('on_hold')}
              />
              <FlatButton
                style      = {styles.button}
                label      = 'Reject'
                icon       = {<i className='material-icons'>cancel</i>}
                onClick    = {() => this.setMode('free')}
              />
            </div>
          </div>
        )
    }
  }
  render() {
    return (
      <div style={styles.component}>
        <Paper style={styles.paper}>
          <ChannelToolbar {...this.props} />
          {this.renderControls()}
          {this.renderActions()}
        </Paper>
      </div>
    )
  }
}

const styles = {
  toolbar: {
    title: {
      padding         : '0 24px',
    },
    label: {
      lineHeight    : '56px',
      fontSize      : '14px',
      display       : 'inline-block',
      position      : 'relative',
      float         : 'left',
    },
    inner: {
      display       : 'flex', 
      flexDirection : 'row', 
      alignItems    : 'center',
      color         : 'rgba(0, 0, 0, 0.4)',
    },
    mode: {
      paddingLeft   : '16px',
      lineHeight    : '56px',
      fontSize      : '14px',
      display       : 'inline-block',
      position      : 'relative',
      float         : 'left',
    },
    icon: {
      marginRight   : '10px', 
    },
  },
  component: {
    padding         : '1em 1em 0 1em',
  },
  paper: {
    width           : '100%',
  },
  controls: {
    display         : 'flex',
    flexDirection   : 'row', 
    alignItems      : 'center',
    height          : '60px',
    marginBottom    : '10px',
    padding         : '10px 0',
  },
  avatar: {
    padding         : '0 0 0 20px',
  },
  slider: {
    margin          : '22px 20px 0 20px',
    width           : '100%',
  },
}

export default Channel
