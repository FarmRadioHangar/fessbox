'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var store = Redux.createStore(function (state, action) {
  return state;
});

var ReduxBehavior = PolymerRedux(store);

var App = function () {
  function App() {
    _classCallCheck(this, App);
  }

  _createClass(App, [{
    key: 'beforeRegister',
    value: function beforeRegister() {
      this.is = 'poly-app';
      this.properties = {};
      this.behaviors = [ReduxBehavior];
    }
  }, {
    key: 'created',
    value: function created() {}
  }, {
    key: 'ready',
    value: function ready() {}
  }, {
    key: 'attached',
    value: function attached() {}
  }, {
    key: 'detached',
    value: function detached() {}
  }, {
    key: 'attributeChanged',
    value: function attributeChanged() {}
  }]);

  return App;
}();

Polymer(App);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnRzL3BvbHktYXBwL3BvbHktYXBwLmpzIl0sIm5hbWVzIjpbInN0b3JlIiwiUmVkdXgiLCJjcmVhdGVTdG9yZSIsInN0YXRlIiwiYWN0aW9uIiwiUmVkdXhCZWhhdmlvciIsIlBvbHltZXJSZWR1eCIsIkFwcCIsImlzIiwicHJvcGVydGllcyIsImJlaGF2aW9ycyIsIlBvbHltZXIiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU1BLFFBQVFDLE1BQU1DLFdBQU4sQ0FBa0IsVUFBQ0MsS0FBRCxFQUFRQyxNQUFSLEVBQW1CO0FBQzdDLFNBQU9ELEtBQVA7QUFDRCxDQUZTLENBQWQ7O0FBSUksSUFBTUUsZ0JBQWdCQyxhQUFhTixLQUFiLENBQXRCOztJQUVNTyxHOzs7Ozs7O3FDQUNhO0FBQ2YsV0FBS0MsRUFBTCxHQUFVLFVBQVY7QUFDQSxXQUFLQyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsV0FBS0MsU0FBTCxHQUFpQixDQUFFTCxhQUFGLENBQWpCO0FBQ0Q7Ozs4QkFDUyxDQUFFOzs7NEJBQ0osQ0FDUDs7OytCQUNVLENBQUU7OzsrQkFDRixDQUFFOzs7dUNBQ00sQ0FBRTs7Ozs7O0FBR3ZCTSxRQUFRSixHQUFSIiwiZmlsZSI6ImVsZW1lbnRzL3BvbHktYXBwL3BvbHktYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3RvcmUgPSBSZWR1eC5jcmVhdGVTdG9yZSgoc3RhdGUsIGFjdGlvbikgPT4ge1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH0pO1xuXG4gICAgY29uc3QgUmVkdXhCZWhhdmlvciA9IFBvbHltZXJSZWR1eChzdG9yZSk7XG5cbiAgICBjbGFzcyBBcHAge1xuICAgICAgYmVmb3JlUmVnaXN0ZXIoKSB7XG4gICAgICAgIHRoaXMuaXMgPSAncG9seS1hcHAnO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgdGhpcy5iZWhhdmlvcnMgPSBbIFJlZHV4QmVoYXZpb3IgXTtcbiAgICAgIH1cbiAgICAgIGNyZWF0ZWQoKSB7fVxuICAgICAgcmVhZHkoKSB7XG4gICAgICB9XG4gICAgICBhdHRhY2hlZCgpIHt9XG4gICAgICBkZXRhY2hlZCgpIHt9XG4gICAgICBhdHRyaWJ1dGVDaGFuZ2VkKCkge31cbiAgICB9XG5cbiAgICBQb2x5bWVyKEFwcCk7Il19
