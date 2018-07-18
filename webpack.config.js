module.exports = {
  entry: './lib/index.js',
  output: {
    path: __dirname,
    filename: './bin/index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
}
