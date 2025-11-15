# 文件保存逻辑详解

## 总体架构

该应用使用 **localStorage** 作为持久化存储方式，采用 **JSON 格式压缩**策略来节省存储空间。

### 存储位置
- **Key**: `dashboardData`
- **位置**: 浏览器 localStorage
- **大小限制**: 通常 5-10MB（取决于浏览器）

---

## 数据结构演变

### 原始数据格式（完整格式）
使用完整的字段名，便于代码阅读：

```javascript
{
  background: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920',
  categories: [
    {
      id: '1',
      name: '常用工具',
      cards: [
        {
          id: '1',
          title: 'Google',
          url: 'https://www.google.com',
          icon: 'https://www.google.com/favicon.ico'
        },
        {
          id: '2',
          title: 'GitHub',
          url: 'https://github.com',
          icon: 'https://github.com/favicon.ico'
        }
      ]
    }
  ]
}
```

**大小估计**: ~1,200 字节（仅示例数据）

---

### 压缩后的格式（优化格式）
应用内部压缩，使用缩写的字段名：

```javascript
{
  b: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920',
  c: [
    {
      i: '1',
      n: '常用工具',
      d: [
        {
          i: '1',
          t: 'Google',
          u: 'https://www.google.com'
          // icon 被省略，因为是标准 favicon 格式
        },
        {
          i: '2',
          t: 'GitHub',
          u: 'https://github.com'
          // icon 被省略，因为是标准 favicon 格式
        }
      ]
    }
  ]
}
```

**大小估计**: ~600-700 字节（同样数据，节省 ~40-50%）

---

## 压缩策略详解

### 1. 字段名缩写

| 原始字段名 | 缩写 | 说明 |
|-----------|------|------|
| background | b | 背景图片 URL |
| categories | c | 分类列表 |
| id | i | 标识符 |
| name | n | 分类名称 |
| cards | d | 卡片/网站列表（data） |
| title | t | 网站标题 |
| url | u | 网站 URL |
| icon | ic | 网站图标（可选） |

**节省空间**: ~30-35%

### 2. Icon 智能处理

**规则**: 
- 如果 `icon` URL 匹配 `{url}/favicon.ico` 的标准格式，**不存储** icon 字段
- 加载时自动根据 URL 生成标准 favicon 路径
- 其他自定义 icon URL 才会被存储（带 `ic` 字段）

**例子**:
```javascript
// 保存时
{
  url: 'https://google.com',
  icon: 'https://google.com/favicon.ico'  // 标准格式，不存储
}

// 存储后
{
  u: 'https://google.com'
  // ic 字段被省略
}

// 加载时自动恢复为
{
  url: 'https://google.com',
  icon: 'https://google.com/favicon.ico'  // 自动生成
}
```

**节省空间**: ~10-15%（因为大多数网站使用标准 favicon）

---

## 数据流程

### 保存流程 (Save)

```
用户操作
    ↓
修改本地 state (setData)
    ↓
调用 saveData(newData)
    ↓
compressData(newData) ← 压缩数据
    ↓
JSON.stringify(compressed) ← 转换为 JSON 字符串
    ↓
localStorage.setItem(STORAGE_KEY, jsonString) ← 存储
    ↓
成功/错误处理
```

**关键函数**: `saveData()` (Dashboard.js 第 73-82 行)

```javascript
const saveData = useCallback((newData) => {
  setData(newData)
  try {
    // 压缩数据后再保存，节省空间
    const compressed = compressData(newData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compressed))
  } catch (error) {
    console.error('Failed to save data to localStorage:', error)
  }
}, [])
```

---

### 加载流程 (Load)

```
应用启动
    ↓
useEffect 触发 (只执行一次)
    ↓
localStorage.getItem(STORAGE_KEY) ← 读取数据
    ↓
JSON.parse(saved) ← 解析 JSON
    ↓
decompressData(parsedData) ← 解压缩数据
    ↓
检查格式兼容性 (向后兼容旧格式)
    ↓
setData(decompressed) ← 更新 state
    ↓
组件渲染
```

**关键代码**: useEffect 在 Dashboard.js 第 57-70 行

```javascript
useEffect(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsedData = JSON.parse(saved)
      // 自动解压缩数据（向后兼容旧格式）
      const decompressed = decompressData(parsedData)
      setData(decompressed)
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error)
  }
}, [])
```

---

## 向后兼容性

### decompressData 函数逻辑

