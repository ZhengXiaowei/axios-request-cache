# 前端缓存

这里讲的前端缓存是指前端对接口数据的缓存处理，而不是通过 HTTP(s)缓存

## 前言

通常会在项目中有这么些情况发生，比如每次页面切换的时候都会请求接口，如果频繁切换，也就会导致接口频繁的请求，而且在数据基本没有什么变动的情况下，这样的做法明显是浪费网络资源的。所以我们出于考虑，要实现接口的缓存，避免频繁的去请求接口。如果后端同学不给于帮助的话。。。那我们就进入今天的主题--`前端缓存`。(当然，能 http 缓存就 http 缓存最好了~)

## 安装

```
npm install axios-request-cache --save
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