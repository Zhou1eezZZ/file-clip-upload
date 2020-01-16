import Vue from 'vue'
import App from './App.vue'

import '@babel/polyfill'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

import './styles/reset.css'
import './assets/fonts/font.css'

Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')
