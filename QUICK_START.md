# 快速开始指南

## 🎯 30 秒快速入门

### 1. 启动应用
```bash
npm run dev
```

### 2. 打开浏览器
访问：`http://localhost:3000`

### 3. 输入密码
默认密码：`admin123`

### 4. 开始使用！
- 添加分类
- 添加网站
- 修改背景
- 管理你的导航

## 🔐 修改密码

### 开发环境
编辑 `.env.local`：
```bash
PASSWORD=your-new-password
```

然后重启服务器。

### 生产环境
设置环境变量：
```bash
export PASSWORD=your-secure-password
npm run build
npm start
```

## 📂 数据存储位置

所有数据自动保存到：
```
/data/dashboard.json
```

数据在所有浏览器/IP 中共享。

## 🔄 数据共享演示

### 浏览器 A：
1. 打开应用，输入密码
2. 添加分类 "我的工具"
3. 添加网站 "Google"

### 浏览器 B：
1. 打开应用，输入密码
2. 看到 "我的工具" 分类和 "Google" 网站
3. 对数据的修改实时同步

## 📝 功能说明

### 密码认证
- 所有数据访问需要密码
- 密码在当前会话有效
- 关闭标签页后需要重新输入（新标签页）
- 点击"退出登录"可主动清除密码

### 数据操作
- **添加分类**：点击"添加分类"按钮
- **添加网站**：点击分类下的"+"按钮
- **修改背景**：点击右上角的设置按钮
- **删除分类/网站**：点击相应的删除按钮

### 多设备同步
- 任何设备对数据的修改
- 会立即在所有其他设备上可见
- 需要刷新页面以获取最新数据

## 🆘 常见问题

### Q: 忘记密码了
A: 修改 `.env.local` 中的 PASSWORD 值，然后重启服务器

### Q: 数据在另一个浏览器看不到
A: 这是正常的，需要输入相同的密码。两个浏览器必须使用相同的密码才能访问同一个数据源。

### Q: 如何重置所有数据
A: 删除 `/data/dashboard.json` 文件，然后：
```bash
npm run init
```

### Q: 部署到服务器后无法保存数据
A: 确保：
1. `/data` 目录存在且可写
2. 环境变量 PASSWORD 已设置
3. Node.js 进程有足够权限

## 📚 更多文档

- **UNIFIED_STORAGE_GUIDE.md** - 详细的使用指南
- **SERVER_STORAGE.md** - 技术架构文档
- **CHANGES_SUMMARY.md** - 更新说明

## 💡 提示

- 密码应该包含大小写字母、数字和特殊字符（生产环境）
- 定期备份 `/data/dashboard.json` 文件
- 建议在生产环境使用 HTTPS

## 🚀 部署

### Vercel
1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 添加环境变量 `PASSWORD`
4. 部署

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
ENV PASSWORD=your-password
CMD npm start
```

### 其他服务器
```bash
git clone <your-repo>
cd <your-repo>
npm install
export PASSWORD=your-password
npm run build
npm start
```

## ✨ 就这么简单！

现在你可以享受统一的、密码保护的导航仪表盘了！
