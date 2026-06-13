import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import minimizerWebpackPlugin from 'minimizer-webpack-plugin';

export default {
  mode: 'production',
  entry: {
    main: './src/client/index.js',
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    path: path.resolve(__dirname, 'static'),
  },
   optimization: {
    minimize: true,
    minimizer: [new minimizerWebpackPlugin()],
  },
  plugins: [
    new HtmlWebpackPlugin({
      minify: true,
      favicon: './asset/favicon.png',
      template: './src/client/html/index.html',
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: /\.module\.css$/
              },
            },
          },
          'postcss-loader',
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        }
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },
};
