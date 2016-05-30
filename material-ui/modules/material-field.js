import { createFieldClass } from 'react-redux-form'

const MaterialField = createFieldClass({
  'Slider': props => ({
    onChange: (e, val) => props.onChange(val),
    value: props.modelValue,
  }),
  'Checkbox': props => ({
    onCheck: (e, val) => props.onChange(val),
    checked: !!props.modelValue,
  }),
  'TextField': props => ({
    onChange: (e, val) => props.onChange(val),
    onFocus: () => props.onFocus(props.modelValue),
    onBlur: () => props.onBlur(props.modelValue),
    value: props.modelValue,
  }),
  'SelectField': props => ({
  }),
  'ChannelSelect': props => ({
    onChange: props.onChange,
  }),
})

export default MaterialField
