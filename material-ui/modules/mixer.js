import React, { Component } from 'react'
import moment               from 'moment'
import _                    from 'lodash'
import ChannelToolbar       from './channel-toolbar'
import styles               from '../styles/channel'

import { connect } 
  from 'react-redux'

import { setChannelMuted, updateChannelContact, updateChannelVolume }
  from '../js/actions'

import Avatar
  from 'material-ui/Avatar'
import FontIcon 
  from 'material-ui/FontIcon'
import Paper 
  from 'material-ui/Paper'
import IconButton
  from 'material-ui/IconButton'
import IconCommunicationCall
  from 'material-ui/svg-icons/communication/call'
import IconAvPause
  from 'material-ui/svg-icons/av/pause'
import IconAvStop
  from 'material-ui/svg-icons/av/stop'
import IconSocialPerson
  from 'material-ui/svg-icons/social/person'
import FlatButton 
  from 'material-ui/FlatButton'
import RaisedButton 
  from 'material-ui/RaisedButton'
import Divider
  from 'material-ui/Divider'
import TextField 
  from 'material-ui/TextField'
import Toggle
  from 'material-ui/Toggle'
import Slider 
  from 'material-ui/Slider'
import LinearProgress
  from 'material-ui/LinearProgress'
import Dialog 
  from 'material-ui/Dialog'

import Subheader
  from 'material-ui/Subheader/Subheader'

import { 
  green400, 
  green500, 
  grey500, 
  orange500,
  red500, 
  yellow500,  
  amber500,
} from 'material-ui/styles/colors'

