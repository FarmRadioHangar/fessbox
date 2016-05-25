import React from 'react'

import Subheader
  from 'material-ui/Subheader/Subheader'
import RadioButton
  from 'material-ui/RadioButton'
import RadioButtonGroup
  from 'material-ui/RadioButton/RadioButtonGroup'

export default class ChannelSelect extends React.Component {
  render() {
    const { onChange, channels } = this.props
    return (
      <div>
        <Subheader style={{padding: 0}}>Channel</Subheader>
        <RadioButtonGroup 
          name            = 'Channel' 
          defaultSelected = 'auto'
          onChange        = {(e, i) => onChange('auto' == i ? i : channels[i])}>
          <RadioButton
            key   = {'auto'}
            value = {'auto'}
            label = {'Auto select'} 
          />
          {channels.map((chan, i) => (
            <RadioButton
              key   = {i}
              value = {''+i}
              label = {chan.id} 
            />
          ))}
        </RadioButtonGroup>
      </div>
    )
  }
}
