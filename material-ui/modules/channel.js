import React          from 'react'
import ChannelToolbar from './channel-toolbar'

import Paper 
  from 'material-ui/lib/paper'
import Avatar 
  from 'material-ui/lib/avatar'
import Slider 
  from 'material-ui/lib/slider'
import FlatButton 
  from 'material-ui/lib/flat-button'
import Divider
  from 'material-ui/lib/divider'
import Toggle
  from 'material-ui/lib/toggle'

import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
import CardTitle from 'material-ui/lib/card/card-title';
import CardText from 'material-ui/lib/card/card-text';

import { green400 } 
  from 'material-ui/lib/styles/colors'

class Channel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded: false,
    }
  }
  updateVolume(e, value) {
    const { id, sendMessage } = this.props
    sendMessage('channelVolume', { 
      [id]: value
    })
  }
  toggleMuted(e) {
    const { id, muted, sendMessage } = this.props
    sendMessage('channelMuted', {
      [id]: !muted
    })
  }
  setMode(newMode) {
    const { id, mode, sendMessage } = this.props
    if ('free' != mode) {
      sendMessage('channelMode', { 
        [id]: newMode 
      })
    }
  }
  renderControls() {
    const { 
      id, 
      level, 
      mode, 
      muted,
      sendMessage,
    } = this.props
    switch (mode) {
      case 'defunct':
        return (
          <span />
        ) 
      case 'free':
      default:
        return (
          <div style={styles.controls}>
            {/*
            <div style={styles.avatar}>
              <Avatar icon={<i className='material-icons'>remove</i>} />
            </div>
            */}
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
        )
    }
  }
  renderActions() {
    const { mode } = this.props
    switch (mode) {
      case 'free':
      case 'defunct':
        return (
          <span />
        ) 
      default:
        return (
          <div>
            <Divider />
            <div style={{padding: '10px'}}>
              <FlatButton
                style      = {styles.button}
                primary    = {true} 
                label      = 'Master'
                icon       = {<i className='material-icons'>speaker</i>}
                onClick    = {() => this.setMode('master')}
              />
              <FlatButton
                style      = {styles.button}
                primary    = {true} 
                label      = 'On hold'
                icon       = {<i className='material-icons'>pause</i>}
                onClick    = {() => this.setMode('on_hold')}
              />
              <FlatButton
                style      = {styles.button}
                secondary  = {true}
                label      = 'Reject'
                icon       = {<i className='material-icons'>cancel</i>}
                onClick    = {() => this.setMode('free')}
              />
            </div>
          </div>
        )
    }
  }
  render() {
    const { mode } = this.props
    const colors = {
      defunct : '#dedede',
    }




    return <span />




    
    return (
      <div style={styles.component}>

<Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange}>
        <CardHeader
          title="URL Avatar"
          subtitle="Subtitle"
          avatar="http://lorempixel.com/100/100/nature/"
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardText>
          This toggle controls the expanded state of the component.
          <Toggle toggled={this.state.expanded} onToggle={this.handleToggle} />
        </CardText>
        <CardMedia
          expandable={true}
          overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
        >
          <img src="http://lorempixel.com/600/337/nature/" />
        </CardMedia>
        <CardTitle title="Card title" subtitle="Card subtitle" expandable={true} />
        <CardText expandable={true}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
          Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
          Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
        </CardText>
        <CardActions>
          <FlatButton label="Expand" onTouchTap={this.handleExpand} />
          <FlatButton label="Reduce" onTouchTap={this.handleReduce} />
        </CardActions>
      </Card>




        <Paper style={{
            ...styles.paper,
            borderLeft : `12px solid ${colors[mode] || green400}`,
          }}>
          <ChannelToolbar {...this.props} />
          {this.renderControls()}
          {this.renderActions()}
        </Paper>
      </div>
    )
  }
}

const styles = {
  component: {
    padding         : '1em 1em 0 1em',
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
