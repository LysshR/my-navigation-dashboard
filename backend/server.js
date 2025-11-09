const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 数据文件路径
const dataPath = path.join(__dirname, 'data.json');

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// 读取数据
function readData() {
  try {
    if (!fs.existsSync(dataPath)) {
      const initialData = {
        background: '',
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
          },
          {
            id: '2',
            name: '社交媒体',
            cards: [
              {
                id: '3',
                title: 'Twitter',
                url: 'https://twitter.com',
                icon: 'https://twitter.com/favicon.ico'
              }
            ]
          }
        ]
      };
      fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.error('读取数据失败:', error);
    return { background: '', categories: [] };
  }
}

// 写入数据
function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('写入数据失败:', error);
    return false;
  }
}

// API路由

// 获取所有数据
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

// 更新背景
app.post('/api/background', (req, res) => {
  const { background } = req.body;
  const data = readData();
  data.background = background;
  writeData(data);
  res.json({ success: true, background });
});

// 上传背景图片
app.post('/api/upload-background', upload.single('background'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有文件上传' });
  }
  const backgroundUrl = `/uploads/${req.file.filename}`;
  const data = readData();
  data.background = backgroundUrl;
  writeData(data);
  res.json({ success: true, background: backgroundUrl });
});

// 添加分类
app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  const data = readData();
  const newCategory = {
    id: Date.now().toString(),
    name,
    cards: []
  };
  data.categories.push(newCategory);
  writeData(data);
  res.json({ success: true, category: newCategory });
});

// 删除分类
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  data.categories = data.categories.filter(cat => cat.id !== id);
  writeData(data);
  res.json({ success: true });
});

// 更新分类名称
app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const data = readData();
  const category = data.categories.find(cat => cat.id === id);
  if (category) {
    category.name = name;
    writeData(data);
    res.json({ success: true, category });
  } else {
    res.status(404).json({ success: false, message: '分类不存在' });
  }
});

// 添加卡片
app.post('/api/categories/:categoryId/cards', (req, res) => {
  const { categoryId } = req.params;
  const { title, url, icon } = req.body;
  const data = readData();
  const category = data.categories.find(cat => cat.id === categoryId);
  
  if (category) {
    const newCard = {
      id: Date.now().toString(),
      title,
      url,
      icon
    };
    category.cards.push(newCard);
    writeData(data);
    res.json({ success: true, card: newCard });
  } else {
    res.status(404).json({ success: false, message: '分类不存在' });
  }
});

// 删除卡片
app.delete('/api/categories/:categoryId/cards/:cardId', (req, res) => {
  const { categoryId, cardId } = req.params;
  const data = readData();
  const category = data.categories.find(cat => cat.id === categoryId);
  
  if (category) {
    category.cards = category.cards.filter(card => card.id !== cardId);
    writeData(data);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: '分类不存在' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});