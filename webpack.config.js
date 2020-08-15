const path = require('path')
const webpack = require('webpack') // npm install webpack 
                                    //npm install webpack-cli 

module.exports = {
  entry: './frontend-js/main.js',
  output: {
    filename: 'main-bundled.js',
    path: path.resolve(__dirname, 'public')
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', //npm install babel-loader
          options: {
            presets: ['@babel/preset-env'] // npm install @babel/preset-env
          }
        }
      }
    ]
  }
}