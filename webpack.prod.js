const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')


module.exports = merge(common, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('produciton'),
      'SERVICE_URL': JSON.stringify('http://127.0.0.1:8002')
    }),
  ],
  mode: 'production'
})
