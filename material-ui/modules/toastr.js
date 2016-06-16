import React  from 'react'
import _      from 'lodash'

import { toastrRemoveMessage }
  from '../js/actions'
import { connect } 
  from 'react-redux'

import Snackbar 
  from 'material-ui/Snackbar';

class Toastr extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timer : null
    }
  }
  hideMessage(key) {
    window.setTimeout(() => this.props.dispatch(toastrRemoveMessage(key), 350))
  }
  componentWillUnmount() {
    const { timer } = this.state
    if (timer) {
      window.clearInterval(timer)
    }
  }
  render() {
    const { toastr : { messages } } = this.props
    return (
      <div>
        <Snackbar
          open             = {!!messages.length}
          autoHideDuration = {3000}
          message          = {messages.length ? messages[0].content : ''}
          onRequestClose   = {() => this.hideMessage(messages[0].key)}
        />
      </div>
    )
  }
}

export default connect(state => _.pick(state, ['toastr']))(Toastr)
