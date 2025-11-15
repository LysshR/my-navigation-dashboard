/**
 * 初始化存储脚本
 * 创建必要的数据目录和初始文件
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'dashboard.json')

const initialData = {
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
}

function initStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
      console.log('✓ 创建数据目录:', DATA_DIR)
    }

    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2))
      console.log('✓ 创建初始数据文件:', DATA_FILE)
    } else {
      console.log('✓ 数据文件已存在:', DATA_FILE)
    }

    console.log('✓ 存储初始化完成')
  } catch (error) {
    console.error('✗ 初始化失败:', error.message)
    process.exit(1)
  }
}

initStorage()
