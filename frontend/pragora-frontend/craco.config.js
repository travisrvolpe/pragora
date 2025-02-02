module.exports = {
  babel: {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript'
    ],
    plugins: ['@babel/plugin-transform-runtime']
  },
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.(ts|tsx|js|jsx)$/,
            exclude: /node_modules\/(?!(tailwind-merge)\/).*/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  '@babel/preset-react',
                  '@babel/preset-typescript'
                ]
              }
            }
          }
        ]
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js']
      }
    }
  }
};