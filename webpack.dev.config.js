import webpack from 'webpack';
import webpackStats from 'stats-webpack-plugin';
const HtmlWebpackPlugin = require('html-webpack-plugin')
import path from "path";
import configurator from './src/backend/config/configurator';
let config = configurator.get();

module.exports = {
  mode: "development",
  devtool: '#source-map',
  node: { 
    fs: 'empty',
    net: 'empty',
    module: 'empty'
   },
  entry: [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client?path=//localhost:' + config.port + '/__webpack_hmr&reload=true',
    './src/frontend/App.js'
  ],
  output: {
    path: '/',
    publicPath: 'http://localhost:' + config.port + '/',
    filename: 'scripts/bundle.js'
  },
  module: {
    rules: [
      { test: /\.jsx?$/, 
        loader: 'babel-loader', 
        exclude: /node_modules/,
        options: {
          babelrc: true
        }
      },
      { test: /\.css$/, loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]_[local]_[hash:base64:5]'},
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      {
            test: /\.(png|jp(e*)g)$/,
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
                        name: 'frontend/fonts/[path][name].[ext]'
                    }
                }
            ]            
        }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.template.html',
      inject: 'body'
    })
  ],
  resolve: {
    modules: ['node_modules', './src', './src/frontend/img'],
    extensions: [
      '.js',
      '.jsx',
      '.json',
      '.css',
      '.scss'
    ]
  },
  target: 'web'
};