# 服务器端统一存储架构

## 概述

该应用已从浏览器 localStorage 迁移到服务器端文件系统存储，解决了不同浏览器/IP 会有独立存储的问题。所有用户现在共享一个统一的数据存储位置，并通过密码保护实现访问控制。

## 核心特性

### 1. 统一的数据存储
- **存储位置**: `/data/dashboard.json` 在服务器端
- **访问方式**: 所有浏览器/IP 的用户访问同一个数据源
- **优势**:
  - 避免数据分散
  - 支持多人协作
  - 便于数据备份和管理

### 2. 密码保护机制
- **密码配置**: 通过环境变量 `PASSWORD` 设置
- **存储位置**: `sessionStorage` (当前会话)
- **验证流程**:
  1. 用户首次访问时弹出密码验证对话框
  2. 密码通过 API 验证
  3. 验证通过后，密码存储在当前浏览器会话
  4. 后续所有操作使用该密码进行认证

### 3. 环境变量配置

#### 文件: `.env.local`
```
PASSWORD=your-secure-password-here
```

#### 文件: `.env.example`
提供示例配置，便于部署时参考。

#### 使用说明
- 开发环境: 修改 `.env.local` 中的密码
- 生产环境: 配置服务器环境变量 `PASSWORD`
- 如果不设置，默认密码为 `default-password`

## 架构组件

### 1. API 路由 (`/src/app/api/data/route.js`)

#### GET /api/data
获取所有数据
```javascript
// 请求
GET /api/data?password=your-password

// 响应 (成功)
{
  "background": "...",
  "categories": [...]
}

// 响应 (密码错误)
{ "error": "密码错误" } // 401
```

#### POST /api/data
更新所有数据
```javascript
// 请求
POST /api/data
{
  "password": "your-password",
  "data": { /* 数据对象 */ }
}

// 响应
{ "success": true }
```

### 2. API 工具 (`/src/utils/api.js`)

提供的函数:
- `getPassword()` - 从 sessionStorage 获取密码
- `setPassword(password)` - 保存密码到 sessionStorage
- `clearPassword()` - 清除密码
- `fetchData(password)` - 获取数据
- `saveDataToServer(data, password)` - 保存数据

### 3. 密码验证组件 (`/src/components/PasswordModal.js`)

提供用户友好的密码输入界面，支持:
- 密码输入验证
- Enter 键快速提交
- 错误提示
- 加载状态

### 4. Dashboard 组件 (`/src/components/Dashboard.js`)

主要改动:
- 初始化时检查 sessionStorage 中的密码
- 没有密码时显示密码验证对话框
- 所有数据操作通过 API 进行
- 添加了"退出登录"按钮
- 显示加载和保存状态

## 数据流

### 首次访问流程
```
1. 页面加载
   ↓
2. 检查 sessionStorage 中是否有密码
   ↓
3a. 有密码 → 自动加载数据
3b. 无密码 → 显示密码输入对话框
   ↓
4. 用户输入密码
   ↓
5. 向 /api/data 验证密码
   ↓
6a. 验证通过 → 保存密码到 sessionStorage，加载数据
6b. 验证失败 → 显示错误提示，保留输入框
```

### 数据修改流程
```
1. 用户进行修改操作 (添加分类/卡片、更新背景等)
   ↓
2. 构建新数据对象
   ↓
3. 压缩数据 (使用现有的 compressData 函数)
   ↓
4. 使用 sessionStorage 中的密码通过 POST /api/data 发送
   ↓
5a. 保存成功 → 更新本地状态，显示通知
5b. 密码过期 → 清除 sessionStorage，要求重新输入密码
5c. 其他错误 → 显示错误通知
```

## 安全特性

1. **密码验证**: 所有数据访问和修改都需要正确的密码
2. **会话管理**: 密码只保存在当前浏览器会话中
3. **退出登录**: 用户可主动清除会话密码
4. **环境变量**: 敏感的密码配置通过环境变量，不硬编码
5. **密码错误处理**: 密码错误时自动清除会话，强制重新认证

## 文件结构

```
/home/engine/project/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── data/
│   │   │       └── route.js           # API 端点
│   │   └── ...
│   ├── components/
│   │   ├── Dashboard.js               # 主组件 (已更新)
│   │   ├── PasswordModal.js           # 新增密码组件
│   │   └── ...
│   └── utils/
│       ├── api.js                     # 新增 API 工具
│       ├── storage.js                 # 现有压缩工具
│       └── ...
├── data/                              # 服务器端数据目录 (新增，.gitignore)
│   └── dashboard.json                 # 统一数据文件
├── .env.local                         # 本地环境配置 (新增)
├── .env.example                       # 环境配置示例 (新增)
└── ...
```

## 部署指南

### 开发环境

1. 配置密码:
```bash
echo "PASSWORD=your-password" > .env.local
```

2. 启动开发服务器:
```bash
npm run dev
```

3. 访问应用并输入密码

### 生产环境

1. 设置环境变量:
```bash
export PASSWORD=your-secure-password
```

2. 构建并启动:
```bash
npm run build
npm start
```

3. 确保 `/data` 目录存在且 Node.js 进程有写入权限

## 向后兼容性

- 应用仍然支持旧的压缩数据格式
- 首次访问时自动迁移数据
- 如果数据文件不存在，会自动使用初始数据

## 故障排除

### 问题: 密码始终错误
**解决**: 检查 `.env.local` 中的 `PASSWORD` 设置是否正确

### 问题: 数据无法保存
**解决**: 
1. 确保 `/data` 目录存在且有写入权限
2. 检查错误日志中的具体错误信息
3. 验证密码是否正确

### 问题: 退出登录后无法重新登录
**解决**: 这是正常的 - 退出登录会清除会话密码，需要重新输入

## 配置示例

### 示例 1: 使用默认密码
```bash
# 不设置 PASSWORD，使用默认值
npm run dev
```
默认密码: `default-password`

### 示例 2: 自定义密码
```bash
# .env.local
PASSWORD=my-super-secret-password-123

npm run dev
```

### 示例 3: 生产环境
```bash
# Vercel 等平台
# 在环境变量设置中添加:
# PASSWORD = your-production-password

npm run build
npm start
```

## 迁移说明

如果从旧的 localStorage 方式迁移:

1. 旧数据自动保存在浏览器的 localStorage 中
2. 在新系统首次启动时，可以手动导出旧数据
3. 导入到新的服务器端存储

示例脚本 (开发者工具):
```javascript
// 导出旧数据
const oldData = localStorage.getItem('dashboardData')
console.log(JSON.parse(oldData))

// 然后手动调用 API 保存
```

## 监控和维护

建议定期:
1. 备份 `/data/dashboard.json`
2. 检查 API 错误日志
3. 验证文件权限设置
4. 考虑实现密码变更机制

## 相关文件

- `STORAGE_LOGIC.md` - 数据压缩逻辑说明
- `COMPRESSION_DEMO.md` - 压缩演示和效果对比
