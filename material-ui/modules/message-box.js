import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Waypoint from 'react-waypoint'
import TimeAgo  from 'react-timeago'
import loki     from 'lokijs'

import { actions } 
  from 'react-redux-form'
import { 
  messageWindowGrow, 
  messageWindowRequestOlder,
  starMessage,
  unstarMessage,
  setDialog,
} from '../js/actions'

import { connect } 
  from 'react-redux'

import Divider 
  from 'material-ui/Divider'
import List 
  from 'material-ui/List/List'
import ListItem 
  from 'material-ui/List/ListItem'
import FlatButton 
  from 'material-ui/FlatButton'
import Paper
  from 'material-ui/Paper/Paper'
import IconButton 
  from 'material-ui/IconButton'
import IconMenu 
  from 'material-ui/IconMenu'
import MenuItem 
  from 'material-ui/MenuItem'
import { darkBlack, lightBlack, grey400 } 
  from 'material-ui/styles/colors'

class MessageBox extends Component {
  requestOlder(e) {
    const { dispatch } = this.props
    dispatch(messageWindowRequestOlder())
  }
  fetchMoreMessages(e) {
    const { dispatch } = this.props
    dispatch(messageWindowGrow())
  }
  componentDidUpdate(oldProps, oldState) {
    const { scrollPos } = this.props
    if (oldProps.scrollPos !== scrollPos) {
      const { root } = this.refs
      ReactDOM.findDOMNode(root).parentNode.parentNode.scrollTop = scrollPos
    }
    /* Upgrade mdl-lite components */
    if (componentHandler) {
      componentHandler.upgradeAllRegistered()
      componentHandler.upgradeDom()
    }
  }
  render() {
    const { messages, dispatch, active } = this.props
    const wpKey = `${messages.offset}.${messages.visible.length}.${messages.total}`
    const more = messages.total - (messages.visible.length + messages.offset)
    return (
      <div ref='root' style={{height: '100%'}}>
        <div style={{height: '100%', background: 'rgb(222, 246, 249)', margin: '0 120px'}}>
          <div style={{height: 48*messages.offset}} />
          <Waypoint 
            key     = {'up-' + wpKey} 
            onEnter = {::this.requestOlder} 
          />
          <div>
            {messages.visible.length ? (
              <ul style={active ? {background: '#ffffff'} : {minHeight: '7000px'}} className='mdl-list'>
                {messages.visible.map((message, i) => 
                  <li key={i} className='mdl-list__item mdl-list__item--three-line' style={{borderTop: '1px solid #eee'}}>
                    <span className='mdl-list__item-primary-content'>
                      <span style={{float: 'left', width: '40px', height: '40px'}}>
                        {'sms_in' === message.type ? (
                          <i className='material-icons'>call_made</i>
                        ) : (
                          <i className='material-icons'>call_received</i>
                        )}
                      </span>
                      <span>
                        {message.endpoint}&nbsp;&nbsp;
                        {'null' !== message.channel_id && message.channel_id}
                      </span>
                      <span className='mdl-list__item-text-body'>
                        {!isNaN(message.timestamp) && (
                          <span style={{color: darkBlack}}>
                            <TimeAgo date={Number(message.timestamp)} /> &mdash;&nbsp;
                          </span> 
                        )}
                        {message.content}
                      </span>
                    </span>
                    {'sms_in' === message.type && (
                      <span className='mdl-list__item-secondary-content'>
                        {true === message.favorite ? (
                          <a style={{marginTop: '3px'}} className='mdl-list__item-secondary-action' href='#' onClick={e => {
                            e.preventDefault();
                            dispatch(unstarMessage(message['$loki'])) 
                          }}><i className='material-icons'>star</i></a>
                        ) : (
                          <a style={{marginTop: '3px'}} className='mdl-list__item-secondary-action' href='#' onClick={e => {
                            e.preventDefault();
                            dispatch(starMessage(message['$loki'])) 
                          }}><i className='material-icons'>star_border</i></a>
                        )}
                      </span>
                    )}
                    <span className='mdl-list__item-secondary-content'>
                      <button id={`message-menu-${i}`} className="mdl-button mdl-js-button mdl-button--icon">
                        <i className="material-icons">more_vert</i>
                      </button>
                      <ul className="mdl-menu mdl-js-menu mdl-js-ripple-effect" htmlFor={`message-menu-${i}`}>
                        <li onClick={() => {
                          dispatch(setDialog('confirm', {message}))
                        }} className="mdl-menu__item">Delete</li>
                        <li onClick={() => {
                          dispatch(actions.reset('sms'))
                          dispatch(actions.change('sms.recipient', message.endpoint))
                          dispatch(actions.change('sms.message', message))
                          dispatch(actions.setPristine('sms'))
                          dispatch(setDialog('sms'))
                        }} disabled={'sms_out' === message.type} className="mdl-menu__item">Reply</li>
                        <li onClick={() => {
                          dispatch(actions.reset('call'))
                          dispatch(actions.change('call.number', message.endpoint))
                          dispatch(setDialog('call'))
                        }} disabled={'sms_out' === message.type} className="mdl-menu__item">Call number</li>
                      </ul>
                    </span>
                  </li>
                )}
              </ul>
            ) : (
              <div style={active ? {padding: '20px', background: '#ffffff'} : {minHeight: '7000px'}}>
                No messages
              </div>
            )}
            {more > 0 && (
              <div style={{borderTop: '3px solid rgb(0, 188, 212)'}}>
                <div style={{fontSize: '13pt', marginTop: '12px', marginBottom: '100px', textAlign: 'center'}}>
                  <p style={{marginBottom: 0}}>
                    <i className='material-icons'>expand_more</i>
                  </p>
                  {more === messages.unread ? (
                    <span style={{color: 'rgb(0, 188, 212)'}}>
                      {more} new incoming message{1 == more ? '' : 's'}
                    </span>
                  ) : (
                    <span style={{color: 'rgb(0, 188, 212)'}}>
                      {more} more message{1 == more ? '' : 's'} ({messages.unread} new incoming)
                    </span>
                  )}
                </div>
                <Waypoint 
                  key     = {'down-' + wpKey} 
                  onEnter = {::this.fetchMoreMessages} 
                />
              </div>
            )}
          </div>

          {/*
          <List style={{margin: 0}}>
            {messages.visible.map((message, i) => {
              const menuItems = 'sms_in' === message.type ? [
                {
                  'key'  : 'delete',
                  'name' : 'Delete',
                },
              ] : [
                {
                  'key'  : 'reply',
                  'name' : 'Reply',
                },
                {
                  'key'  : 'call',
                  'name' : 'Call',
                },
                {
                  'key'  : 'delete',
                  'name' : 'Delete',
                },
              ]
              return (
                <div key={i}>
                  <ListItem 
                    secondaryTextLines = {2} 
                    primaryText        = {(
                      <span>
                        {message.endpoint}&nbsp;&nbsp;
                        {'null' !== message.channel_id && (
                          <span style={{color: lightBlack}}>{message.channel_id}</span>
                        )}
                      </span>
                    )}
                    secondaryText      = {(
                      <p style={{paddingRight: '80px'}}>
                        {!isNaN(message.timestamp) && (
                          <span style={{color: darkBlack}}>
                            <TimeAgo date={Number(message.timestamp)} /> &mdash;&nbsp;
                          </span> 
                        )}
                        {message.content}
                      </p>
                    )}
                    leftAvatar         = {'sms_in' === message.type ? (
                      <i className='material-icons'>call_received</i>
                    ) : (
                      <i className='material-icons'>call_made</i>
                    )}
                    rightIconButton    = {(
                      <span>
                        <IconMenu 
                          iconButtonElement    = {iconButtonElement}
                          useLayerForClickAway = {true}>
                          {menuItems.map(item => 
                            <MenuItem key={item.key}>{item.name}</MenuItem>
                          )}
                        </IconMenu>
                      </span>
                    )}
                  />
                  <Divider />
                </div>
              )
            })}
          </List>
          */}
          {/*
          {messages.total > messages.visible.length && (
            <Waypoint 
              key     = {'down-' + wpKey} 
              onEnter = {::this.fetchMoreMessages} 
            />
          )}
          */}
        </div>
      </div>
    )
  }
}

