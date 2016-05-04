import React          from 'react'
import ReactDOM       from 'react-dom'
import ChannelToolbar from './channel-toolbar'
import moment         from 'moment'

import { updateChannelContact, updateChannelVolume }
  from '../js/actions'

import Paper 
  from 'material-ui/Paper'
import Divider
  from 'material-ui/Divider'
import FlatButton 
  from 'material-ui/FlatButton'
import RaisedButton 
  from 'material-ui/RaisedButton'
import Slider 
  from 'material-ui/Slider'
import Toggle
  from 'material-ui/Toggle'
import TextField 
  from 'material-ui/TextField'

import IconCommunicationCall
  from 'material-ui/svg-icons/communication/call'
import IconAvPause
  from 'material-ui/svg-icons/av/pause'
import IconAvStop
  from 'material-ui/svg-icons/av/stop'
import IconSocialPerson
  from 'material-ui/svg-icons/social/person'

import { green400, green500, yellow500, red500, grey500, orange500 }
  from 'material-ui/styles/colors'

class Channel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timer : null,
      now   : Date.now(),
      edit  : false,
    }
  }
  setMode(newMode) {
    const { id, mode, sendMessage } = this.props
    if ('free' != mode) {
      sendMessage('channelMode', { 
        [id]: newMode 
      })
    }
  }
  updateVolume(e, value) {
    const { id, sendMessage } = this.props
    sendMessage('channelVolume', { 
      [id]: value
    })
    dispatch(updateChannelVolume(id, value))
  }
  toggleMuted(e) {
    const { id, muted, sendMessage } = this.props
    sendMessage('channelMuted', {
      [id]: !muted
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
    //const { timestamp, client : { diff } } = this.props
    const { timestamp } = this.props
    const diff = 0 // temp
    if (timestamp) {
      this.setState({
        now : Date.now() - diff
      })
    }
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
  componentDidMount() {
    this.setState({
      timer : window.setInterval(::this.timer, 1000)
    })
  }
  renderChannel() {
    const { mode, muted, level, contact } = this.props
    switch (mode) {
      case 'free':
        return (
          <div style={{textAlign: 'center', padding: '0 0 20px 0'}}>
            <p>
              <i style={{marginTop: '-35px', padding: '14px', background: 'rgba(0, 188, 212, 0.3)', color: '#ffffff', borderRadius: '50%', fontSize: '300%'}} className='material-icons'>phone</i>
            </p>
          </div>
        )
      case 'defunct':
        return (
          <span />
        )
      case 'ring':
        return (
          <div>
            <div style={{marginTop: '-35px', textAlign: 'center', padding: '0 0 20px 0'}}>
              <p>
                <i style={{fontSize: '400%', color: '#4caf50'}} className='material-icons faa-ring animated'>ring_volume</i>
              </p>
              {contact.name && (
                <p style={{fontSize: '20px', color: 'rgba(0, 0, 0, 0.4)'}}>
                  Incoming call from {contact.name}
                </p>
              )}
              <p style={{margin: '15px 0 0'}}>{contact.number}</p>
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
          </div>
        )
      case 'master':
      case 'on_hold':
        return (
          <div>
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
                    {contact.name && (
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
                <p style={{margin: '15px 0 0'}}>{contact.number}</p>
              </div>
              <div style={styles.controls}>
                <div style={styles.toggle}>
                  <Toggle 
                    onToggle       = {::this.toggleMuted}
                    defaultToggled = {!muted} />
                </div>
                <div style={styles.slider}>
                  <Slider 
                    onChange       = {::this.updateVolume}
                    disabled       = {muted}
                    min            = {1}
                    max            = {100}
                    value          = {level}
                    defaultValue   = {level} />
                </div>
              </div>
            </div>
            <div>
              <Divider />
              <div style={{padding: '10px'}}>
                <FlatButton
                  style      = {{color: green500, ...styles.button}}
                  label      = 'Master'
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
                  label      = 'Hang up'
                  icon       = {<IconAvStop />}
                  onClick    = {() => this.setMode('free')}
                />
              </div>
            </div>
          </div>
        ) 
      default:
        return <span />
    }
  }
  render() {
    const { mode, timestamp } = this.props
    const hours = moment(this.state.now).diff(timestamp, 'hours')
    const colors = {
      'defunct' : '#dedede',
      'ring'    : red500,
      'master'  : yellow500,
      'on_hold' : orange500,
    }
    return (
      <div style={styles.component}>
        <Paper 
          style={{
            borderLeft : `12px solid ${colors[mode] || '#00bcd4'}`,
          }}>
          <ChannelToolbar {...this.props} 
            timer = {(('master' === mode || 'on_hold' === mode) && timestamp) ? (
              <span style={{marginLeft: '20px'}}>
                {hours > 0 && <span>{hours}:</span>}
                {moment(moment(this.state.now).diff(timestamp)).format('mm:ss')}
              </span>
            ) : null}
          />
          {this.renderChannel()}
        </Paper>
      </div>
    )
  }
}

const styles = {
  button: {
  },
  component: {
    padding         : '1em 0 0 0',
  },
  paper: {
    width           : '100%',
  },
  controls: {
    display         : 'flex',
    flexDirection   : 'row', 
    alignItems      : 'center',
    height          : '60px',
    marginBottom    : '10px',
    padding         : '10px 0',
  },
  avatar: {
    padding         : '0 0 0 20px',
  },
  toggle: {
    padding         : '0 10px',
  },
  slider: {
    margin          : '22px 20px 0 0',
    width           : '100%',
  },
}

export default Channel

//import React          from 'react'
//import ChannelToolbar from './channel-toolbar'
//
//import Paper 
//  from 'material-ui/lib/paper'
//import Avatar 
//  from 'material-ui/lib/avatar'
//import Slider 
//  from 'material-ui/lib/slider'
//import FlatButton 
//  from 'material-ui/lib/flat-button'
//import Divider
//  from 'material-ui/lib/divider'
//import Toggle
//  from 'material-ui/lib/toggle'
//
//import Card from 'material-ui/lib/card/card';
//import CardActions from 'material-ui/lib/card/card-actions';
//import CardHeader from 'material-ui/lib/card/card-header';
//import CardMedia from 'material-ui/lib/card/card-media';
//import CardTitle from 'material-ui/lib/card/card-title';
//import CardText from 'material-ui/lib/card/card-text';
//
//import { green400 } 
//  from 'material-ui/lib/styles/colors'
//
//class Channel extends React.Component {
//  constructor(props) {
//    super(props)
//    this.state = {
//      expanded: false,
//    }
//  }
//  updateVolume(e, value) {
//    const { id, sendMessage } = this.props
//    sendMessage('channelVolume', { 
//      [id]: value
//    })
//  }
//  toggleMuted(e) {
//    const { id, muted, sendMessage } = this.props
//    sendMessage('channelMuted', {
//      [id]: !muted
//    })
//  }
//  setMode(newMode) {
//    const { id, mode, sendMessage } = this.props
//    if ('free' != mode) {
//      sendMessage('channelMode', { 
//        [id]: newMode 
//      })
//    }
//  }
//  renderControls() {
//    const { 
//      id, 
//      level, 
//      mode, 
//      muted,
//      sendMessage,
//    } = this.props
//    switch (mode) {
//      case 'defunct':
//        return (
//          <span />
//        ) 
//      case 'free':
//      default:
//        return (
//          <div style={styles.controls}>
//            {/*
//            <div style={styles.avatar}>
//              <Avatar icon={<i className='material-icons'>remove</i>} />
//            </div>
//            */}
//            <div style={styles.toggle}>
//              <Toggle 
//                onToggle       = {::this.toggleMuted}
//                defaultToggled = {!muted} />
//            </div>
//            <div style={styles.slider}>
//              <Slider 
//                onChange       = {::this.updateVolume}
//                disabled       = {muted}
//                min            = {1}
//                max            = {100}
//                value          = {level}
//                defaultValue   = {level} />
//            </div>
//          </div>
//        )
//    }
//  }
//  renderActions() {
//    const { mode } = this.props
//    switch (mode) {
//      case 'free':
//      case 'defunct':
//        return (
//          <span />
//        ) 
//      default:
//        return (
//          <div>
//            <Divider />
//            <div style={{padding: '10px'}}>
//              <FlatButton
//                style      = {styles.button}
//                primary    = {true} 
//                label      = 'Master'
//                icon       = {<i className='material-icons'>speaker</i>}
//                onClick    = {() => this.setMode('master')}
//              />
//              <FlatButton
//                style      = {styles.button}
//                primary    = {true} 
//                label      = 'On hold'
//                icon       = {<i className='material-icons'>pause</i>}
//                onClick    = {() => this.setMode('on_hold')}
//              />
//              <FlatButton
//                style      = {styles.button}
//                secondary  = {true}
//                label      = 'Reject'
//                icon       = {<i className='material-icons'>cancel</i>}
//                onClick    = {() => this.setMode('free')}
//              />
//            </div>
//          </div>
//        )
//    }
//  }
//  render() {
//    const { mode } = this.props
//    const colors = {
//      defunct : '#dedede',
//    }
//
//
//
//
//    return <span />
//
//
//
//
//    
//    return (
//      <div style={styles.component}>
//
//<Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange}>
//        <CardHeader
//          title="URL Avatar"
//          subtitle="Subtitle"
//          avatar="http://lorempixel.com/100/100/nature/"
//          actAsExpander={true}
//          showExpandableButton={true}
//        />
//        <CardText>
//          This toggle controls the expanded state of the component.
//          <Toggle toggled={this.state.expanded} onToggle={this.handleToggle} />
//        </CardText>
//        <CardMedia
//          expandable={true}
//          overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
//        >
//          <img src="http://lorempixel.com/600/337/nature/" />
//        </CardMedia>
//        <CardTitle title="Card title" subtitle="Card subtitle" expandable={true} />
//        <CardText expandable={true}>
//          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
//          Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
//          Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
//          Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
//        </CardText>
//        <CardActions>
//          <FlatButton label="Expand" onTouchTap={this.handleExpand} />
//          <FlatButton label="Reduce" onTouchTap={this.handleReduce} />
//        </CardActions>
//      </Card>
//
//
//
//
//        <Paper style={{
//            ...styles.paper,
//            borderLeft : `12px solid ${colors[mode] || green400}`,
//          }}>
//          <ChannelToolbar {...this.props} />
//          {this.renderControls()}
//          {this.renderActions()}
//        </Paper>
//      </div>
//    )
//  }
//}
//
//const styles = {
//  component: {
//    padding         : '1em 1em 0 1em',
//  },
//  paper: {
//    width           : '100%',
//  },
//  controls: {
//    display         : 'flex',
//    flexDirection   : 'row', 
//    alignItems      : 'center',
//    height          : '60px',
//    marginBottom    : '10px',
//    padding         : '10px 0',
//  },
//  avatar: {
//    padding         : '0 0 0 20px',
//  },
//  toggle: {
//    padding         : '0 10px',
//  },
//  slider: {
//    margin          : '22px 20px 0 0',
//    width           : '100%',
//  },
//}
//
//export default Channel
