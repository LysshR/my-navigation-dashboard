import { promises as fs } from 'fs'
import { join } from 'path'
import crypto from 'crypto'

const DATA_FILE = join(process.cwd(), 'data', 'dashboard.json')
const PASSWORD = process.env.PASSWORD || 'default-password'

// 初始数据
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

// 验证密码
function verifyPassword(password) {
  if (!password) return false
  return password === PASSWORD
}

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(join(process.cwd(), 'data'), { recursive: true })
  } catch (error) {
    console.error('Failed to create data directory:', error)
  }
}

// 读取数据
async function readData() {
  try {
    await ensureDataDir()
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 文件不存在，返回初始数据并创建文件
      await writeData(initialData)
      return initialData
    }
    throw error
  }
}

// 写入数据
async function writeData(data) {
  try {
    await ensureDataDir()
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to write data:', error)
    throw error
  }
}

// GET - 获取数据
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password')

    if (!verifyPassword(password)) {
      return Response.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    const data = await readData()
    return Response.json(data)
  } catch (error) {
    console.error('GET /api/data error:', error)
    return Response.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}

// POST - 更新数据
export async function POST(request) {
  try {
    const body = await request.json()
    const { password, data } = body

    if (!verifyPassword(password)) {
      return Response.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: '无效的数据格式' },
        { status: 400 }
      )
    }

    await writeData(data)
    return Response.json({ success: true })
  } catch (error) {
    console.error('POST /api/data error:', error)
    return Response.json(
      { error: '保存数据失败' },
      { status: 500 }
    )
  }
}
