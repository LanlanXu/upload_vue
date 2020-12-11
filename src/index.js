/** @format */
import 'babel-polyfill';
import '@/assets/styles/revise.less';

import Vue from 'vue';
import App from './App';

// 导入插件

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
});
