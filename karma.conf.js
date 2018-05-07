// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular/cli/plugins/karma'),
      require('karma-script-launcher'),
      require('karma-electron')
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      useIframe: false
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    preprocessors: {
      '**/*.js': ['electron']
    },
    browsers: ['CustomElectron'],
    customLaunchers: {
      Chrome_no_sandbox: {
        base: 'Chrome', flags: ['--no-sandbox']
      },
      CustomElectron: {
        base: 'Electron', flags: ['./src/electron.dev', '--no-sandbox']
      }
    },
    singleRun: false
  });
};