export default connect(state => _.pick(state, ['messages']))(MessageBox)

//        <div>
//          {JSON.stringify(messages, null, 2)}
//        </div>

//import React   from 'react'
//import TimeAgo from 'react-timeago'
//
//import { connect } 
//  from 'react-redux'
//import { actions } 
//  from 'react-redux-form'
//import { setDialog, toggleMessageFavorite, clearFavorites }
//  from '../js/actions'
//
//import Avatar
//  from 'material-ui/Avatar'
//import Subheader
//  from 'material-ui/Subheader/Subheader'
//import List 
//  from 'material-ui/List/List'
//import ListItem 
//  from 'material-ui//List/ListItem'
//import Divider 
//  from 'material-ui/Divider'
//import IconButton 
//  from 'material-ui/IconButton'
//import MoreVertIcon 
//  from 'material-ui/svg-icons/navigation/more-vert'
//import IconMenu 
//  from 'material-ui/IconMenu'
//import MenuItem 
//  from 'material-ui/MenuItem'
//import Toolbar
//  from 'material-ui/Toolbar/Toolbar'
//import ToolbarTitle
//  from 'material-ui/Toolbar/ToolbarTitle'
//import ToolbarGroup
//  from 'material-ui/Toolbar/ToolbarGroup'
//
//import { purple500, darkBlack, lightBlack, grey400 } 
//  from 'material-ui/styles/colors'
//
//class Inbox extends React.Component {
//  handleMenuAction(event, value, message) {
//    const { dispatch } = this.props
//    switch (value.key) {
//      case 'reply':
//        console.log('reply')
//        dispatch(actions.reset('sms'))
//        dispatch(actions.change('sms.recipient', message.endpoint))
//        dispatch(actions.change('sms.message', message))
//        dispatch(actions.setPristine('sms'))
//        dispatch(setDialog('sms'))
//        break
//      case 'call':
//        dispatch(actions.reset('call'))
//        dispatch(actions.change('call.number', message.endpoint))
//        dispatch(setDialog('call'))
//        break
//      case 'delete':
//        dispatch(setDialog('confirm', { messageId: message.id }))
//        break
//      default:
//    }
//  }
//  handleToggleFavorite(e, message) {
//    const { dispatch } = this.props
//    dispatch(toggleMessageFavorite(message.id)) 
//  }
//  itemProps(message) {
//    const iconButtonElement = (
//      <IconButton
//        touch           = {true}
//        tooltip         = 'more'
//        tooltipPosition = 'bottom-left'>
//        <MoreVertIcon color={grey400} />
//      </IconButton>
//    )
//    const menuItems = 'sms_in' === message.type ? [
//      {
//        'key'  : 'delete',
//        'name' : 'Delete',
//      },
//    ] : [
//      {
//        'key'  : 'reply',
//        'name' : 'Reply',
//      },
//      {
//        'key'  : 'call',
//        'name' : 'Call',
//      },
//      {
//        'key'  : 'delete',
//        'name' : 'Delete',
//      },
//    ]
//    return {
//      leftAvatar: (
//        <span>
//          {'sms_in' === message.type ? (
//            <i className='material-icons'>call_received</i>
//          ) : (
//            <i className='material-icons'>call_made</i>
//          )}
//        </span>
//      ),
//      primaryText: (
//        <span>
//          {message.endpoint}&nbsp;&nbsp;
//          {'null' !== message.channel_id && (
//            <span style={{color: lightBlack}}>{message.channel_id}</span>
//          )}
//        </span>
//      ),
//      secondaryText: (
//        <p style={{paddingRight: '80px'}}>
//          {!isNaN(message.timestamp) && (
//            <span style={{color: darkBlack}}>
//              <TimeAgo date={Number(message.timestamp)} /> &mdash;&nbsp;
//            </span> 
//          )}
//          {message.content}
//        </p>
//      ),
//      rightIconButton: (
//        <span>
//          <IconButton 
//            onClick   = {e => this.handleToggleFavorite(e, message)} 
//            iconStyle = {!!message.favorite ? {color: 'rgb(0, 188, 212)'} : {}}>
//            <i className='material-icons'>{message.favorite ? 'star' : 'star_border'}</i>
//          </IconButton>
//          <IconMenu 
//            onItemTouchTap    = {(event, value) => this.handleMenuAction(event, value, message)}
//            iconButtonElement = {iconButtonElement}>
//            {menuItems.map(item => <MenuItem key={item.key}>{item.name}</MenuItem>)}
//          </IconMenu>
//        </span>
//      ),
//    }
//  }
//  render() {
//    const { 
//      messages : { 
//        visibleMessages, 
//        total, 
//        unreadCount, 
//        favorites,
//      }, 
//      dispatch, 
//    } = this.props
//
//    console.log(visibleMessages)
//    console.log(favorites)
//
//    if (!total) {
//      return (
//        <List style={{background: '#ffffff'}}>
//          <Subheader>Messages</Subheader>
//          <Divider />
//          <p style={{padding: '16px'}}>No messages.</p>
//        </List>
//      )
//    }
//    return (
//      <div style={{display: 'flex', flexDirection: 'row'}}>
//        {!!favorites.length && (
//          <div style={{flex: 1}}>
//            <List style={{background: '#ffffff'}}>
//              <Toolbar>
//                <ToolbarTitle text='Favorites' />
//                <ToolbarGroup float='right'>
//                  <IconButton touch={true} onClick={() => dispatch(clearFavorites())}>
//                    <i className='material-icons'>clear_all</i>
//                  </IconButton>
//                </ToolbarGroup>
//              </Toolbar>
//                {favorites.map((message, i) => (
//                  <div key={i}>
//                    <ListItem {...this.itemProps(message)} secondaryTextLines={2} />
//                    <Divider />
//                  </div>
//                ))}
//            </List>
//          </div>
//        )}
//        <div style={{flex: 1}}>
//          <List style={{background: '#ffffff'}}>
//            <Toolbar>
//              <ToolbarTitle text='Messages' />
//            </Toolbar>
//            {visibleMessages.filter(message => !message.favorite).map((message, i) => (
//              <div key={i}>
//                <ListItem {...this.itemProps(message)} secondaryTextLines={2} />
//                <Divider />
//              </div>
//            ))}
//          </List>
//        </div>
//      </div>
//    )
//  }
//}
//
//export default connect(state => _.pick(state, ['messages']))(Inbox)
