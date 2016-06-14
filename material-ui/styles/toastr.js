export default {
  component: {
    position          : 'absolute', 
    right             : '30px', 
    top               : '30px', 
    zIndex            : 2000,
  },
  toastr: {
    box: {
      width           : '300px',
      backgroundColor : 'rgba(27, 155, 92, 0.6)',
      lineHeight      : '19px',
      marginBottom    : '10px',
    },
    ripple: {
      textAlign       : 'left',
      padding         : '10px 10px 12px',
      color           : 'white',
    },
    message: {
      display         : 'block', 
      float           : 'left', 
      marginLeft      : '30px',
    },
    icon: {
      position        : 'absolute',
    },
  },
}
