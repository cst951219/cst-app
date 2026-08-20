// CST APP — 入口文件
import { App } from './app.js';

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    window.__app = app; // 调试用
});
