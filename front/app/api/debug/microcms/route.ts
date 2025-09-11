import { NextRequest, NextResponse } from 'next/server';
import { validateMicroCMSConfig, testMicroCMSConnection } from '@/lib/microcms';

export async function GET(_request: NextRequest) {
  try {
    // 設定の検証
    const configValidation = validateMicroCMSConfig();

    if (!configValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          step: 'config_validation',
          errors: configValidation.errors,
          config: configValidation.config,
        },
        { status: 400 }
      );
    }

    // 接続テスト
    const connectionTest = await testMicroCMSConnection();

    return NextResponse.json({
      success: connectionTest.success,
      step: 'connection_test',
      config: configValidation.config,
      connectionResult: connectionTest,
    });
  } catch (error: any) {
    console.error('microCMSデバッグAPI エラー:', error);

    return NextResponse.json(
      {
        success: false,
        step: 'api_execution',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
