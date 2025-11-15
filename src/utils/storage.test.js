/**
 * 存储压缩逻辑测试
 * 
 * 使用方式：
 * 在浏览器控制台运行以下代码：
 * 
 * import { compressData, decompressData, getCompressionStats } from '@/utils/storage'
 * 
 * const testData = { 
 *   background: 'https://example.com/bg.jpg',
 *   categories: [...]
 * }
 * 
 * const stats = getCompressionStats(testData)
 * console.log(stats)
 */

import { compressData, decompressData, getCompressionStats } from './storage'

/**
 * 测试基本压缩解压功能
 */
export function testCompressionDecompression() {
  const originalData = {
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

  // 压缩
  const compressed = compressData(originalData)
  console.log('压缩后的数据:', compressed)

  // 解压
  const decompressed = decompressData(compressed)
  console.log('解压后的数据:', decompressed)

  // 验证数据完整性
  const isEqual = JSON.stringify(originalData) === JSON.stringify(decompressed)
  console.log('数据完整性验证:', isEqual ? '✓ 通过' : '✗ 失败')

  return isEqual
}

/**
 * 测试压缩统计
 */
export function testCompressionStats() {
  const testData = {
    background: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920',
    categories: Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1),
      name: `分类 ${i + 1}`,
      cards: Array.from({ length: 10 }, (_, j) => ({
        id: String(i * 10 + j + 1),
        title: `网站 ${i * 10 + j + 1}`,
        url: `https://example${i * 10 + j + 1}.com`,
        icon: `https://example${i * 10 + j + 1}.com/favicon.ico`
      }))
    }))
  }

  const stats = getCompressionStats(testData)
  
  console.log('=== 压缩统计 ===')
  console.log(`原始大小: ${stats.original} 字节`)
  console.log(`压缩大小: ${stats.compressed} 字节`)
  console.log(`压缩率: ${stats.ratio}`)
  console.log(`节省空间: ${stats.saved} 字节`)

  return stats
}

/**
 * 测试向后兼容性
 */
export function testBackwardCompatibility() {
  // 旧格式的完整数据
  const oldFormat = {
    background: 'https://example.com/bg.jpg',
    categories: [
      {
        id: '1',
        name: '分类 1',
        cards: [
          {
            id: '1',
            title: '网站 1',
            url: 'https://example.com',
            icon: 'https://example.com/favicon.ico'
          }
        ]
      }
    ]
  }

  // 使用 decompressData 处理旧格式
  const result = decompressData(oldFormat)
  
  const isCompatible = JSON.stringify(oldFormat) === JSON.stringify(result)
  console.log('向后兼容性测试:', isCompatible ? '✓ 通过' : '✗ 失败')

  return isCompatible
}

/**
 * 测试自定义 icon 保留
 */
export function testCustomIconPreservation() {
  const dataWithCustomIcon = {
    background: 'https://example.com/bg.jpg',
    categories: [
      {
        id: '1',
        name: '分类 1',
        cards: [
          {
            id: '1',
            title: '网站 1',
            url: 'https://example.com',
            icon: 'https://custom-icon-service.com/icon?url=example.com'  // 自定义 icon
          },
          {
            id: '2',
            title: '网站 2',
            url: 'https://example2.com',
            icon: 'https://example2.com/favicon.ico'  // 标准 icon（应该被省略）
          }
        ]
      }
    ]
  }

  const compressed = compressData(dataWithCustomIcon)
  
  // 检查自定义 icon 是否被保留
  const hasCustomIcon = compressed.c[0].d[0].ic !== undefined
  const standardIconOmitted = compressed.c[0].d[1].ic === undefined

  console.log('自定义 icon 保留:', hasCustomIcon ? '✓ 通过' : '✗ 失败')
  console.log('标准 icon 省略:', standardIconOmitted ? '✓ 通过' : '✗ 失败')

  // 解压并验证恢复
  const decompressed = decompressData(compressed)
  const customIconRestored = decompressed.categories[0].cards[0].icon === 
    'https://custom-icon-service.com/icon?url=example.com'
  const standardIconGenerated = decompressed.categories[0].cards[1].icon === 
    'https://example2.com/favicon.ico'

  console.log('自定义 icon 恢复:', customIconRestored ? '✓ 通过' : '✗ 失败')
  console.log('标准 icon 自动生成:', standardIconGenerated ? '✓ 通过' : '✗ 失败')

  return hasCustomIcon && standardIconOmitted && customIconRestored && standardIconGenerated
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('=== 开始运行存储压缩测试 ===\n')

  console.log('--- 测试 1: 基本压缩解压 ---')
  const test1 = testCompressionDecompression()
  console.log()

  console.log('--- 测试 2: 压缩统计 ---')
  testCompressionStats()
  console.log()

  console.log('--- 测试 3: 向后兼容性 ---')
  const test3 = testBackwardCompatibility()
  console.log()

  console.log('--- 测试 4: 自定义 icon 保留 ---')
  const test4 = testCustomIconPreservation()
  console.log()

  console.log('=== 测试总结 ===')
  const allPassed = test1 && test3 && test4
  console.log(allPassed ? '✓ 所有测试通过' : '✗ 有测试失败')

  return allPassed
}
