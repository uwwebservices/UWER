const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

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
    path: path.resolve(__dirname + '/dist/'),
    publicPath: '/',
    filename: 'assets/bundle.js'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  module: {
    rules: [
      { test: /\.jsx?$/, 
        loader: 'babel-loader', 
        exclude: /node_modules/, 
        query: { presets:['react']}
      },
      { test: /\.css$/, 
        use: [ MiniCssExtractPlugin.loader, "css-loader?modules&importLoaders=1&localIdentName=[name]_[local]_[hash:base64:5]"],
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
                  name: 'assets/img/[hash]-[name].[ext]'
              }
          }]
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
            {
                loader: 'file-loader',
                options: {
                    name: 'assets/fonts/[name].[ext]'
                }
            }
        ]            
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "assets/[name].css",
      chunkFilename: "assets/[id].css"
    }),
    new HtmlWebpackPlugin({
      template: './src/index.template.html',
      inject: 'body',
      filename: 'index.html'
    })
  ],
  resolve: {
    modules: ['node_modules'],
    alias: {
      "Components": path.resolve("./src/frontend/Components"),
      "Containers": path.resolve("./src/frontend/Containers"),
      "css": path.resolve("./src/frontend/css")
    },
    extensions: ['.js', '.jsx', '.json', '.css', '.scss']
  },
  target: 'web'
};