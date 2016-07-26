export default function(variable) {
  let query = window.location.search.substring(1);
  let vars = query.split('&');
  let i=0
  for (;i<vars.length;i++) {
    let pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  } 
  return null;
}
