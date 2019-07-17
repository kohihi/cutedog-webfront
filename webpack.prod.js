const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')


module.exports = merge(common, {
  plugins: [
    new webpack.DefinePlugin({
      'SERVICE_URL': JSON.stringify('http://api.wangmiao.me')
    }),
  ],
  mode: 'production'
})
