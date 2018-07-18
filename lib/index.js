let CACHES = {}

export default class Cache {
  constructor(axios) {
    this.axios = axios
    if (!this.axios) throw new Error('缺少axios实例')
    this.cancelToken = axios.CancelToken
    this.options = {}
  }

  use(options) {
    let defaults = {
      expire: 60000, // 过期时间 默认一分钟
      storage: false, // 是否开启缓存
      storage_expire: 3600000, // 本地缓存过期时间 默认一小时
      instance: this.axios, // axios的实例对象 默认指向当前axios
      requestConfigFn: null, // 请求拦截的操作函数 参数为请求的config对象 返回一个Promise
      responseConfigFn: null // 响应拦截的操作函数 参数为响应数据的response对象 返回一个Promise
    }
    this.options = Object.assign(defaults, options)
    this.init()
    // if (options && !options.instance) return this.options.instance
  }

  init() {
    let options = this.options
    if (options.storage) {
      // 如果开启本地缓存 则设置一个过期时间 避免时间过久 缓存一直存在
      this._storageExpire('expire').then(() => {
        if (localStorage.length === 0) CACHES = {}
        else mapStorage(localStorage, 'get')
      })
    }
    this.request(options.requestConfigFn)
    this.response(options.responseConfigFn)
  }

  request(cb) {
    let options = this.options
    options.instance.interceptors.request.use(async config => {
      // 判断用户是否返回 config 的 promise
      let newConfig = cb && (await cb(config))
      config = newConfig || config
      if (config.cache) {
        let source = this.cancelToken.source()
        config.cancelToken = source.token
        let data = CACHES[config.url]
        let expire = getExpireTime()
        // 判断缓存数据是否存在 存在的话 是否过期 没过期就返回
        if (data && expire - data.expire < this.options.expire) {
          source.cancel(data)
        }
      }
      return config
    })
  }

  response(cb) {
    this.options.instance.interceptors.response.use(
      async response => {
        let newResponse = cb && (await cb(response))
        response = newResponse || response
        if (response.config.method === 'get' && response.config.cache) {
          let data = {
            expire: getExpireTime(),
            data: response
          }
          CACHES[`${response.config.url}`] = data
          if (this.options.storage) mapStorage(CACHES)
        }
        return response
      },
      error => {
        // 返回缓存数据
        if (this.axios.isCancel(error)) {
          return Promise.resolve(error.message.data)
        }
        return Promise.reject(error)
      }
    )
  }

  // 本地缓存过期判断
  _storageExpire(cacheKey) {
    return new Promise(resolve => {
      let key = getStorage(cacheKey)
      let date = getExpireTime()
      if (key) {
        // 缓存存在 判断是否过期
        let isExpire = date - key < this.options.storage_expire
        // 如果过期 则重新设定过期时间 并清空缓存
        if (!isExpire) {
          removeStorage()
        }
      } else {
        setStorage(cacheKey, date)
      }
      resolve()
    })
  }
}

/**
 * caches: 缓存列表
 * type: set->存 get->取
 */
function mapStorage(caches, type = 'set') {
  Object.entries(caches).map(([key, cache]) => {
    if (type === 'set') {
      setStorage(key, cache)
    } else {
      // 正则太弱 只能简单判断是否是json字符串
      let reg = /\{/g
      if (reg.test(cache)) CACHES[key] = JSON.parse(cache)
      else CACHES[key] = cache
    }
  })
}

// 清除本地缓存
function removeStorage() {
  localStorage.clear()
}

// 设置缓存
function setStorage(key, cache) {
  localStorage.setItem(key, JSON.stringify(cache))
}

// 获取缓存
function getStorage(key) {
  let data = localStorage.getItem(key)
  return JSON.parse(data)
}

// 设置过期时间
function getExpireTime() {
  return new Date().getTime()
}
