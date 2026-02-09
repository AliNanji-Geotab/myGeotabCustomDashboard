const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.jsx',
    output: {
      filename: 'dashboard.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      library: {
        type: 'umd'
      }
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]'
          }
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]'
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'dashboard.html',
        inject: 'body'
      }),
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'dashboard.css'
        }),
        new CopyWebpackPlugin({
          patterns: [
            { from: 'config.json', to: 'config.json' }
          ]
        })
      ] : [])
    ],
    resolve: {
      extensions: ['.js', '.jsx']
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      port: 9000,
      hot: true,
      open: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};
