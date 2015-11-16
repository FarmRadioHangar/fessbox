import React    from 'react'
import ReactDOM from 'react-dom'
import Slider   from 'bootstrap-slider'

function getOptions(props) {
  return {
    min                : props.min,
    max                : props.max,
    step               : props.step,
    precision          : props.precision,
    orientation        : props.orientation,
    range              : props.range,
    selection          : props.selection,
    tooltip            : props.tooltip,
    tooltip_position   : props.tooltipPosition,
    handle             : props.handle,
    reversed           : props.reversed,
    enabled            : props.enabled,
    formatter          : props.formatter,
    natural_arrow_keys : props.naturalArrowKeys,
    ticks              : props.ticks,
    ticks_positions    : props.ticksPositions,
    ticks_labels       : props.labels,
    ticks_snap_bounds  : props.ticksSnapBounds,
    scale              : props.scale,
    focus              : props.focus
  }
}

class BootstrapSlider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      slider  : null,
      options : null
    }
  }
  mountSlider(options) {
    const node = ReactDOM.findDOMNode(this.refs.slider)
    if (node) {
      let slider = new Slider(node, options)
      slider.on('change', e => { this.props.onChange(e.oldValue, e.newValue) })
      this.setState({ slider, options })
    }
  }
  componentDidMount() {
    let options = getOptions(this.props)
    options.value = Number(this.props.defaultValue) || 0
    this.mountSlider(options)
  }
  componentWillUnmount() {
    let slider = this.state.slider
    if (slider) {
      slider.destroy()
    }
  }
  componentWillReceiveProps(props) {
    let slider = this.state.slider
    if (!slider) {
      return
    }
    if (props.value) {
      slider.setValue(Number(props.value))
    }
    const attrs = [
      'min', 'max', 'step', 'precision', 'orientation', 'range', 
      'selection', 'tooltip', 'tooltip_position', 'handle', 'reversed', 
      'enabled', 'formatter', 'natural_arrow_keys', 'ticks', 'ticks_positions', 
      'ticks_labels', 'ticks_snap_bounds', 'scale', 'focus'
    ]
    for (let prop in props) {
      if (attrs.indexOf(prop) > -1 && this.state.options[prop] != props[prop]) {
        let options = Object.assign({}, this.state.options, getOptions(props))
        options.value = slider.getValue()
        slider.destroy()
        this.mountSlider(options)
        break
      }
    }
  }
  render() {
    return (
      <input ref='slider' {...this.props} />
    )
  }
}

BootstrapSlider.defaultProps = {
  onChange : () => {}
}

export default BootstrapSlider