```javascript
export function decompressData(data) {
  if (!data || typeof data !== 'object') return data

  // 检查是否已是完整格式（有 'background' 字段）
  if ('background' in data) {
    // 已经是完整格式，直接返回
    return data
  }

  // 否则从压缩格式转换
  return {
    background: data.b,
    categories: (data.c || []).map(category => ({
      id: category.i,
      name: category.n,
      cards: (category.d || []).map(card => ({
        id: card.i,
        title: card.t,
        url: card.u,
        icon: card.ic || generateStandardFavicon(card.u)
      }))
    }))
  }
}
```

**特点**:
- ✅ 能读取新格式（压缩格式）
- ✅ 能读取旧格式（完整格式）
- ✅ 自动识别并转换
- ✅ 无需数据迁移脚本

---

## 性能指标

### 空间节省计算

假设有 50 个网站，5 个分类：

| 指标 | 原始格式 | 压缩格式 | 节省比例 |
|-----|--------|--------|---------|
| 预估大小 | ~25 KB | ~12-14 KB | **40-50%** |
| 存储占用 | 25 KB | 12-14 KB | ~13 KB 节省 |

### localStorage 配额计算

以 10 MB 容量为例：

| 格式 | 可存储网站数 | 可存储分类数 |
|-----|----------|----------|
| 原始格式 | ~200-250 个 | ~20-25 个 |
| 压缩格式 | **~400-500 个** | ~40-50 个 |

**结论**: 压缩格式可以存储 **2 倍以上** 的数据量。

---

## 错误处理

### 1. localStorage 不可用
```javascript
try {
  localStorage.setItem(...)
} catch (error) {
  console.error('Failed to save data to localStorage:', error)
  // 静默失败，但记录错误日志
}
```

### 2. JSON 解析错误
```javascript
try {
  JSON.parse(saved)
} catch (error) {
  console.error('Failed to load data from localStorage:', error)
  // 使用初始数据
}
```

### 3. 数据格式异常
```javascript
if ('background' in data) {
  // 识别为完整格式
} else {
  // 作为压缩格式处理
}
```

---

## 使用示例

### 获取压缩统计信息

```javascript
import { getCompressionStats } from '@/utils/storage'

const data = { /* 完整数据 */ }
const stats = getCompressionStats(data)

console.log(`
  原始大小: ${stats.original} 字节
  压缩大小: ${stats.compressed} 字节
  压缩率: ${stats.ratio}
  节省空间: ${stats.saved} 字节
`)
```

**输出示例**:
```
原始大小: 25600 字节
压缩大小: 13120 字节
压缩率: 48.75%
节省空间: 12480 字节
```

---

## 实现细节

### 文件位置
- **存储工具**: `/src/utils/storage.js`
- **主组件**: `/src/components/Dashboard.js`

### 主要函数

#### `compressData(data)`
- **输入**: 完整格式数据
- **输出**: 压缩格式数据
- **用途**: 保存数据前调用

#### `decompressData(data)`
- **输入**: 压缩或完整格式数据
- **输出**: 完整格式数据
- **用途**: 加载数据后调用，自动识别格式

#### `getStorageSize(data)`
- **输入**: 任意对象
- **输出**: 估计的字节大小
- **用途**: 计算存储占用

#### `getCompressionStats(data)`
- **输入**: 完整格式数据
- **输出**: 压缩统计信息对象
- **用途**: 获取压缩效果报告

---

## 扩展建议

### 未来优化方向

1. **LZ 压缩算法**
   - 使用 `lz-string` 库进一步压缩
   - 可达到 60-70% 的压缩率
   - 代价: 增加 CPU 使用和复杂度

2. **IndexedDB 迁移**
   - 当数据量很大时（>5MB）
   - 提供更大的存储容量（50MB+）
   - 支持更复杂的查询

3. **云同步**
   - 支持跨设备同步
   - 使用 Firebase 或其他后端
   - 保证数据安全性

4. **版本控制**
   - 在压缩数据中添加版本号
   - 支持格式升级和降级
   - 便于数据迁移

---

## 总结

| 方面 | 说明 |
|-----|------|
| **存储方式** | localStorage (JSON 格式) |
| **压缩策略** | 字段名缩写 + Icon 智能处理 |
| **压缩效果** | 40-50% 空间节省 |
| **兼容性** | 向后兼容旧格式 |
| **加载时机** | 应用启动时一次性加载 |
| **保存时机** | 用户修改数据时立即保存 |
| **错误处理** | try-catch 包装，静默失败 |
| **扩展性** | 支持未来的优化升级 |
