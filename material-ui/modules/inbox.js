import React   from 'react'
import TimeAgo from 'react-timeago'

import { connect } 
  from 'react-redux'
import { actions } 
  from 'react-redux-form'
import { setDialog, toggleMessageFavorite, clearFavorites }
  from '../js/actions'

import Avatar
  from 'material-ui/Avatar'
import Subheader
  from 'material-ui/Subheader/Subheader'
import List 
  from 'material-ui/List/List'
import ListItem 
  from 'material-ui//List/ListItem'
import Divider 
  from 'material-ui/Divider'
import IconButton 
  from 'material-ui/IconButton'
import MoreVertIcon 
  from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu 
  from 'material-ui/IconMenu'
import MenuItem 
  from 'material-ui/MenuItem'
import Toolbar
  from 'material-ui/Toolbar/Toolbar'
import ToolbarTitle
  from 'material-ui/Toolbar/ToolbarTitle'
import ToolbarGroup
  from 'material-ui/Toolbar/ToolbarGroup'

import { purple500, darkBlack, lightBlack, grey400 } 
  from 'material-ui/styles/colors'

class Inbox extends React.Component {
  handleMenuAction(event, value, message) {
    const { dispatch } = this.props
    switch (value.key) {
      case 'reply':
        dispatch(actions.reset('sms'))
        dispatch(actions.change('sms.recipient', message.endpoint))
        dispatch(actions.change('sms.message', message))
        dispatch(actions.setPristine('sms'))
        dispatch(setDialog('sms'))
        break
      case 'call':
        dispatch(actions.reset('call'))
        dispatch(actions.change('call.number', message.endpoint))
        dispatch(setDialog('call'))
        break
      case 'delete':
        dispatch(setDialog('confirm', { messageId: message.id }))
        break
      default:
    }
  }
  handleToggleFavorite(e, message) {
    const { dispatch } = this.props
    dispatch(toggleMessageFavorite(message.id)) 
  }
  itemProps(message) {
    const iconButtonElement = (
      <IconButton
        touch           = {true}
        tooltip         = 'more'
        tooltipPosition = 'bottom-left'>
        <MoreVertIcon color={grey400} />
      </IconButton>
    )
    return {
      leftAvatar: (
        <Avatar 
          color           = 'white'
          backgroundColor = {purple500}
          icon            = {
            <i className='material-icons'>textsms</i>
        } />
      ),
      primaryText: (
        <span>
          {message.endpoint}&nbsp;&nbsp;<span style={{color: lightBlack}}>{message.channel_id}</span>
        </span>
      ),
      secondaryText: (
        <p style={{paddingRight: '80px'}}>
          {!isNaN(message.timestamp) && (
            <span style={{color: darkBlack}}>
              <TimeAgo date={Number(message.timestamp)} /> &mdash;&nbsp;
            </span> 
          )}
          {message.content}
        </p>
      ),
      rightIconButton: (
        <span>
          <IconButton 
            onClick   = {e => this.handleToggleFavorite(e, message)} 
            iconStyle = {!!message.favorite ? {color: 'rgb(0, 188, 212)'} : {}}>
            <i className='material-icons'>{message.favorite ? 'star' : 'star_border'}</i>
          </IconButton>
          <IconMenu 
            onItemTouchTap    = {(event, value) => this.handleMenuAction(event, value, message)}
            iconButtonElement = {iconButtonElement}>
            <MenuItem key='reply'>Reply</MenuItem>
            <MenuItem key='call'>Call</MenuItem>
            <MenuItem key='delete'>Delete</MenuItem>
          </IconMenu>
        </span>
      ),
    }
  }
  render() {
    const { 
      inbox : { 
        visibleMessages, 
        messageCount, 
        unreadCount, 
        favorites,
      }, 
      dispatch, 
    } = this.props
    if (!messageCount) {
      return (
        <List style={{background: '#ffffff'}}>
          <Subheader>SMS</Subheader>
          <Divider />
          <p style={{padding: '16px'}}>No messages.</p>
        </List>
      )
    }
    return (
      <div style={{display: 'flex', flexDirection: 'row'}}>
        {!!favorites.length && (
          <div style={{flex: 1}}>
            <List style={{background: '#ffffff'}}>
              <Toolbar>
                <ToolbarTitle text='Favorites' />
                <ToolbarGroup float='right'>
                  <IconButton touch={true} onClick={() => dispatch(clearFavorites())}>
                    <i className='material-icons'>clear_all</i>
                  </IconButton>
                </ToolbarGroup>
              </Toolbar>
                {favorites.map((message, i) => (
                  <div key={i}>
                    <ListItem {...this.itemProps(message)} secondaryTextLines={2} />
                    <Divider />
                  </div>
                ))}
            </List>
          </div>
        )}
        <div style={{flex: 1}}>
          <List style={{background: '#ffffff'}}>
            <Toolbar>
              <ToolbarTitle text='Inbox' />
            </Toolbar>
            {visibleMessages.filter(message => !message.favorite).map((message, i) => (
              <div key={i}>
                <ListItem {...this.itemProps(message)} secondaryTextLines={2} />
                <Divider />
              </div>
            ))}
          </List>
        </div>
      </div>
    )
  }
}

export default connect(state => _.pick(state, ['inbox']))(Inbox)
