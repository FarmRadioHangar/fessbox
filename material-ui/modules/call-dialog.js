import React    from 'react'
import ReactDOM from 'react-dom'

import Dialog 
  from 'material-ui/lib/dialog'

class CallDialog extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { open, onClose } = this.props
    const actions = []
    return (
      <Dialog
        title          = {'Make a call'}
        actions        = {actions}
        modal          = {false}
        open           = {open}
        onRequestClose = {onClose}>
      </Dialog>
    )
  }
}

export default CallDialog
