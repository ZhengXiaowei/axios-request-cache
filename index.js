'use strict'
Object.defineProperty(exports, '__esModule', { value: !0 })
var _slicedToArray = (function() {
    function a(a, b) {
      var c = [],
        d = !0,
        e = !1,
        f = void 0
      try {
        for (
          var g, h = a[Symbol.iterator]();
          !(d = (g = h.next()).done) &&
          (c.push(g.value), !(b && c.length === b));
          d = !0
        );
      } catch (a) {
        ;(e = !0), (f = a)
      } finally {
        try {
          !d && h['return'] && h['return']()
        } finally {
          if (e) throw f
        }
      }
      return c
    }
    return function(b, c) {
      if (Array.isArray(b)) return b
      if (Symbol.iterator in Object(b)) return a(b, c)
      throw new TypeError(
        'Invalid attempt to destructure non-iterable instance'
      )
    }
  })(),
  _createClass = (function() {
    function a(a, b) {
      for (var c, d = 0; d < b.length; d++)
        (c = b[d]),
          (c.enumerable = c.enumerable || !1),
          (c.configurable = !0),
          'value' in c && (c.writable = !0),
          Object.defineProperty(a, c.key, c)
    }
    return function(b, c, d) {
      return c && a(b.prototype, c), d && a(b, d), b
    }
  })()
function _classCallCheck(a, b) {
  if (!(a instanceof b))
    throw new TypeError('Cannot call a class as a function')
}
var CACHES = {},
  Cache = (function() {
    function a(b) {
      if ((_classCallCheck(this, a), (this.axios = b), !this.axios))
        throw new Error('\u7F3A\u5C11axios\u5B9E\u4F8B')
      ;(this.cancelToken = b.CancelToken), (this.options = {})
    }
    return (
      _createClass(a, [
        {
          key: 'use',
          value: function c(a) {
            var b = {
              expire: 6e4,
              storage: !1,
              storage_expire: 36e5,
              instance: this.axios,
              requestConfigFn: null,
              responseConfigFn: null
            }
            ;(this.options = Object.assign(b, a)), this.init()
          }
        },
        {
          key: 'init',
          value: function b() {
            var a = this.options
            a.storage &&
              this._storageExpire('expire').then(function() {
                0 === localStorage.length
                  ? (CACHES = {})
                  : mapStorage(localStorage, 'get')
              }),
              this.request(a.requestConfigFn),
              this.response(a.responseConfigFn)
          }
        },
        {
          key: 'request',
          value: function d(a) {
            var b = this,
              c = this.options
            c.instance.interceptors.request.use(async function(c) {
              var d = a && (await a(c))
              if (((c = d || c), c.cache)) {
                var g = b.cancelToken.source()
                c.cancelToken = g.token
                var e = CACHES[c.url],
                  f = getExpireTime()
                e && f - e.expire < b.options.expire && g.cancel(e)
              }
              return c
            })
          }
        },
        {
          key: 'response',
          value: function c(a) {
            var b = this
            this.options.instance.interceptors.response.use(
              async function(c) {
                var d = a && (await a(c))
                if (
                  ((c = d || c), 'get' === c.config.method && c.config.cache)
                ) {
                  var e = { expire: getExpireTime(), data: c }
                  ;(CACHES['' + c.config.url] = e),
                    b.options.storage && mapStorage(CACHES)
                }
                return c
              },
              function(a) {
                return b.axios.isCancel(a)
                  ? Promise.resolve(a.message.data)
                  : Promise.reject(a)
              }
            )
          }
        },
        {
          key: '_storageExpire',
          value: function c(a) {
            var b = this
            return new Promise(function(c) {
              var d = getStorage(a),
                e = getExpireTime()
              if (d) {
                var f = e - d < b.options.storage_expire
                f || removeStorage()
              } else setStorage(a, e)
              c()
            })
          }
        }
      ]),
      a
    )
  })()
exports.default = Cache
function mapStorage(a) {
  var b = 1 < arguments.length && arguments[1] !== void 0 ? arguments[1] : 'set'
  Object.entries(a).map(function(a) {
    var c = _slicedToArray(a, 2),
      d = c[0],
      e = c[1]
    if ('set' === b) setStorage(d, e)
    else {
      var f = /\{/g
      CACHES[d] = f.test(e) ? JSON.parse(e) : e
    }
  })
}
function removeStorage() {
  localStorage.clear()
}
function setStorage(a, b) {
  localStorage.setItem(a, JSON.stringify(b))
}
function getStorage(a) {
  var b = localStorage.getItem(a)
  return JSON.parse(b)
}
function getExpireTime() {
  return new Date().getTime()
}
