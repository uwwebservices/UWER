import webpack from 'webpack';
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path');
import config from 'config/config.json';

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
    path: path.resolve(__dirname + '/src/frontend'),
    publicPath: '/',
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
      inject: 'body',
      filename: 'index.html'
    })
  ],
  resolve: {
    modules: ['node_modules'],
    alias: {
      "Components": path.resolve("./src/frontend/Components"),
      "Containers": path.resolve("./src/frontend/Containers"),
      "css": path.resolve("./src/frontend/css"),
      "Assets": path.resolve("./src/assets"),
      "Routes": path.resolve("./src/routes")
    },
    extensions: ['.js', '.jsx', '.json', '.css', '.scss']
  },
  target: 'web'
};