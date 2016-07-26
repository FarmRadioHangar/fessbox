// @flow
import React, { Component } from 'react'
import ReactDOM, { render } from 'react-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'

import Paper 
  from 'material-ui/Paper'
import Divider
  from 'material-ui/Divider'
import FloatingActionButton 
  from 'material-ui/FloatingActionButton'
import Avatar
  from 'material-ui/Avatar'
import Subheader
  from 'material-ui/Subheader/Subheader'
import LinearProgress
  from 'material-ui/LinearProgress'
import FlatButton 
  from 'material-ui/FlatButton'
import IconButton
  from 'material-ui/IconButton'
import Slider 
  from 'material-ui/Slider'
import Dialog 
  from 'material-ui/Dialog'
import TextField 
  from 'material-ui/TextField'

import { 
  amber500,
  green400, 
  green500, 
  grey500, 
  orange500,
  red500, 
  yellow500,  
} from 'material-ui/styles/colors'

import { Badge, Icon } from 'react-mdl'

import CallDialog from './calldialog.jsx'

const channelStyles = {
  container : {
    display: 'flex', 
    flexDirection: 'row',
  },
  id : {
    flex: 2, 
    paddingTop: '8px', 
  },
  info : {
    flex: 8, 
    paddingTop: '8px', 
    textTransform: 'uppercase',
  },
  label : {
    flex: 2, 
    paddingTop: '8px', 
    textAlign: 'right',
  },
  callBox: {
    margin: '0 160px 48px', 
    border: '1px solid rgb(224, 224, 224)', 
    padding: '32px',
  },
  volumeControls: {
    padding: '16px', 
    margin: '0 120px 24px 120px', 
    height: '24px', 
    borderRadius: '3px', 
    border: '1px solid rgb(224, 224, 224)',
  },
}

const ChannelAvatar = (props) => (
  <Avatar 
    backgroundColor = '#ffffff'
    color           = {props.color}
    style           = {{marginTop: '13px'}}
    icon            = {
    <i className='material-icons'>{props.icon}</i>
  } />
)

const PrivateChannel = (props) => (
  <div style={channelStyles.container}>
    <ChannelAvatar
      color = {red500}
      icon  = 'phone_locked'
    />
    <Subheader style={channelStyles.id}>
      {props.id}
    </Subheader>
    <Subheader style={{...channelStyles.info, color: red500}}>
      Channel in use (private mode)
    </Subheader>
    <Subheader style={channelStyles.label}>
      {props.label}
    </Subheader>
  </div>
)

const DefunctChannel = (props) => (
  <div style={channelStyles.container}>
    <ChannelAvatar
      color = {grey500}
      icon  = 'not_interested'
    />
    <Subheader style={{color: '#cecece', ...channelStyles.id}}>
      {props.id}
    </Subheader>
    <Subheader style={{...channelStyles.info, color: '#cecece'}}>
      Defunct channel
    </Subheader>
    <Subheader style={{...channelStyles.label, color: '#cecece'}}>
      {props.label}
    </Subheader>
  </div>
)

const FreeChannel = (props) => (
  <div style={channelStyles.container}>
    <ChannelAvatar
      color = 'rgb(0, 188, 212)'
      icon  = 'phone'
    />
    <Subheader style={channelStyles.id}>
      {props.id}
    </Subheader>
    <Subheader style={channelStyles.label}>
      {props.label}
    </Subheader>
  </div>
)

const Contact = (props) => {
  if (!props.contact) {
    return <span />
  }
  return (
    <div>
      {props.contact.name ? (
        <div>
          <h5 style={{marginTop: 0}}>
            {props.title} {props.contact.name}
          </h5>
          <Subheader style={{flex: 2, padding: 0}}>
            {props.contact.number} 
          </Subheader>
        </div>
      ) : (
        <div>
          <h5 style={{marginTop: 0}}>
            {props.title} {props.contact.name}
          </h5>
        </div>
      )}
    </div>
  )
}

const IncomingCall = (props) => (
  <div>
    <div style={channelStyles.container}>
      <ChannelAvatar
        color = {red500}
        icon  = 'call_received'
      />
      <Subheader style={channelStyles.id}>
        {props.id}
      </Subheader>
      <Subheader style={channelStyles.label}>
        {props.label}
      </Subheader>
    </div>
    <div style={channelStyles.callBox}>
      <div style={{textAlign: 'center'}}>
        <Avatar 
          size            = {50}
          style           = {{margin: '12px 0 12px'}}
          backgroundColor = {red500}
          icon            = {
          <i className='material-icons faa-ring animated'>notifications_active</i>
        } />
        <Contact {...props} title='Incoming call from ' />
        <div style={{marginTop: '16px', textAlign: 'center'}}>
          <FlatButton
            primary    = {true}
            label      = 'Answer'
            onClick    = {() => props.setMode(props.id, 'master')}
          />
          {props.userChanFree && (
            <FlatButton
              primary    = {true}
              label      = 'Private'
              onClick    = {() => props.setMode(props.id, 'host')}
            />
          )}
          <FlatButton
            primary    = {true}
            label      = 'On hold'
            onClick    = {() => props.setMode(props.id, 'on_hold')}
          />
          <FlatButton
            primary    = {true}
            label      = 'Reject'
            onClick    = {() => props.setMode(props.id, 'free')}
          />
        </div>
      </div>
    </div>
  </div>
)

