export const dynamic = 'force-dynamic'

const UNSPLASH_API_KEY = process.env.UNSPLASHAPI || ''

// GET - 获取随机 Unsplash 背景图片
export async function GET(request) {
  try {
    if (!UNSPLASH_API_KEY) {
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
    url.searchParams.append('client_id', UNSPLASH_API_KEY)

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
