const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const WebpackStrip = require('strip-loader');

module.exports = merge(common,{
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: WebpackStrip.loader('console.log', 'console.trace'),
            },
        ],
    },
});