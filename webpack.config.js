const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
    path: __dirname + '/dist/assets',
    filename: 'index_bundle.js'
  },
  module: {
    rules: [
      { test: /\.jsx?$/, 
        loader: 'babel-loader', 
        exclude: /node_modules/, 
        query: { presets:['react']}
      },
      { test: /\.css$/, 
        use: [ MiniCssExtractPlugin.loader, "css-loader"],
        exclude: /node_modules/ },
      { test: /\.scss$/, 
        use: [ MiniCssExtractPlugin.loader, "css-loader", 'sass-loader'],
        exclude: /node_modules/
        },
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
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          use: [
              {
                  loader: 'file-loader',
                  options: {
                      name: 'fonts/[name].[ext]'
                  }
              }
          ]            
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new HtmlWebpackPlugin()
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