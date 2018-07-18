"use strict";
var _slicedToArray = (function() {
    function a(b, c) {
      var d = [],
        e = !0,
        f = !1,
        g = void 0;
      try {
        for (
          var j, h = b[Symbol.iterator]();
          !(e = (j = h.next()).done) &&
          (d.push(j.value), !(c && d.length === c));
          e = !0
        );
      } catch (k) {
        (f = !0), (g = k);
      } finally {
        try {
          !e && h["return"] && h["return"]();
        } finally {
          if (f) throw g;
        }
      }
      return d;
    }
    return function(b, c) {
      if (Array.isArray(b)) return b;
      if (Symbol.iterator in Object(b)) return a(b, c);
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance"
      );
    };
  })(),
  _createClass = (function() {
    function a(b, c) {
      for (var e, d = 0; d < c.length; d++)
        (e = c[d]),
          (e.enumerable = e.enumerable || !1),
          (e.configurable = !0),
          "value" in e && (e.writable = !0),
          Object.defineProperty(b, e.key, e);
    }
    return function(b, c, d) {
      return c && a(b.prototype, c), d && a(b, d), b;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: !0 });
function _classCallCheck(a, b) {
  if (!(a instanceof b))
    throw new TypeError("Cannot call a class as a function");
}
var CACHES = {},
  Cache = (function() {
    function a(b) {
      if ((_classCallCheck(this, a), (this.axios = b), !this.axios))
        throw new Error("\u7F3A\u5C11axios\u5B9E\u4F8B");
      (this.cancelToken = b.CancelToken), (this.options = {});
    }
    return (
      _createClass(a, [
        {
          key: "use",
          value: function use(b) {
            var c = {
              expire: 6e4,
              storage: !1,
              storage_expire: 3.6e6,
              instance: this.axios,
              requestConfigFn: null,
              responseConfigFn: null
            };
            (this.options = Object.assign(c, b)), this.init();
          }
        },
        {
          key: "init",
          value: function init() {
            var b = this.options;
            b.storage &&
              this._storageExpire("expire").then(function() {
                0 === localStorage.length
                  ? (CACHES = {})
                  : mapStorage(localStorage, "get");
              }),
              this.request(b.requestConfigFn),
              this.response(b.responseConfigFn);
          }
        },
        {
          key: "request",
          value: function request(b) {
            var d = this,
              c = this.options;
            c.instance.interceptors.request.use(async function(e) {
              var f = b && (await b(e));
              if (((e = f || e), e.cache)) {
                var g = d.cancelToken.source();
                e.cancelToken = g.token;
                var h = CACHES[e.url],
                  j = getExpireTime();
                h && j - h.expire < d.options.expire && g.cancel(h);
              }
              return e;
            });
          }
        },
        {
          key: "response",
          value: function response(b) {
            var c = this;
            this.options.instance.interceptors.response.use(
              async function(d) {
                var e = b && (await b(d));
                if (
                  ((d = e || d), "get" === d.config.method && d.config.cache)
                ) {
                  var f = { expire: getExpireTime(), data: d };
                  (CACHES["" + d.config.url] = f),
                    c.options.storage && mapStorage(CACHES);
                }
                return d;
              },
              function(d) {
                return c.axios.isCancel(d)
                  ? Promise.resolve(d.message.data)
                  : Promise.reject(d);
              }
            );
          }
        },
        {
          key: "_storageExpire",
          value: function _storageExpire(b) {
            var c = this;
            return new Promise(function(d) {
              var e = getStorage(b),
                f = getExpireTime();
              if (e) {
                var g = f - e < c.options.storage_expire;
                g || removeStorage();
              } else setStorage(b, f);
              d();
            });
          }
        }
      ]),
      a
    );
  })();
exports.default = Cache;
function mapStorage(a) {
  var b =
    1 < arguments.length && arguments[1] !== void 0 ? arguments[1] : "set";
  Object.entries(a).map(function(_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      c = _ref2[0],
      d = _ref2[1];
    if ("set" === b) setStorage(c, d);
    else {
      var e = /\{/g;
      CACHES[c] = e.test(d) ? JSON.parse(d) : d;
    }
  });
}
function removeStorage() {
  localStorage.clear();
}
function setStorage(a, b) {
  localStorage.setItem(a, JSON.stringify(b));
}
function getStorage(a) {
  var b = localStorage.getItem(a);
  return JSON.parse(b);
}
function getExpireTime() {
  return new Date().getTime();
}
