import { NextRequest, NextResponse } from 'next/server';
import { validateMicroCMSConfig, testMicroCMSConnection } from '@/lib/microcms';

export async function GET(_request: NextRequest) {
  try {
    // 環境変数の詳細チェック
    const envDetails = {
      serviceDomain: {
        value: process.env.MICROCMS_SERVICE_DOMAIN,
        isSet: !!process.env.MICROCMS_SERVICE_DOMAIN,
        hasValidFormat: process.env.MICROCMS_SERVICE_DOMAIN && !process.env.MICROCMS_SERVICE_DOMAIN.includes('.'),
      },
      apiKey: {
        isSet: !!process.env.MICROCMS_API_KEY,
        length: process.env.MICROCMS_API_KEY?.length || 0,
        prefix: process.env.MICROCMS_API_KEY ? process.env.MICROCMS_API_KEY.substring(0, 8) + '...' : null,
        hasValidLength: (process.env.MICROCMS_API_KEY?.length || 0) >= 20,
      },
      nodeEnv: process.env.NODE_ENV,
      isServer: typeof window === 'undefined',
    };

    // 設定の検証
    const configValidation = validateMicroCMSConfig();

    const response = {
      success: configValidation.isValid,
      step: 'config_validation',
      envDetails,
      validation: configValidation,
      troubleshooting: {
        commonIssues: [
          'MICROCMS_SERVICE_DOMAIN が設定されていない',
          'MICROCMS_SERVICE_DOMAIN に "https://" や ".microcms.io" が含まれている',
          'MICROCMS_API_KEY が設定されていない、または短すぎる',
          'microCMSで必要なAPI（blogs, categories, authors）が作成されていない',
        ],
        envSetupInstructions: {
          serviceDomain: 'MICROCMS_SERVICE_DOMAIN=your-service-name（ドメイン名のみ）',
          apiKey: 'MICROCMS_API_KEY=your-32-character-api-key',
          location: '.env.local ファイルに設定してください',
        },
      },
    };

    if (!configValidation.isValid) {
      return NextResponse.json(response, { status: 400 });
    }

    // 接続テスト
    const connectionTest = await testMicroCMSConnection();
    
    return NextResponse.json({
      ...response,
      step: 'connection_test',
      connectionResult: connectionTest,
      nextSteps: connectionTest.success 
        ? ['microCMSの設定は正常です！']
        : [
            'microCMSの管理画面でAPIキーを確認してください',
            'サービスドメインが正しいか確認してください', 
            'blogs, categories, authorsのAPIが作成されているか確認してください',
          ],
    });
  } catch (error: any) {
    console.error('microCMSデバッグAPI エラー:', error);

    return NextResponse.json(
      {
        success: false,
        step: 'api_execution',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        troubleshooting: {
          suggestion: 'サーバーログも確認してください',
          commonCauses: [
            '環境変数が正しく設定されていない',
            'microCMSのAPIエンドポイントが存在しない',
            'APIキーの権限が不足している',
          ],
        },
      },
      { status: 500 }
    );
  }
}
