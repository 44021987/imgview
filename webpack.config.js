const path = require('path')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const mode = process.env.NODE_ENV
// 是否为开发环境
// const isDev = process.env.NODE_ENV === 'development'
module.exports = {
  entry: {
    imgview: './src/imgview.js'
  },
  mode,
  output: {
    libraryTarget: "umd",
    filename: '[name].min.js',
    chunkFilename: '[name].min.js',
    path: path.resolve(__dirname, 'demo')
  },
  // optimization: {
  //   minimizer: [
  //     new UglifyJsPlugin({
  //       uglifyOptions: {
  //         ecma: 5,
  //         // 其它优化选项 https://segmentfault.com/a/1190000010874406
  //         warnings: false,
  //         compress: {
  //           drop_console: true,
  //           drop_debugger: true,
  //           // 生产环境,如果是非debug包删除所有的console
  //           pure_funcs: [!isDev ? 'console.log' : '']
  //         }
  //       },
  //       cache: false, // 启动缓存
  //       sourceMap: false,
  //       parallel: 4 // 启用多进程并行运行
  //     })
  //   ]
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 81920
            }
          }
        ]
      }
    ]
  }
}