/* global __dirname, require, module */

// eslint-disable-next-line no-unused-vars
const webpack = require('webpack');
const path = require('path');
const { env } = require('yargs').argv; // use --env with webpack 2
const pkg = require('./package.json');

const libraryName = pkg.name;

let outputFile; let
  mode;

if (env === 'build') {
  mode = 'production';
  outputFile = `${libraryName}.min.js`;
} else {
  mode = 'development';
  outputFile = `${libraryName}.js`;
}

const config = {
  mode,
  entry: `${__dirname}/src/index.js`,
  // open devtool only when debug
  // it will increase lib size
  // devtool: 'inline-source-map',
  output: {
    path: `${__dirname}/dist`,
    filename: outputFile,
    // library: libraryName,
    library: 'listen1Api',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules|src/,
      },
    ],
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.json', '.js'],
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  externals: {
    // request not working with browser, so we exclude it from bundle
    request: 'request',
    electron: 'electron',
  },
};

module.exports = config;
