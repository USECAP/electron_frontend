const common = {
  mode: 'development',
  target: 'node'
};

const backend = {
  entry: './src/server.js',
  output: {
    filename: 'server.js',
    library: 'server',
    libraryTarget: 'umd'
  },
  externals: {
    ws: {
      commonjs: 'ws',
      commonjs2: 'ws'
    }
  },
  module: {
    noParse: [/ws/]
  }
};

const tests = {
  entry: './test/test.js',
  output: {filename: 'test.js'},
  module: {
    noParse: [/ws/]
  }
};

module.exports = [
  Object.assign({}, common, backend),
  Object.assign({}, common, tests)
];
