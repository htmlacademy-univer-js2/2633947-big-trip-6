const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',

  output: {
    filename: 'bundle.[contenthash].js',  // добавляем хэш в имя файла
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },

  plugins: [
    // HTML плагин для генерации index.html
    new HtmlWebpackPlugin({
      template: './public/index.html',  // используем существующий HTML как шаблон
      filename: 'index.html',           // имя выходного файла
      inject: 'body',                   // вставляем скрипт в body
    }),

    // Copy плагин копирует статические файлы
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          // исключаем index.html, так как его будет генерировать HtmlWebpackPlugin
          globOptions: {
            ignore: ['**/index.html']
          },
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
};
