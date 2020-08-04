const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MinifyHtmlWebpackPlugin = require('minify-html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');



module.exports = {
    mode: 'development',
    devtool: 'false', // Disable default "eval" due to browser restrictions
    entry: {
        background: './src/js/controllers/background/backgroundController.js',
        content: './src/js/controllers/content/contentController.js',
        'content.frameInjector': './src/js/controllers/content.frameInjector/frameInjectorController.js',
        options: './src/js/controllers/options/optionsController.js',
        popup: './src/js/controllers/popupController.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/js'),
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].css',
                            outputPath: '../css/', // Relative to /js folder, because that's where it's imported
                        },
                    },
                    {
                        loader: 'sass-loader',
                    }
                ],
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        /*
        new MinifyHtmlWebpackPlugin({
            src: './src/html',
            dest: './dist/html',
            rules: {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
                minifyJS: true,
            },
        }),
        */
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './src/manifest.json'),
                    to: path.resolve(__dirname, './dist'),
                },
                {
                    from: '*',
                    to: path.resolve(__dirname, './dist/img'),
                    context: 'src/img/used',
                },
                {
                    from: 'fonts/**/*',
                    to: path.resolve(__dirname, './dist/fonts'),
                    context: 'src/',
                },
            ],
        }),
    ]
};