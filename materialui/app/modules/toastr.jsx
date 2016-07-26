// @flow
import React, { Component } from 'react'
import ReactDOM, { render } from 'react-dom'
import { connect } from 'react-redux'

import Snackbar 
  from 'material-ui/Snackbar';

class Toastr extends Component {
  render() {
    const { toastr, dispatch } = this.props
    return (
      <Snackbar
        open             = {!!toastr.messages.length}
        autoHideDuration = {3000}
        message          = {toastr.messages.length ? toastr.messages[0].content : ''}
        onRequestClose   = {() => {
          dispatch({
            type : 'TOASTR_REMOVE_MESSAGE',
            key  : toastr.messages[0].key,
          })
        }}
      />
    )
  }
}

export default connect(state => _.pick(state, ['toastr']))(Toastr)
