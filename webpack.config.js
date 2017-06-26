import webpack from 'webpack';
import ExtractTextPlugin from "extract-text-webpack-plugin";
import path from "path";

module.exports = {
  devtool: '#source-map',
  node: { 
    fs: 'empty',
    net: 'empty',
    module: 'empty'
   },
  entry: './src/frontend/js/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
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
      { test: /\.css$/, 
        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }), 
        exclude: /node_modules/ },
      { test: /\.scss$/, 
        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }), 
        exclude: /node_modules/ }
    ]
  },
  plugins: [
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