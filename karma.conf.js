module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    client: {
      captureConsole: true
    },
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/tv4/tv4.js',
      'bower_components/objectpath/lib/ObjectPath.js',
      'bower_components/angular-schema-form/dist/schema-form.js',
      'bower_components/angular-schema-form-bootstrap/bootstrap-decorator.js',
      'src/*.js',
      'src/**/*.js',
      'test/*.js'
    ],
    frameworks: ['jasmine'],
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-mocha-reporter'
    ],
    reporters: ['mocha'],
    singleRun: true
  });
};
