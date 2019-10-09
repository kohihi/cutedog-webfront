const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: {
    main: './src/main.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      title: '汪喵贴图板',
      meta: {
        description: '网站的主题是阿猫阿狗与其他可爱动物的图片。',
        keywords: '汪喵贴图板,wangmiao,汪喵,萌宠,猫,狗,匿名版,匿名论坛,汪,喵,宠物,动物,搞笑,摸鱼,gif图',
        charset: 'UTF-8',
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes'
      },
      hash: true,
      favicon: './src/favicon.ico'
    }),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(ttf|woff|woff2)$/,
        use: [
          'file-loader',
        ]
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // 用 webpack 1 时需用 'vue/dist/vue.common.js'
    }
  }
};
