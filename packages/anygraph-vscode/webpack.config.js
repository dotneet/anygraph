const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return [
    // Extension configuration
    {
      name: 'extension',
      target: 'node',
      mode: isProduction ? 'production' : 'development',
      entry: './src/extension.ts',
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        clean: false,
      },
      externals: {
        vscode: 'commonjs vscode',
      },
      resolve: {
        extensions: ['.ts', '.js'],
        alias: {
          '@': path.resolve(__dirname, 'src'),
        },
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                },
              },
            ],
          },
        ],
      },
      devtool: isProduction ? 'source-map' : 'eval-source-map',
      optimization: {
        minimize: isProduction,
      },
    },
    // Webview configuration
    {
      name: 'webview',
      target: 'web',
      mode: isProduction ? 'production' : 'development',
      entry: './src/webview/index.ts',
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'webview.js',
        clean: false,
      },
      resolve: {
        extensions: ['.ts', '.js'],
        alias: {
          '@': path.resolve(__dirname, 'src'),
        },
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                },
              },
            ],
          },
        ],
      },
      devtool: isProduction ? 'source-map' : 'eval-source-map',
      optimization: {
        minimize: isProduction,
      },
    },
  ];
};