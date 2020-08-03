const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');


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
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
    ]
};