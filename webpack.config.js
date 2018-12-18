const path = require('path')
const mode = process.env.NODE_ENV

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
        test:/\.css$/,   
        use:["style-loader","css-loader"]
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