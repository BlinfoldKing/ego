const withSass = require('@zeit/next-sass');
const withCSS = require('@zeit/next-css');
const withFonts = require('next-fonts');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const webpack = require('webpack');

module.exports = {
  target: 'server',
  ...withBundleAnalyzer(
    withFonts(
      withCSS(
        withSass({
          enableSvg: true,
          // eslint-disable-next-line no-unused-vars
          webpack(_config, opts) {
            const config = _config;
            if (!opts.isServer) {
              config.node = {
                fs: 'empty',
              };
            }
            config.module.rules.push({
              test: /\.md$/,
              use: 'raw-loader',
            });

            config.module.rules.push({
              test: /\.(png|woff|woff2|eot|ttf|svg)$/,
              loader: 'url-loader?limit=100000',
            });

            // config.plugins.push(new FlowWebpackPlugin());
            config.plugins.push(new webpack.IgnorePlugin(/\.flow$/));
            return config;
          },
        }),
      ),
    ),
  ),

  env: {
    dev: process.env.NODE_ENV !== 'production',
    apiUrl: process.env.API_URL,
    baseUrl: process.env.BASE_URL,
  },
};