const OutgoingCall = (props) => (
  <div>
    <div style={channelStyles.container}>
      <ChannelAvatar
        color = {amber500}
        icon  = 'call_made'
      />
      <Subheader style={channelStyles.id}>
        {props.id}
      </Subheader>
      <Subheader style={channelStyles.label}>
        {props.label}
      </Subheader>
    </div>
    <div style={channelStyles.callBox}>
      <Contact {...props} title='Calling ' />
      <LinearProgress style={{height: '6px'}} />
      <div style={{marginTop: '16px'}}>
        <FlatButton
          label      = 'Hold call'
          primary    = {true} 
          onClick    = {() => props.setMode(props.id, 'on_hold')}
        />
        <FlatButton
          label      = 'Cancel'
          primary    = {true} 
          onClick    = {() => props.setMode(props.id, 'free')}
        />
      </div>
    </div>
  </div>
)

const Controls = (props) => {
  switch (props.mode) {
    case 'master':
     return (
       <span>
         <FlatButton
           primary    = {true}
           label      = 'On hold'
           onClick    = {() => props.setMode(props.id, 'on_hold')}
         />
         {props.userChanFree && (
           <FlatButton
             primary    = {true}
             label      = 'Private'
             onClick    = {() => props.setMode(props.id, 'host')}
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
           onClick    = {() => props.setMode(props.id, 'master')}
         />
         {props.userChanFree && (
           <FlatButton
             primary    = {true}
             label      = 'Private'
             onClick    = {() => props.setMode(props.id, 'host')}
           />
         )}
       </span>
     )
    case userId:
     return (
       <span>
         <FlatButton
           primary    = {true}
           label      = 'On hold'
           onClick    = {() => props.setMode(props.id, 'on_hold')}
         />
         <FlatButton
           primary    = {true}
           label      = 'Master'
           onClick    = {() => props.setMode(props.id, 'master')}
         />
       </span>
     )
    default:
      return <span />
  }
}

class ActiveCall extends Component {

  state: {
    level : number,
    now   : number,
    timer : Object,
  }

  constructor(props: Object) {
    super(props)
    this.state = {
      level : props.level,
      timer : null,
      now   : Date.now(),
    }
    this.timer = this.timer.bind(this)
  }

  timer() {
    const { timestamp, diff } = this.props
    if (timestamp) {
      this.setState({
        now : Date.now() - diff
      })
    }
  }

  componentDidMount(): void {
    this.state = {
      timer : window.setInterval(this.timer, 1000)
    }
  }

  componentWillUnmount(): void {
    const { timer } = this.state
    if (timer) {
      window.clearInterval(timer)
    }
  }

  render() {

    const { 
      contact, 
      id, 
      mode, 
      muted, 
      sendMessage,
      setMode,
      timestamp,
      toggleEdit,
    } = this.props

    const { level } = this.state

    const hours = moment(this.state.now).diff(timestamp, 'hours')

    const timer = timestamp ? (
      <span style={{marginLeft: '20px'}}>
        {hours > 0 && <span>{hours}:</span>}
        {moment(Math.max(0, moment(this.state.now).diff(timestamp))).format('mm:ss')}
      </span>
    ) : null

    return (
      <div>
        <div style={channelStyles.container}>
          <ChannelAvatar
            color = 'rgb(255, 64, 129)'
            icon  = {'master' === mode ? 'phone_in_talk' : 'pause'}
          />
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
              onClick    = {toggleEdit}
            />
            <Controls {...this.props} />
            <FlatButton
              secondary  = {true}
              label      = 'Hang up'
              onClick    = {() => setMode(id, 'free')}
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
        <div style={channelStyles.volumeControls}>
          <div style={{display: 'flex', flexDirection: 'row', marginTop: '-20px', marginRight: '12px'}}>
            <div style={{paddingTop: '8px', marginRight: '12px'}}>
              <IconButton 
                onClick        = {(e) => {
                  sendMessage('channelMuted', { [id]: !muted })
                }} 
                iconClassName  = 'material-icons'>
                {muted ? 'volume_off' : 'volume_up'}
              </IconButton>
            </div>
            <div style={{flex: 4}}>
              <Slider 
                onChange       = {(e, value) => {
                  this.setState({
                    value,
                  })
                  sendMessage('channelVolume', { [id]: value })
                }}
                disabled       = {muted}
                min            = {1}
                max            = {100}
                value          = {level}
                defaultValue   = {level} 
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

}

class Channel extends Component {

  state: {
    edit : bool,
    name : string,
  }

  constructor(props: Object) {
    super(props)
    this.state = {
      edit: false,
      name: props.contact ? props.contact.name : '', 
    }
    this.renderChannel = this.renderChannel.bind(this)
    this.toggleEdit = this.toggleEdit.bind(this)
  }

  toggleEdit(): void {
    const { edit } = this.state
    this.setState({ 
      edit: !edit 
    }) 
  }

  renderChannel() {
    const { mode, direction, userId } = this.props
    switch (mode) {
      case 'free':
        return <FreeChannel {...this.props} />
      case 'ring':
        if ('incoming' === direction) {
          return <IncomingCall {...this.props} />
        } else {
          return <OutgoingCall {...this.props} />
        }
      case 'master':
      case 'on_hold':
      case userId:
        return (
          <ActiveCall {...this.props} 
            toggleEdit = {this.toggleEdit}
          />
        )
      case 'defunct':
        return <DefunctChannel {...this.props} />
      default:
        return <PrivateChannel {...this.props} />
    }
  }

  componentWillReceiveProps(props): void {
    if (props.level != this.props.level) {
      this.setState({
        level: props.level
      })
    }
  }

  render() {

    const { edit, name } = this.state

    const { 
      contact, 
      dispatch,
      id, 
      sendMessage,
    } = this.props

    const actions = [
      <FlatButton
        style             = {{marginLeft: '10px'}}
        label             = 'Cancel'
        secondary         = {true}
        onTouchTap        = {this.toggleEdit}
      />,
      <FlatButton
        style             = {{marginLeft: '10px'}}
        label             = 'Save'
        disabled          = {!name}
        primary           = {true}
        onTouchTap        = {() => {
          dispatch({
            type : 'CHANNEL_CONTACT_UPDATE', 
            info : { name },
            id, 
          })
          sendMessage('channelContactInfo', { 
            [id] : { name },
          })
          this.toggleEdit()
        }}
      />,
    ]

    return (
      <div>
        <Dialog
          title          = 'Edit contact name'
          actions        = {actions}
          onRequestClose = {this.toggleEdit}
          open           = {edit}>
          <TextField 
            fullWidth         = {true}
            defaultValue      = {contact ? contact.name : ''}
            floatingLabelText = 'Contact name' 
            onChange          = {(e) => {
              this.setState({
                name: e.target.value,
              })
            }}
          />
        </Dialog>
        {this.renderChannel()}
      </div>
    )

  }

}

class Mixer extends Component {

  props: {
    dispatch    : Function,
    sendMessage : Function,
  }

  state: {
    showCallDialog : bool,
  }

  constructor(props: Object) {
    super(props)
    this.state = {
      showCallDialog : false,
    }
    this.handleMakeCall = this.handleMakeCall.bind(this)
    this.setMode = this.setMode.bind(this)
  }

  handleMakeCall(form: Object): void {
    const { sendMessage } = this.props
    sendMessage('callNumber', form)
    console.log(form)
    this.setState({
      showCallDialog: false,
    })
  }

  setMode(id, newMode) {
    const { mode, sendMessage, userId } = this.props
    if ('free' != mode) {
      sendMessage('channelMode', { 
        [id]: 'host' === newMode ? ''+userId : newMode 
      })
    }
  }

  render() {

    const { 
      app, 
      mixer, 
      dispatch, 
      sendMessage,
      tab,
    } = this.props

    const { showCallDialog } = this.state

    const styles = {
      container: {
        maxWidth: '900px', 
        margin: '0 auto',
      },
      paper: {
        padding: '24px 48px 24px 24px', 
        marginTop: '32px',
        marginBottom: '80px',
      },
      channelContainer: {
        minHeight: '96px',
      },
      dialFAB: {
        position: 'fixed', 
        bottom: '30px', 
        right: '40px',
      },
    }

    return (

      <div>

        <CallDialog 
          channels     = {mixer.channelList.filter(chan => 'free' == chan.mode)}
          open         = {showCallDialog}
          userChanFree = {mixer.userChanFree}
          phoneNumber  = {null}
          onConfirm    = {this.handleMakeCall} 
          onClose      = {() => {
            this.setState({
              showCallDialog : false,
            })
          }}
        />

        {('mixer' === tab) && (
          <span>
            <FloatingActionButton 
              style   = {styles.dialFAB}
              onClick = {() => {
                this.setState({
                  showCallDialog : true,
                })
              }}>
              <Icon name='dialpad' />
            </FloatingActionButton>
          </span>
        )}

        <div style={styles.container}>
          <Paper style={styles.paper}>
            {mixer.channelList.map(channel => 
              <div style={styles.channelContainer} key={channel.id}>
                <div style={{minHeight: '96px'}}>
                  <Channel {...channel} 
                    userChanFree = {mixer.userChanFree}
                    userId       = {app.userId}
                    diff         = {app.diff}
                    dispatch     = {dispatch}
                    sendMessage  = {sendMessage}
                    setMode      = {this.setMode}
                  />
                </div>
                <Divider />
              </div>
            )}
          </Paper>
        </div>

      </div>
    )
  }

}

export default connect(state => _.pick(state, ['mixer', 'app']))(Mixer)
