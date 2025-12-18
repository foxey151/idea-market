import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 警告を無視してビルドを続行
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Supabaseとモジュール解決の問題を解決
  webpack: (config, { isServer, nextRuntime }) => {
    // Edge Runtimeの場合は特別な処理
    if (nextRuntime === 'edge') {
      return config;
    }
    
    // サーバーサイドでのみ適用
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@supabase/supabase-js': '@supabase/supabase-js',
        '@supabase/ssr': '@supabase/ssr',
      });
    }
    
    // モジュール解決の設定
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    return config;
  },
  // TypeScript設定の無視（React 19対応）
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
