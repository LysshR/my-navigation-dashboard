# 🌟 Dashboard 导航网站

一个美丽的玻璃态风格导航网站，支持自定义背景、分类和网站卡片管理。

## ✨ 特性

- 🎨 精美的玻璃态（Glassmorphism）设计
- 🖼️ 可自定义背景（URL或本地上传）
- 📁 分类管理（添加/删除）
- 🔖 网站卡片管理（添加/删除）
- 📱 响应式设计
- 💾 数据持久化存储

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
2. 启动后端服务器
Bash

npm start
服务器将运行在 http://localhost:3000

3. 打开前端
在浏览器中打开 frontend/index.html 文件

或使用 Live Server 等工具运行前端

📖 使用说明
更改背景
点击右上角的设置图标
输入图片URL或上传本地图片
点击"保存背景"
添加分类
点击底部"添加分类"按钮
输入分类名称
点击"添加"
添加网站
在任意分类中点击"添加网站"卡片
填写网站名称、地址和图标URL
点击"添加"
删除操作
删除网站：鼠标悬停在卡片上，点击右上角的 ✕ 按钮
删除分类：鼠标悬停在分类上，点击"删除分类"按钮
🛠️ 技术栈
前端: HTML5, CSS3, JavaScript (原生)
后端: Node.js, Express
存储: JSON 文件
上传: Multer
📁 项目结构

navigation-dashboard/
├── backend/            # 后端代码
│   ├── server.js      # Express 服务器
│   ├── data.json      # 数据存储
│   └── package.json   # 依赖配置
├── frontend/          # 前端代码
│   ├── index.html     # 主页面
│   ├── style.css      # 样式文件
│   └── app.js         # 前端逻辑
└── uploads/           # 上传文件存储
🎨 自定义
修改主题色
在 frontend/style.css 中修改 CSS 变量：

CSS

:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
}
修改默认数据
编辑 backend/data.json 文件

📝 注意事项
确保后端服务器在使用前端前已启动
上传的图片存储在 uploads/ 目录
数据保存在 backend/data.json 文件中
📄 许可证
MIT License

