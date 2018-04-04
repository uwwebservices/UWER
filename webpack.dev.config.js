import webpack from 'webpack';
import webpackStats from 'stats-webpack-plugin';
import ExtractTextPlugin from "extract-text-webpack-plugin";
import path from "path";
import configurator from './src/config/configurator';
let config = configurator.get();

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
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      {
            test: /\.(png|jp(e*)g|svg)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8000, // Convert images < 8kb to base64 strings
                    name: 'frontend/img/[hash]-[name].[ext]'
                }
            }]
        },
        {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]'
                    }
                }
            ]            
        }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.css',
      '.scss'
    ]
  },
  target: 'web'
};