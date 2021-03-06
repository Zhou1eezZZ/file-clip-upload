# 文件切片上传系统

> 本项目是对 [yeyan1996](https://juejin.im/user/5ba9f38ce51d450e8477bd7a) 在掘金 [实现一个大文件上传和断点续传](https://juejin.im/post/5dff8a26e51d4558105420ed#heading-19) 一文中技术项目的一个修改版本。支持根据文件大小来进行切片上传以及文件的秒传。可以通过项目中的 `CLIP_SIZE` 变量自定义单个切片的大小，程序会根据该值对文件进行切片并上传。

## 项目运行图片
![项目图片](https://github.com/Zhou1eezZZ/Image/blob/master/fileclip.gif)

## TODO

- [ ] 断点续传
- [x] 界面美化

## 项目目录结构

```
|-- .browserslistrc
|-- .eslintrc.js
|-- .gitignore
|-- .prettierrc.js
|-- babel.config.js
|-- package.json
|-- README.md
|-- vue.config.js
|-- yarn.lock
|-- public
|   |-- favicon.ico
|   |-- hash.js // 根据上传的文件内容生成hash值
|   |-- index.html
|   |-- spark-md5.min.js // spark-md5工具库
|-- server // 项目后台
|   |-- app.js // 服务端入口（启动服务，监听接口）
|   |-- controller.js // 服务端的业务处理函数
|-- src // 项目前端资源文件夹
|   |-- App.vue // 上传页面（由于就一个页面，就直接写在app.vue中了）
|   |-- main.js // 入口文件
|   |-- api
|   |   |-- axios.js // 请求封装
|   |   |-- upload.js // 上传用到的各个接口
|   |-- assets
|       |-- fonts // 本地字体存储
|   |-- config
|   |   |-- index.js
|   |-- styles
|   |   |-- reset.css
|   |-- utils
|       |-- tool.js // 工具函数
|-- target // 上传的文件的保存目录
    |-- 9db49411dd83dec76bec773dce65e5f4.gif // 上传的文件，名字为（hash值+后缀）
```

## 项目步骤

### 安装依赖
```
npm install
```

### 启动项目前端开发环境
```
npm run serve
```

### 启动项目后端服务
```
nodemon ./server/app.js
```

### 打包项目
```
npm run build
```

### 格式化项目
```
npm run lint
```
## 注意事项

- 有问题可以去掘金围观原项目的 [作者思路](https://juejin.im/post/5dff8a26e51d4558105420ed#heading-19) .