const withSass = require('@zeit/next-sass')

module.exports = {
    target: 'serverless',
    ...withSass({
        webpack(config, _) {
            config.module.rules.push({
                test: /\.md$/,
                use: "raw-loader"
            });
            return config;

        }
    }),
}