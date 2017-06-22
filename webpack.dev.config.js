var webpack = require('webpack');
var webpackStats = require('stats-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require("path");
var config = require('./src/config/config.json');

module.exports = {
  devtool: '#source-map',
  node: { 
    fs: 'empty',
    net: 'empty',
    module: 'empty'
   },
  entry: [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client?path=//localhost:' + config.port + '/__webpack_hmr&reload=true',
    './src/frontend/js/app.js'
  ],
  output: {
    path: '/',
    publicPath: 'http://localhost:' + config.port + '/',
    filename: 'scripts/bundle.js'
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader', exclude: /node_modules/ },
      { test: /\.jsx?$/, 
        loader: 'babel-loader', 
        exclude: /node_modules/, 
        query: { presets:['react']}
      },
      { test: /\.css$/, loader: 'style-loader!css-loader'},
      { test: /\.scss$/,loader: 'style-loader!css-loader!sass-loader'}
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpackStats('webpack.json'),
    new ExtractTextPlugin("styles/styles.css")
  ],
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.css'
    ]
  },
  target: 'web'
};