import React from 'react'

import Paper 
  from 'material-ui/lib/paper'

class Channel extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div style={styles.component}>
        <Paper style={styles.paper}>
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
