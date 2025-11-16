export const dynamic = 'force-dynamic'

// 存储 API key 的内存变量（服务器重启后重置为环境变量）
let CUSTOM_UNSPLASH_API_KEY = null
const DEFAULT_UNSPLASH_API_KEY = process.env.UNSPLASHAPI || ''

// 获取当前有效的 API key
function getApiKey() {
  return CUSTOM_UNSPLASH_API_KEY || DEFAULT_UNSPLASH_API_KEY
}

// GET - 获取随机 Unsplash 背景图片
export async function GET(request) {
  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json(
        { error: 'Unsplash API key 未配置' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || 'landscape,nature'
    const orientation = searchParams.get('orientation') || 'landscape'

    const url = new URL('https://api.unsplash.com/photos/random')
    url.searchParams.append('query', query)
    url.searchParams.append('orientation', orientation)
    url.searchParams.append('client_id', apiKey)

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return Response.json({
      url: data.urls.full,
      regular: data.urls.regular,
      thumb: data.urls.thumb,
      author: data.user.name,
      authorLink: data.user.links.html
    })
  } catch (error) {
    console.error('GET /api/unsplash error:', error)
    return Response.json(
      { error: '获取 Unsplash 图片失败: ' + error.message },
      { status: 500 }
    )
  }
}

// POST - 设置自定义 Unsplash API key（只能覆盖，不能查看）
export async function POST(request) {
  try {
    const { apiKey } = await request.json()
    
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return Response.json(
        { error: 'API key 不能为空' },
        { status: 400 }
      )
    }
    
    // 设置自定义 API key
    CUSTOM_UNSPLASH_API_KEY = apiKey.trim()
    
    return Response.json({
      success: true,
      message: 'API key 已更新'
    })
  } catch (error) {
    console.error('POST /api/unsplash error:', error)
    return Response.json(
      { error: '设置 API key 失败: ' + error.message },
      { status: 500 }
    )
  }
}
