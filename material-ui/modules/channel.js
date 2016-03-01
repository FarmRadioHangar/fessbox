import React from 'react'

import Paper 
  from 'material-ui/lib/paper'

class ChannelToolbar extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <span />
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
    return (
      <span>
        Controls
      </span>
    )
  }
  renderActions() {
    return (
      <span>
        Actions
      </span>
    )
  }
  render() {
    return (
      <div style={styles.component}>
        <Paper style={styles.paper}>
          <ChannelToolbar {...this.props} />
          {this.renderControls()}
          {this.renderActions()}
          Hello
        </Paper>
      </div>
    )
  }
}

const styles = {
  component: {
    padding : '1em 1em 0 1em',
  },
  paper: {
    width   : '100%',
  },
}

export default Channel
