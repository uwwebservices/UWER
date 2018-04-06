const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "production",
  devtool: '#source-map',
  node: { 
    fs: 'empty',
    net: 'empty',
    module: 'empty'
   },
  entry: './src/frontend/App.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
  module: {
    rules: [
      { test: /\.jsx?$/, 
        loader: 'babel-loader', 
        exclude: /node_modules/,
        options: {
          babelrc: true
        }
      },
      { test: /\.css$/, loader: 'style-loader!css-loader'},
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      {
        test: /\.(png|jp(e*)g)$/,
        use: [{
            loader: 'url-loader',
            options: {
                limit: 8000, // Convert images < 8kb to base64 strings
                name: 'img/[hash]-[name].[ext]'
            }
        }]
      },
      {
        test: /\.svg$/,
        use: [
            {
                loader: 'file-loader',
                options: {
                    name: 'img/[hash]-[name].[ext]'
                }
            }
        ]            
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
            {
                loader: 'file-loader',
                options: {
                    name: 'fonts/[hash]-[name].[ext]'
                }
            }
        ]            
      }
    ]
  },
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