(function(document) {
  'use strict';

  const app = document.querySelector('#app');

  app.addEventListener('dom-change', () => {
    console.log('Our app is ready to rock!');
  });

})(document);
