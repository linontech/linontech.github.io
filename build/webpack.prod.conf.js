
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const devWebpackConfig = merge(baseWebpackConfig, {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, '../src/'), // to store all output files (absolute) at /dist/
        publicPath: '/blog/', //  where your upload bundle files
        filename: '[name].[chunkhash].js'
    },
    plugins: [
        // new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: './_includes/scripts.html',
            template: './src/_includes/_scripts.html'
        }),
        new VueLoaderPlugin()
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: 'initial',
                    test: path.resolve(__dirname, '../node_modules'),
                    name: 'vendor',
                    enforce: true
                }
            }
        }
    },
});

module.exports = devWebpackConfig;
