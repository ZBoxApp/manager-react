const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const assetsPluginInstance = new AssetsPlugin({
    filename: 'path.json',
    processOutput: function (assets) {
        return 'module.exports = ' + JSON.stringify(assets);
    }
});
const HtmlWebpackPlugin = require('html-webpack-plugin');

const htmlExtract = new ExtractTextPlugin('html', 'index.html');
const Instancehtmlwebpackplugin = new HtmlWebpackPlugin({template: './src/index.html', inject: 'head'});

const NPM_TARGET = process.env.npm_lifecycle_event; //eslint-disable-line no-process-env

// Create a simple hash based on timestamp promp
const timestamp = new Date().getTime().toString();
const hash = timestamp.slice(-6, timestamp.length);

var DEV = false;
var FULLMAP = false;
if (NPM_TARGET === 'run' || NPM_TARGET === 'run-fullmap' || NPM_TARGET === 'deploy') {
    DEV = true;
    if (NPM_TARGET === 'run-fullmap') {
        FULLMAP = true;
    }
}

var config = {
    entry: ['babel-polyfill', './src/index.jsx'],
    output: {
        path: 'dist',
        publicPath: '/',
        filename: hash + 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                exclude: /(node_modules)/,
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                    plugins: ['transform-runtime'],
                    cacheDirectory: DEV
                }
            },
            {
                test: /\.json$/,
                loader: 'json'
            },
            {
                test: /(node_modules)\/.+\.(js|jsx)$/,
                loader: 'imports',
                query: {
                    $: 'jquery',
                    jQuery: 'jquery'
                }
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass']
            },
            {
                test: /\.css$/,
                loaders: ['style', 'css']
            },
            {
                test: /\.(png|eot|tiff|svg|woff2|woff|ttf|gif|mp3|jpg)$/,
                loader: 'file',
                query: {
                    name: 'files/[hash].[ext]'
                }
            }
        ]
    },
    plugins: [
        Instancehtmlwebpackplugin,
        assetsPluginInstance,
        new CopyWebpackPlugin([
            {from: 'src/config', to: 'config'}
        ]),
        new webpack.ProvidePlugin({
            'window.jQuery': 'jquery'
        }),
        htmlExtract,
        new webpack.LoaderOptionsPlugin({
            minimize: !DEV,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false }
        })
    ],
    resolve: {
        alias: {
            jquery: 'jquery/dist/jquery'
        },
        modules: [
            'node_modules',
            path.resolve(__dirname)
        ]
    },
    node: {
        fs: 'empty'
    }
};

// Development mode configuration
if (DEV) {
    if (FULLMAP) {
        config.devtool = 'source-map';
    } else {
        config.devtool = 'eval-cheap-module-source-map';
    }
}

// Production mode configuration
if (!DEV) {
    config.devtool = 'source-map';
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            'screw-ie8': true,
            mangle: {
                toplevel: false
            },
            compress: {
                warnings: false
            },
            comments: false
        })
    );
    config.plugins.push(
        new webpack.optimize.AggressiveMergingPlugin()
    );
    config.plugins.push(
        new webpack.optimize.OccurrenceOrderPlugin(true)
    );
    config.plugins.push(
        new webpack.optimize.DedupePlugin()
    );
    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        })
    );
}

module.exports = config;
