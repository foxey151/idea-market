import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { documentType, content } = await request.json()
    
    if (!documentType || !content) {
      return NextResponse.json(
        { error: 'Document type and content are required' },
        { status: 400 }
      )
    }

    // ファイルパスの決定
    let filePath: string
    let pageTitle: string
    
    switch (documentType) {
      case 'terms':
        filePath = join(process.cwd(), 'app', 'terms', 'page.tsx')
        pageTitle = '利用規約'
        break
      case 'privacy':
        filePath = join(process.cwd(), 'app', 'privacy', 'page.tsx')
        pageTitle = 'プライバシーポリシー'
        break
      case 'commerce':
        filePath = join(process.cwd(), 'app', 'commerce', 'page.tsx')
        pageTitle = '特定商取引法に基づく表記'
        break
      case 'company':
        filePath = join(process.cwd(), 'app', 'company', 'page.tsx')
        pageTitle = '会社情報'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid document type' },
          { status: 400 }
        )
    }

    // コンテンツをセクションに分割してHTMLを生成
    const sections = content.split('\n\n').filter((section: string) => section.trim())
    let sectionsHTML = ''
    
    for (let i = 0; i < sections.length; i += 2) {
      const heading = sections[i]?.trim()
      const contentText = sections[i + 1]?.trim()
      
      if (heading && contentText) {
        sectionsHTML += `              <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">${heading}</h2>
                <p>
                  ${contentText}
                </p>
              </section>

`
      }
    }

    // ページファイルの内容を生成
    const pageContent = `export default function ${getComponentName(documentType)}Page() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">${pageTitle}</h1>
            
            <div className="space-y-6 text-gray-700">
${sectionsHTML}              <div className="mt-8 text-right text-sm text-gray-500">
                制定日：2024年1月1日<br />
                最終更新日：${new Date().toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}`

    // ファイルに書き込み
    await writeFile(filePath, pageContent, 'utf8')
    
    return NextResponse.json({ 
      success: true, 
      message: `${pageTitle}を更新しました。`
    })
    
  } catch (error) {
    console.error('文書保存エラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getComponentName(documentType: string): string {
  switch (documentType) {
    case 'terms':
      return 'Terms'
    case 'privacy':
      return 'PrivacyPolicy'
    case 'commerce':
      return 'CommerceLaw'
    case 'company':
      return 'CompanyInfo'
    default:
      return 'Document'
  }
}