class Channel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timer : null,
      now   : Date.now(),
      edit  : false,
    }
  }
  setMode(newMode) {
    const { id, mode, sendMessage, userId } = this.props
    if ('free' != mode) {
      sendMessage('channelMode', { 
        [id]: 'host' === newMode ? ''+userId : newMode 
      })
    }
  }
  toggleMuted(e) {
    const { id, muted, sendMessage, dispatch } = this.props
    sendMessage('channelMuted', {
      [id]: !muted
    })
    dispatch(setChannelMuted(id, !muted))
  }
  updateLevel(e, value) {
    const { id, sendMessage, dispatch } = this.props
    sendMessage('channelVolume', { 
      [id]: value
    })
    dispatch(updateChannelVolume(id, value))
  }
  updateContact() {
    const { id, dispatch, sendMessage } = this.props
    if (this.refs.contact) {
      const caller = {
        'name' : this.refs.contact.getValue(),
      }
      dispatch(updateChannelContact(id, caller))
      sendMessage('channelContactInfo', { 
        [id] : caller 
      })
    }
    this.setState({
      edit : false,
    })
  }
  toggleEdit(e) {
    const { edit } = this.state
    if (!edit && this.refs.contact) {
      this.refs.contact.focus()
    }
    this.setState({
      edit : !edit,
    })
  }
  timer() {
    const { timestamp, diff } = this.props
    if (timestamp) {
      this.setState({
        now : Date.now() - diff
      })
    }
  }
  componentDidMount() {
    this.state = {
      timer : window.setInterval(::this.timer, 1000)
    }
  }
  componentWillUnmount() {
    const { timer } = this.state
    if (timer) {
      window.clearInterval(timer)
    }
  }
  /*
  renderControls() {
    const { id, label, muted, level, contact } = this.props
    return (
      <div>
      {/*
        <div style={{margin: '-20px 20px 0'}}>
          <div style={{textAlign: 'center'}}>
            {!!this.state.edit ? (
              <div>
                <TextField 
                  ref               = 'contact'
                  defaultValue      = {contact.name}
                  floatingLabelText = 'Contact name' 
                />
                <FlatButton
                  style             = {{marginLeft: '10px'}}
                  label             = 'Save'
                  onTouchTap        = {::this.updateContact}
                />
                <FlatButton
                  style             = {{marginLeft: '10px'}}
                  label             = 'Cancel'
                  onTouchTap        = {::this.toggleEdit}
                />
              </div>
            ) : (
              <div>
                {contact && contact.name && (
                  <p style={{fontSize: '20px', color: 'rgba(0, 0, 0, 0.4)'}}>
                    {contact.name}
                  </p>
                )}
                <RaisedButton
                  style      = {{marginTop: '10px'}}
                  primary    = {true}
                  label      = 'Edit contact'
                  icon       = {<IconSocialPerson />}
                  onTouchTap = {::this.toggleEdit}
                />
              </div>
            )}
            {contact && (
              <p style={{margin: '15px 0 0'}}>{contact.number}</p>
            )}
          </div>
          <div style={styles.controls}>
            <div style={styles.toggle}>
              <Toggle 
                onToggle       = {::this.toggleMuted}
                defaultToggled = {!muted} />
            </div>
            <div style={styles.slider}>
              <Slider 
                onChange       = {::this.updateLevel}
                onDragStop     = {() => {}}
                disabled       = {muted}
                min            = {1}
                max            = {100}
                defaultValue   = {level} />
            </div>
          </div>
        </div>
      </div>
    )
  }
      */

  renderControls(mode, userChanFree) {
      console.log(mode)
    switch (mode) {
      case 'master':
       return (
         <span>
           <FlatButton
             primary    = {true}
             label      = 'On hold'
             onClick    = {() => this.setMode('on_hold')}
           />
           {userChanFree && (
             <FlatButton
               primary    = {true}
               label      = 'Private'
               onClick    = {() => this.setMode('host')}
             />
           )}
         </span>
       )
      case 'on_hold':
       return (
         <span>
           <FlatButton
             primary    = {true}
             label      = 'Master'
             onClick    = {() => this.setMode('master')}
           />
           {userChanFree && (
             <FlatButton
               primary    = {true}
               label      = 'Private'
               onClick    = {() => this.setMode('host')}
             />
           )}
         </span>
       )
      case 'xxx':
       return (
         <span>
           <FlatButton
             primary    = {true}
             label      = 'On hold'
             onClick    = {() => this.setMode('on_hold')}
           />
           <FlatButton
             primary    = {true}
             label      = 'Master'
             onClick    = {() => this.setMode('master')}
           />
         </span>
       )
      default:
        return <span />
    }
  }
  render() {
    const { 
      contact, 
      direction, 
      id, 
      label, 
      level, 
      mode, 
      muted, 
      timestamp, 
      userChanFree,
    } = this.props
    const { edit } = this.state
    switch (mode) {
      case 'free':
        return (
          <div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <Avatar backgroundColor='#ffffff' color='rgb(0, 188, 212)' style={{marginTop: '13px'}} icon={
                <i className='material-icons'>phone</i>
              } />
              <Subheader style={{flex: 2, paddingTop: '8px'}}>
                {id}
              </Subheader>
              <Subheader style={{flex: 2, paddingTop: '8px', textAlign: 'right'}}>
                {label}
              </Subheader>
            </div>
          </div>
        )
      case 'ring':
        if ('incoming' === direction) {
          return (
            <div>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Avatar style={{marginTop: '12px'}} backgroundColor='#ffffff' color={red500} icon={
                  <i className='material-icons faa-ring'>call_received</i>
                } />
                <Subheader style={{flex: 2, paddingTop: '8px'}}>
                  {id}
                </Subheader>
                <Subheader style={{flex: 2, paddingTop: '8px', textAlign: 'right'}}>
                  {label}
                </Subheader>
              </div>
              <div style={{margin: '0 160px 48px', borderRadius: '3px', border: '1px solid rgb(224, 224, 224)', padding: '32px'}}>
                <div style={{textAlign: 'center'}}>
                  <Avatar size={50} style={{margin: '12px 0 12px'}} backgroundColor={red500} icon={
                    <i className='material-icons faa-ring animated'>notifications_active</i>
                  } />
                  {contact && (
                    <div>
                      {contact.name ? (
                        <div>
                          <h5 style={{marginTop: 0}}>
                            Incoming call from {contact.name}
                          </h5>
                          <Subheader style={{flex: 2, padding: 0}}>
                            {contact.number}
                          </Subheader>
                        </div>
                      ) : (
                        <div>
                          <h5 style={{marginTop: 0}}>
                            Incoming call from {contact.number}
                          </h5>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{marginTop: '16px', textAlign: 'center'}}>
                    <FlatButton
                      primary    = {true}
                      label      = 'Answer'
                      onClick    = {() => this.setMode('master')}
                    />
                    <FlatButton
                      primary    = {true}
                      label      = 'On hold'
                      onClick    = {() => this.setMode('on_hold')}
                    />
                    <FlatButton
                      primary    = {true}
                      label      = 'Reject'
                      onClick    = {() => this.setMode('free')}
                    />
                  </div>
                </div>
              </div>
            {/*
              <div style={{marginTop: '-35px', textAlign: 'center', padding: '0 0 20px 0'}}>
                <p>
                  <i style={{fontSize: '400%', color: '#4caf50'}} className='material-icons faa-ring animated'>ring_volume</i>
                </p>
                {contact && (
                  <div>
                    <p style={{fontSize: '20px', color: 'rgba(0, 0, 0, 0.4)'}}>
                      {contact.name ? (
                        <span>Incoming call from {contact.name}</span>
                      ) : (
                        <span>Incoming call</span>
                      )}
                    </p>
                    <p style={{margin: '15px 0 0'}}>{contact.number}</p>
                  </div>
                )}
              </div>
              <Divider />
              <div style={{padding: '10px'}}>
                <FlatButton
                  style      = {{color: green500, ...styles.button}}
                  label      = 'Answer'
                  icon       = {<IconCommunicationCall />}
                  onClick    = {() => this.setMode('master')}
                />
                <FlatButton
                  style      = {{color: grey500, ...styles.button}}
                  label      = 'On hold'
                  icon       = {<IconAvPause />}
                  onClick    = {() => this.setMode('on_hold')}
                />
                <FlatButton
                  style      = {{color: red500, ...styles.button}}
                  label      = 'Reject'
                  icon       = {<IconAvStop />}
                  onClick    = {() => this.setMode('free')}
                />
              </div>
            */}
            </div>
          )
        } else {
          return (
            <div>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Avatar style={{marginTop: '13px'}} backgroundColor='#ffffff' color={amber500} icon={
                  <i className='material-icons'>call_made</i>
                } />
                <Subheader style={{flex: 2, paddingTop: '8px'}}>
                  {id}
                </Subheader>
                <Subheader style={{flex: 2, paddingTop: '8px', textAlign: 'right'}}>
                  {label}
                </Subheader>
              </div>
              <div style={{margin: '0 160px 48px', borderRadius: '3px', border: '1px solid rgb(224, 224, 224)', padding: '32px'}}>
                {contact && (
                  <div>
                    {contact.name ? (
                      <div>
                        <h5 style={{marginTop: 0}}>
                          Calling {contact.name}
                        </h5>
                        <Subheader style={{flex: 2, padding: 0}}>
                          {contact.number}
                        </Subheader>
                      </div>
                    ) : (
                      <div>
                        <h5 style={{marginTop: 0}}>
                          Calling {contact.number}
                        </h5>
                      </div>
                    )}
                  </div>
                )}
                <LinearProgress style={{height: '6px'}} />
                <div style={{marginTop: '16px'}}>
                  <FlatButton
                    label      = 'Hold call'
                    primary    = {true} 
                    onClick    = {() => this.setMode('on_hold')}
                  />
                  <FlatButton
                    label      = 'Cancel'
                    primary    = {true} 
                    onClick    = {() => this.setMode('free')}
                  />
                </div>
              </div>
            {/*
              <div style={{marginTop: '-35px', textAlign: 'center', padding: '0 0 20px 0'}}>
                <p>
                  <i style={{fontSize: '400%', color: '#4caf50'}} className='material-icons faa-ring animated'>ring_volume</i>
                </p>
                {contact && (
                  <div>
                    <p style={{fontSize: '20px', color: 'rgba(0, 0, 0, 0.4)'}}>
                      {contact.name ? (
                        <span>Calling {contact.name}</span>
                      ) : (
                        <span>Calling</span>
                      )}
                    </p>
                    <p style={{margin: '15px 0 0'}}>{contact.number}</p>
                  </div>
                )}
              </div>
              <Divider />
              <div style={{padding: '10px'}}>
                <FlatButton
                  style      = {{color: grey500, ...styles.button}}
                  label      = 'Hold call'
                  icon       = {<IconAvPause />}
                  onClick    = {() => this.setMode('on_hold')}
                />
                <FlatButton
                  style      = {{color: red500, ...styles.button}}
                  label      = 'Cancel'
                  icon       = {<IconAvStop />}
                  onClick    = {() => this.setMode('free')}
                />
              </div>
            */}
            </div>
          )
        }
      case 'master':
      case 'on_hold':
        const hours = moment(this.state.now).diff(timestamp, 'hours')
        const timer = (('master' === mode || 'on_hold' === mode) && timestamp) ? (
          <span style={{marginLeft: '20px'}}>
            {hours > 0 && <span>{hours}:</span>}
            {moment(Math.max(0, moment(this.state.now).diff(timestamp))).format('mm:ss')}
          </span>
        ) : null
        const actions = [
          <FlatButton
            style             = {{marginLeft: '10px'}}
            label             = 'Cancel'
            secondary         = {true}
            onTouchTap        = {::this.toggleEdit}
          />,
          <FlatButton
            style             = {{marginLeft: '10px'}}
            label             = 'Save'
            primary           = {true}
            onTouchTap        = {::this.updateContact}
          />,
        ]
        return (
          <div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <Avatar backgroundColor='#ffffff' color='rgb(255, 64, 129)' style={{marginTop: '13px'}} icon={
                <i className='material-icons'>{'master' === mode ? 'phone_in_talk' : 'pause'}</i>
              } />
              <Subheader style={{flex: 2, paddingTop: '8px'}}>
                {id}
              </Subheader>
              <div style={{flex: 4}}>
                <h6 style={{marginTop: '20px'}}>
                  {contact && (
                    <span>{contact.number}</span>
                  )}
                </h6>
              </div>
              <Subheader style={{flex: 3, paddingTop: '8px', textAlign: 'right'}}>
                {contact && contact.name && (
                  <span>
                    {contact.name}
                  </span>
                )}
              </Subheader>
              <div style={{paddingTop: '13px', marginLeft: '24px'}}>
                <FlatButton 
                  primary    = {true} 
                  label      = 'Edit contact' 
                  onClick    = {::this.toggleEdit}
                />
                {this.renderControls(mode, userChanFree)}
                <FlatButton
                  secondary  = {true}
                  label      = 'Hang up'
                  onClick    = {() => this.setMode('free')}
                />
              </div>
              <Subheader style={{color: '#000', flex: 2, paddingTop: '8px', textAlign: 'right'}}>
                {'on_hold' === mode ? (
                  <span style={{color: red500}}>
                    On hold
                  </span>
                ) : (
                  <span>
                    {timer}
                  </span>
                )}
              </Subheader>
            </div>
            {edit && (
              <Dialog
                title          = 'Edit contact name'
                actions        = {actions}
                onRequestClose = {this.toggleEdit}
                open           = {edit}>
                <TextField 
                  fullWidth         = {true}
                  ref               = 'contact'
                  defaultValue      = {contact.name}
                  floatingLabelText = 'Contact name' 
                />
              </Dialog>
            )}
            <div style={{padding: '16px', margin: '0 120px 24px 120px', height: '24px', borderRadius: '3px', border: '1px solid rgb(224, 224, 224)'}}>
              <div style={{display: 'flex', flexDirection: 'row', marginTop: '-20px', marginRight: '12px'}}>
                <div style={{paddingTop: '8px', marginRight: '12px'}}>
                  <IconButton 
                    onClick        = {::this.toggleMuted} 
                    iconClassName  = 'material-icons'>{muted ? 'volume_off' : 'volume_up'}</IconButton>
                </div>
                <div style={{flex: 4}}>
                  <Slider 
                    onChange       = {::this.updateLevel}
                    disabled       = {muted}
                    min            = {1}
                    max            = {100}
                    value          = {level}
                    defaultValue   = {level} />
                </div>
              </div>
            </div>
          {/*
            {this.renderControls()}
            <div style={{padding: '10px'}}>
              <FlatButton
                style      = {{color: grey500, ...styles.button}}
                label      = 'On hold'
                icon       = {<IconAvPause />}
                onClick    = {() => this.setMode('on_hold')}
              />
              <FlatButton
                style      = {{color: red500, ...styles.button}}
                label      = 'Hang up'
                icon       = {<IconAvStop />}
                onClick    = {() => this.setMode('free')}
              />
            </div>
          */}
          </div>
        )
        /*
        return (
          <div>
            hold
          {/*
            {this.renderControls()}
            <div style={{padding: '10px'}}>
              <FlatButton
                style      = {{color: green500, ...styles.button}}
                label      = 'Master'
                icon       = {<IconCommunicationCall />}
                onClick    = {() => this.setMode('master')}
              />
              <FlatButton
                style      = {{color: red500, ...styles.button}}
                label      = 'Hang up'
                icon       = {<IconAvStop />}
                onClick    = {() => this.setMode('free')}
              />
            </div>
          /}
          </div>
        )
        */
      case 'defunct':
      default:
        return (
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <Avatar backgroundColor='#ffffff' color={grey500} style={{marginTop: '13px'}} icon={
              <i className='material-icons'>not_interested</i>
            } />
            <Subheader style={{flex: 2, paddingTop: '8px', color: '#cecece'}}>
              {id}
            </Subheader>
            <Subheader style={{flex: 8, paddingTop: '8px', color: '#cecece', textTransform: 'uppercase'}}>
              Defunct channel
            </Subheader>
            <Subheader style={{flex: 2, paddingTop: '8px', color: '#cecece', textAlign: 'right'}}>
              {label}
            </Subheader>
          </div>
        )
    }
  }
/*
  render() {
    //console.log('chan')

    return (
      <div>
        {::this.renderChannel()}
      <div style={styles.component}>
        <Paper
          style={{
            borderLeft : `12px solid ${colors[mode] || '#00bcd4'}`,
          }}>
          <ChannelToolbar {...this.props} 
            timer = {(('master' === mode || 'on_hold' === mode) && timestamp) ? (
              <span style={{marginLeft: '20px'}}>
                {hours > 0 && <span>{hours}:</span>}
                {moment(Math.max(0, moment(this.state.now).diff(timestamp))).format('mm:ss')}
              </span>
            ) : null}
          />
          {::this.renderChannel()}
        </Paper>
      </div>
      </div>
    )
  }
  */
}

class Mixer extends Component {
  render() {

      //console.log('mixer')
      //console.log(this.props)

    const { 
      app : { diff, userId }, 
      dispatch, 
      mixer : { channelList, userChanFree }, 
      sendMessage,
    } = this.props
    return (
      <div style={{maxWidth: '900px', margin: '0 auto'}}>
        <Paper style={{padding: '24px 48px 24px 24px', marginTop: '32px'}}>
          {channelList.map(channel => 
            <div key={channel.id}>
              <div style={{minHeight: '96px'}}>
                <Channel {...channel} 
                  userChanFree = {userChanFree}
                  userId       = {userId}
                  diff         = {diff}
                  dispatch     = {dispatch}
                  sendMessage  = {sendMessage}
                />
              </div>
              <Divider />
            </div>
          )}
        </Paper>
        {/*
        <div>
          <Paper style={{padding: '24px 48px 24px 24px', marginTop: '32px'}}>
            <div style={{minHeight: '96px'}}>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Avatar backgroundColor='#ffffff' color='rgb(255, 64, 129)' style={{marginTop: '13px'}} icon={
                  <i className='material-icons'>phone_in_talk</i>
                } />
                <Subheader style={{flex: 2, paddingTop: '8px'}}>
                  airtel 1
                </Subheader>
                <div style={{flex: 4}}>
                  <h6 style={{marginTop: '20px'}}>
                    +255757892300
                  </h6>
                </div>
                <Subheader style={{flex: 3, paddingTop: '8px', textAlign: 'right'}}>
                  Donald Trump
                </Subheader>
                <div style={{paddingTop: '13px', marginLeft: '24px'}}>
                  <FlatButton primary={true} label='Edit contact' />
                  <FlatButton primary={true} label='Hang up' />
                  <FlatButton primary={true} label='Hang up' />
                </div>
                <Subheader style={{color: '#000', flex: 2, paddingTop: '8px', textAlign: 'right'}}>
                  01:32
                </Subheader>
              </div>
                <TextField 
                  ref               = 'contact'
                  defaultValue      = {'Name'}
                  floatingLabelText = 'Contact name' 
                />
                <FlatButton
                  style             = {{marginLeft: '10px'}}
                  label             = 'Save'
                  onTouchTap        = {this.updateContact}
                />
                <FlatButton
                  style             = {{marginLeft: '10px'}}
                  label             = 'Cancel'
                  onTouchTap        = {this.toggleEdit}
                />
              <div style={{padding: '16px', margin: '0 120px 24px 120px', height: '24px', borderRadius: '3px', border: '1px solid rgb(224, 224, 224)'}}>
                <div style={{display: 'flex', flexDirection: 'row', marginTop: '-20px', marginRight: '12px'}}>
                  <div style={{paddingTop: '8px', marginRight: '12px'}}>
                    <IconButton iconClassName='material-icons'>volume_up</IconButton>
                  </div>
                  <div style={{flex: 4}}>
                    <Slider style={{margin: 0}} />
                  </div>
                </div>
              </div>
            </div>
            <Divider />
            <div style={{minHeight: '96px'}}>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Avatar backgroundColor='#ffffff' color={grey500} style={{marginTop: '13px'}} icon={
                  <i className='material-icons'>not_interested</i>
                } />
                <Subheader style={{flex: 2, paddingTop: '8px', color: '#cecece'}}>
                  airtel 1
                </Subheader>
                <Subheader style={{flex: 8, paddingTop: '8px', color: '#cecece', textTransform: 'uppercase'}}>
                  Defunct channel
                </Subheader>
                <Subheader style={{flex: 2, paddingTop: '8px', textAlign: 'right'}}>
                  +255757892300
                </Subheader>
              </div>
            </div>
            <Divider />
            <div style={{minHeight: '96px'}}>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Avatar backgroundColor='#ffffff' color='rgb(0, 188, 212)' style={{marginTop: '13px'}} icon={
                  <i className='material-icons'>phone</i>
                } />
                <Subheader style={{flex: 2, paddingTop: '8px'}}>
                  airtel 1
                </Subheader>
                <div style={{flex: 8}}>
                </div>
                <Subheader style={{flex: 2, paddingTop: '8px', textAlign: 'right'}}>
                  +255757892300
                </Subheader>
              </div>
            </div>
            <Divider />
            <div style={{minHeight: '96px'}}>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Avatar style={{marginTop: '13px'}} backgroundColor='#ffffff' color={amber500} icon={
                  <i className='material-icons'>call_received</i>
                } />
                <Subheader style={{flex: 2, paddingTop: '8px'}}>
                  airtel 1
                </Subheader>
                <div style={{flex: 8}}>
                </div>
                <Subheader style={{flex: 2, paddingTop: '8px', textAlign: 'right'}}>
                  +255757892300
                </Subheader>
              </div>
              <div style={{margin: '0 160px 48px', borderRadius: '3px', border: '1px solid rgb(224, 224, 224)', padding: '32px'}}>
                <h5 style={{marginTop: 0}}>
                  Calling 0712 123 123
                </h5>
                <LinearProgress style={{height: '6px'}} />
                <div style={{marginTop: '16px'}}>
                  <FlatButton primary={true} label='Hang up' style={{marginRight: '12px'}} />
                  <FlatButton primary={true} label='Hang up' style={{marginRight: '12px'}} />
                </div>
              </div>
            </div>
            <Divider />
            <div style={{minHeight: '96px'}}>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Avatar style={{marginTop: '12px'}} backgroundColor='#ffffff' color={red500} icon={
                  <i className='material-icons faa-ring'>call_made</i>
                } />
                <Subheader style={{flex: 2, paddingTop: '8px'}}>
                  airtel 1
                </Subheader>
                <Subheader style={{flex: 2, paddingTop: '8px', textAlign: 'right'}}>
                  +255757892300
                </Subheader>
              </div>
              <div style={{margin: '0 160px 48px', borderRadius: '3px', border: '1px solid rgb(224, 224, 224)', padding: '32px'}}>
                <div style={{textAlign: 'center'}}>
                  <Avatar size={50} style={{margin: '12px 0 12px'}} backgroundColor={red500} icon={
                    <i className='material-icons faa-ring animated'>notifications_active</i>
                  } />
                  <h5 style={{marginTop: 0}}>
                    Incoming call from Donald Trump
                  </h5>
                  <Subheader style={{flex: 2, padding: 0}}>
                    +255757892300
                  </Subheader>
                  <div style={{marginTop: '16px', textAlign: 'center'}}>
                    <FlatButton primary={true} label='Hang up' style={{marginRight: '12px'}} />
                    <FlatButton primary={true} label='Hang up' style={{marginRight: '12px'}} />
                  </div>
                </div>
              </div>
            </div>
          </Paper>
        </div>
        */}
      </div>
    )
  }
}

export default connect(state => _.pick(state, ['mixer', 'app']))(Mixer)
