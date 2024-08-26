import withAntdLess from 'next-plugin-antd-less';

export default withAntdLess({
  reactStrictMode: false, 
  async rewrites() {
    return [
      {
        source: '/reqApi/:path*',
        destination: 'http://10.10.40.117:8000/:path*/', // 代理到后台服务器
      },
    ];
  },
  webpack(config) {
    return config;
  },
});
