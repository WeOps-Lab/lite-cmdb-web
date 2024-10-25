import withAntdLess from 'next-plugin-antd-less';

export default withAntdLess({
  reactStrictMode: false, 
  async rewrites() {
    return [
      {
        source: '/reqApi/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*/`, // 代理到后台服务器
      },
    ];
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
});
