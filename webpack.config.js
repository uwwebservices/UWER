const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  mode: 'production',
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
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:5]'
              }
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jp(e*)g)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8000, // Convert images < 8kb to base64 strings
              name: 'assets/img/[hash]-[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        exclude: [path.resolve(__dirname, 'src/frontend/images')],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/fonts/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        include: [path.resolve(__dirname, 'src/frontend/images')],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/img/[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/[name].css',
      chunkFilename: 'assets/[id].css'
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
      Components: path.resolve('./src/frontend/Components'),
      Containers: path.resolve('./src/frontend/Containers'),
      css: path.resolve('./src/frontend/css'),
      Images: path.resolve('./src/frontend/images'),
      Assets: path.resolve('./src/backend/assets'),
      Routes: path.resolve('./src/backend/routes')
    },
    extensions: ['.js', '.jsx', '.json', '.css', '.scss']
  },
  target: 'web'
};
