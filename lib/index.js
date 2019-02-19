"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var symbioteSymbols = require('symbiote-symbol');

var nanoid = require('nanoid');

module.exports = {
  createSymbiote: createSymbiote
  /**
   * @param {{}} initialState
   * @param {{}} actionsConfig
   * @param {defaultOptions | string} namespaceOptions
   * @returns {{ actions: {}, reducer: Function }}
   */

};

function createSymbiote(initialState, actionsConfig) {
  var namespaceOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : nanoid();
  var builder = new SymbioteBuilder({
    state: initialState,
    options: createOptions(namespaceOptions)
  });
  return builder.createSymbioteFor(actionsConfig);
}
/**
 * @param {defaultOptions | string} options
 * @return {defaultOptions}
 */


function createOptions(options) {
  if (typeof options === 'string') {
    return Object.assign({}, defaultOptions, {
      namespace: options
    });
  }

  return Object.assign({}, defaultOptions, options);
}

var defaultOptions = {
  /** @type {string} */
  namespace: undefined,

  /** @type {Function} */
  defaultReducer: undefined,

  /** @type {string} */
  separator: '/'
};

var SymbioteBuilder =
/*#__PURE__*/
function () {
  function SymbioteBuilder(_ref) {
    var state = _ref.state,
        options = _ref.options;

    _classCallCheck(this, SymbioteBuilder);

    this.initialReducerState = state;
    this.options = options;
    this.actions = {};
    this.reducers = {};
    this.namespacePath = options.namespace ? [options.namespace] : [];
  }

  _createClass(SymbioteBuilder, [{
    key: "createSymbioteFor",
    value: function createSymbioteFor(actions) {
      var actionCreators = this.createActionsForScopeOfHandlers(actions, this.namespacePath);
      return {
        actions: actionCreators,
        reducer: this.createReducer(),
        types: extractTypesForActionCreators({}, actionCreators)
      };
    }
  }, {
    key: "createActionsForScopeOfHandlers",
    value: function createActionsForScopeOfHandlers(reducersMap, parentPath) {
      var _this = this;

      var actionsMap = {};
      Object.keys(reducersMap).forEach(function (key) {
        var currentPath = createPathFor(parentPath, key);
        var currentHandlerOrScope = reducersMap[key];

        var currentType = _this.createTypeFromPath(currentPath);

        if (isHandler(currentHandlerOrScope)) {
          var currentHandler = currentHandlerOrScope;
          actionsMap[key] = makeActionCreatorFor(currentType, currentHandler);

          _this.saveHandlerAsReducerFor(currentType, currentHandler);
        } else if (isScope(currentHandlerOrScope)) {
          actionsMap[key] = _this.createActionsForScopeOfHandlers(currentHandlerOrScope, currentPath);
        } else {
          throw new TypeError('createSymbiote supports only function handlers and object scopes in actions config');
        }
      });
      return actionsMap;
    }
  }, {
    key: "createTypeFromPath",
    value: function createTypeFromPath(path) {
      return path.join(this.options.separator);
    }
  }, {
    key: "saveHandlerAsReducerFor",
    value: function saveHandlerAsReducerFor(type, handler) {
      this.reducers[type] = handler;
    }
  }, {
    key: "createReducer",
    value: function createReducer() {
      var _this2 = this;

      return function () {
        var previousState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this2.initialReducerState;
        var action = arguments.length > 1 ? arguments[1] : undefined;
        if (!action) throw new TypeError('Action should be passed');

        var reducer = _this2.findReducerFor(action.type);

        if (reducer) {
          return reducer(previousState, action);
        }

        return previousState;
      };
    }
  }, {
    key: "findReducerFor",
    value: function findReducerFor(type) {
      var expectedReducer = this.reducers[type];

      if (expectedReducer) {
        return function (state, _ref2) {
          var _ref2$symbiotePayloa = _ref2['symbiote-payload'],
              payload = _ref2$symbiotePayloa === void 0 ? [] : _ref2$symbiotePayloa;
          return expectedReducer.apply(void 0, [state].concat(_toConsumableArray(payload)));
        };
      }

      return this.options.defaultReducer;
    }
  }]);

  return SymbioteBuilder;
}();

function createPathFor(path) {
  for (var _len = arguments.length, chunks = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    chunks[_key - 1] = arguments[_key];
  }

  return path.concat.apply(path, chunks);
}

function isHandler(handler) {
  return typeof handler === 'function';
}

function isScope(scope) {
  return !Array.isArray(scope) && scope !== null && _typeof(scope) === 'object';
}

var createDefaultActionCreator = function createDefaultActionCreator(type) {
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return {
      type: type,
      payload: args[0],
      'symbiote-payload': args
    };
  };
};

function makeActionCreatorFor(type, handler) {
  var createActionCreator = handler[symbioteSymbols.getActionCreator] || createDefaultActionCreator;
  var actionCreator = createActionCreator(type);

  actionCreator.toString = function () {
    return type;
  };

  return actionCreator;
}

function extractTypesForActionCreators(types, actionCreators) {
  Object.keys(actionCreators).forEach(function (x) {
    if (_typeof(actionCreators[x]) === 'object') {
      if (typeof types[x] === 'undefined') {
        types[x] = {};
      }

      extractTypesForActionCreators(types[x], actionCreators[x]);
    } else {
      types[x] = actionCreators[x].toString();
    }
  });
  return types;
}