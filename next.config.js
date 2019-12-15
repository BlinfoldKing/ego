const withSass = require('@zeit/next-sass')

module.exports = {
    target: 'serverless',
    ...withSass({
        webpack(config, _) {
            config.module.rules.push({
                test: /\.md$/,
                use: "raw-loader"
            });

            config.module.rules.push({
                test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000'
            })
            return config;
        }
    }),
}