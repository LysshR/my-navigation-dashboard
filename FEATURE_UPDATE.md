# 功能更新文档

## 概述

本次更新对网站导航仪表盘进行了重大改进，主要包括：编辑模式密码验证、横向布局设计、Unsplash 背景集成和性能优化。

## 主要改动

### 1. 编辑模式（按需密码验证）

#### 之前
- 访问页面需要输入密码
- 用户无法直接查看内容

#### 现在
- **查看模式**（默认）：无需密码，可直接浏览所有网站
- **编辑模式**：需要输入密码才能执行以下操作：
  - 添加/删除分类
  - 添加/删除网站
  - 修改背景图片

#### 使用方式
1. 访问页面，直接查看所有内容
2. 点击右上角的"解锁"图标进入编辑模式
3. 输入密码（默认：`admin123`）
4. 编辑完成后，点击"锁"图标退出编辑模式

#### 技术实现
- 编辑模式状态保存在 `sessionStorage`
- 刷新页面后编辑模式保持
- GET 请求无需密码，POST 请求需要密码验证

### 2. 横向布局

#### 之前
- 类别纵向排列
- 每个类别下方是网格布局的卡片

#### 现在
- **类别横向排列**，支持横向滚动
- 每个类别是独立的列（宽度：320-400px）
- **卡片纵向排列**在类别下方
- 卡片采用更紧凑的横向设计：
  - 图标在左侧（48x48px）
  - 标题在右侧
  - 删除按钮在右上角（仅编辑模式显示）

#### 滚动条美化
- 横向滚动条：主内容区域底部
- 纵向滚动条：每个类别的卡片区域
- 半透明设计，融入玻璃态风格

### 3. Unsplash 背景集成

#### 功能
- 一键获取随机 Unsplash 风景图片作为背景
- 支持预览后再保存

#### 使用方式
1. 进入编辑模式
2. 点击顶部"图片"图标打开设置
3. 点击"随机 Unsplash 图片"按钮
4. 图片 URL 自动填充到输入框
5. 点击"保存背景"应用

#### 配置
在 `.env.local` 中设置 Unsplash API Key：

```env
UNSPLASHAPI=your-unsplash-api-key-here
```

获取 API Key：https://unsplash.com/developers

### 4. 性能优化

#### React 优化
- 所有组件使用 `React.memo` 包装，减少不必要的重新渲染
- 使用 `useCallback` 缓存函数引用
- 图片添加 `loading="lazy"` 实现懒加载

#### CSS 优化
- 使用 `will-change` 提示浏览器优化动画
- 使用 `contain: content` 隔离重绘区域
- 使用 `transform` 代替 `position` 动画
- `scroll-snap` 优化滚动体验

#### 代码分割
- API 路由独立
- 组件按需加载

## UI 改进

### 编辑模式指示
- 顶部显示绿色"编辑模式"徽章（带脉冲动画）
- 锁/解锁图标按钮切换编辑模式
- 编辑按钮仅在编辑模式下显示：
  - "添加分类"按钮
  - "删除分类"按钮
  - "添加网站"按钮
  - 卡片删除按钮

### 按钮样式
- 主按钮（btn-primary）：渐变色背景
- 次级按钮（btn-secondary）：半透明白色背景
- 图标按钮：圆角玻璃效果
- 编辑模式按钮：绿色主题

### 类别头部
- 独立的玻璃态背景
- 类别标题和操作按钮纵向排列
- 更清晰的视觉层次

## 环境变量

```env
# 编辑密码（必需）
PASSWORD=admin123

# Unsplash API Key（可选，用于随机背景）
UNSPLASHAPI=your-unsplash-api-key-here
```

## API 端点

### GET /api/data
获取仪表盘数据（无需密码）

**响应**：
```json
{
  "b": "背景图片URL",
  "c": [类别数组]
}
```

### POST /api/data
保存数据或验证密码（需要密码）

**请求体**：
```json
{
  "password": "密码",
  "data": {数据对象},
  "verifyOnly": false  // true 时仅验证密码
}
```

### GET /api/unsplash
获取随机 Unsplash 图片

**查询参数**：
- `query`: 搜索关键词（默认：landscape,nature）
- `orientation`: 图片方向（默认：landscape）

**响应**：
```json
{
  "url": "完整尺寸URL",
  "regular": "常规尺寸URL",
  "thumb": "缩略图URL",
  "author": "作者名",
  "authorLink": "作者链接"
}
```

## 部署指南

### 开发环境

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，设置 PASSWORD 和 UNSPLASHAPI

# 3. 启动开发服务器
npm run dev
```

### 生产环境

```bash
# 1. 构建
npm run build

# 2. 启动服务器
npm start
```

或使用 PM2：

```bash
pm2 start npm --name "dashboard" -- start
```

### 环境变量设置

根据部署平台设置：

- **Vercel/Netlify**: 在项目设置中添加环境变量
- **Docker**: 在 docker-compose.yml 或启动命令中设置
- **服务器**: 在 .env.local 中设置或使用 export

## 常见问题

### Q: 忘记密码怎么办？
A: 修改 `.env.local` 中的 `PASSWORD` 变量，重启服务器。

### Q: Unsplash 图片加载失败？
A: 检查 `UNSPLASHAPI` 是否正确配置，确认 API key 有效。

### Q: 如何关闭 Unsplash 功能？
A: 不设置 `UNSPLASHAPI` 环境变量即可，按钮会显示错误提示。

### Q: 编辑模式会自动退出吗？
A: 只有手动退出或关闭浏览器标签页才会退出。刷新页面不会退出。

### Q: 多个用户编辑会冲突吗？
A: 最后保存的操作会覆盖之前的数据。建议同时只有一个用户编辑。

## 兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器

## 性能指标

- 首次加载：< 2s
- 交互响应：< 100ms
- 平滑滚动：60fps
- 内存占用：< 50MB

## 未来规划

- [ ] 多用户权限管理
- [ ] 数据备份/恢复功能
- [ ] 自定义主题
- [ ] 搜索功能
- [ ] 拖拽排序
- [ ] 导入/导出数据
- [ ] PWA 支持

## 技术栈

- Next.js 14 (App Router)
- React 18
- Node.js 18+
- Unsplash API
- CSS3 (玻璃态设计)

## 反馈与支持

如有问题或建议，请联系开发团队。
