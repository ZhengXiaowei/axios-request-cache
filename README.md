# 前端缓存

这里讲的前端缓存是指前端对接口数据的缓存处理，而不是通过 HTTP(s)缓存

**需要配合axios使用**

## 安装

通过`npm`安装：

```
npm install axios-request-cache --save
```

通过`yarn`安装：

```
yarn add axios-request-cache
```

## 参数说明

```
default_options = {
  expire: 60000,          #缓存过期时间 默认一分钟
  storage: false,         #是否开启本地缓存 开启后会将缓存存入 localstorage
  storage_expire: 360000  #本地缓存过期时间 过期后会清空所有本地缓存
  instance: this.axios,   #axios的实例对象 默认指向当前axios
  requestConfigFn: null,  #请求拦截的操作函数 参数为请求的config对象 返回一个Promise
  responseConfigFn: null, #响应拦截的操作函数 参数为响应数据的response对象 返回一个Promise
}
```

## 使用

```
import axios from 'axios'
import Cache from 'axios-request-cache'

// axios的自定义实例
let instance = axios.create({
  baseURL: ''
})

let cache = new Cache(axios) // 将当前 axios 对象传入 Cache 中
cache.use({
  expire: 30000,
  storage: true,
  instance, // 如果有自定义axios实例 比如上面的instance 需要将其传入instance 没有则不传
  requestConfigFn: config => {
    // 请求拦截自定义操作
    if (config.header) {
      config.header.token = 'i am token'
    } else {
      config.header = { token: 'i am token' }
    }
    // 需要将config对象通过 Promise 返回 cache 中 也可以使用new Promise的写法
    return Promise.resolve(config)
  },
  responseConfigFn: res => {
    // 响应拦截的自定义操作
    if (!res.data.code) {
      // 需要将 res 通过 Promise 返回
      return Promise.resolve(res)
    }
  }
})

export default instance
```

然后页面中接口请求如下配置:

```vue
<template>
  <div>
    i am page A
    <router-link to="/">回首页</router-link>
  </div>
</template>

<script>
import axios from '../utils/axios'

export default {
  mounted() {
    // 加上属性cache:true 则表示当前接口需要缓存（可以从缓存获取）
    axios('v2/book/1003078', {
      cache: true
    }).then(r => {
      console.log(r)
    })
  }
}
</script>
```

或者在统一的`api`接口管理文件中配置：

```js
import axios from './axios'

export const getBooks = () => {
  return axios('v2/book/1003078', { cache: true })
}
```