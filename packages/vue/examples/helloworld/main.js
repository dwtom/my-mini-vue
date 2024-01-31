import { createApp } from '../../dist/my-mini-vue.esm.js';
import { App } from './App.js';

const appEle = document.querySelector('#app');
createApp(App).mount(appEle);
