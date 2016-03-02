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

class ChannelToolbar extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { id } = this.props
    return (
      <Toolbar>
        <ToolbarGroup 
          firstChild = {true}
          float      = 'left'>
          <ToolbarTitle 
            text     = {id}
            style    = {styles.title}
          />
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
            defaultValue  = {level}
            style         = {styles.slider} />
        </div>
      </div>
    )
  }
  renderActions() {
    return (
      <div>
        Actions
      </div>
    )
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
  component: {
    padding       : '1em 1em 0 1em',
  },
  paper: {
    width         : '100%',
  },
  title: {
    padding       : '0 24px',
  },
  controls: {
    display       : 'flex',
    flexDirection : 'row', 
    alignItems    : 'center',
    height        : '60px',
    marginBottom  : '10px',
    padding       : '10px 0',
  },
  avatar: {
    padding       : '0 0 0 20px',
  },
  slider: {
    width         : '100%',
    marginTop     : '22px',
  },
}

export default Channel
