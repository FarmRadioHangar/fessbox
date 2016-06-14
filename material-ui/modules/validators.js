export default {
  phoneNumber(value) {
    return /^(\+?[0-9]{1,3}\-?|0)[0123456789]{9}$/.test(value)
  },
  required(value) {
    return !!value
  },
  maxLength(length) {
    return (value) => value.length <= length
  },
  isPartial(number) {
    if (!number)
      return false
    return (number.length < 10 && !isNaN(number.replace(/[\+\-\.\s]/g, '')))
  },
}
