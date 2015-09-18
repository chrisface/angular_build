var gulp = require('gulp');
var debug = require('gulp-debug');
var del = require('del');

var webserver = require('gulp-webserver');
var watch = require('gulp-watch');
var mainBowerFiles = require('main-bower-files');
var concat = require('gulp-concat');
var bower = require('gulp-bower');
var livereload = require('gulp-livereload');
var cachebreaker = require('gulp-cache-breaker');
var eslint = require('gulp-eslint');
var sass = require('gulp-sass');

module.exports = function(gulp) {

  var config = {
    build_dir: './build/',
    buildCss_dir: './build/styles',
    files: {
      js: {
        app: ['src/**/*.js', '!src/**/*.spec.js'],
        spec: 'src/**/*.spec.js',
        test: [
          'build/vendor-spec.js',
          'build/templates.js',
          'src/**/*.js',
          'src/**/*.spec.js'
        ]
      },
      static_assets: {
        app: [
          'src/assets/**/*'
        ]
      },
      static_files: {
        app: [
          'src/**/*.html',
          '!src/**/*.tpl.html',
          'src/**/*.json'
        ]
      },
      css : {
        app: 'src/**/*.scss'
      }
    }
  };

  gulp.task('webserver', ['angular-build', 'watch'], function() {
    gulp.src('build')
      .pipe(webserver({
        host: '0.0.0.0',
        port: 8000
      }));
  });

  gulp.task('angular-build', [
    'build-vendor', 'build-app-js', 'build-app-static-assets', 'build-app-static-files', 'build-app-sass', 'build-vendor-css'
    ], function() {

  });

  gulp.task('angular-build-spec', [
    'build-vendor-spec', 'build-app-js', 'build-app-static-assets', 'build-app-static-files', 'build-app-sass'
    ], function() {

  });

  gulp.task('watch', function() {
    watch(config.files.js.app, {
      verbose: true
    },
    function(vinyl) {
      buildApplicationJavascript();
    });

    watch(config.files.css.app, {
      verbose: true
    },
    function(vinyl) {
      buildApplicationCSS();
    });

    watch(config.files.static_assets.app, {
      verbose: true
    },
    function(vinyl) {
      buildApplicationStaticAssets();
    });

    watch(config.files.static_files.app, {
      verbose: true
    },
    function(vinyl) {
      buildApplicationStaticFiles();
    });

    livereload.listen({
      quiet: true
    });
  });

  function buildApplicationJavascript() {
    var stream = gulp.src(config.files.js.app)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(concat('application.js'))
      .pipe(gulp.dest(config.build_dir))
      .pipe(livereload());
    return stream;
  }

  gulp.task('build-app-js', function() {
    return buildApplicationJavascript();
  });

  function buildApplicationStaticFiles () {
    var stream = gulp.src(config.files.static_files.app)
      .pipe(gulp.dest(config.build_dir))
      .pipe(cachebreaker(config.build_dir))
      .pipe(gulp.dest(config.build_dir))
      .pipe(livereload());
    return stream;
  }

  gulp.task('build-app-static-files', function() {
    return buildApplicationStaticFiles();
  });

  function buildApplicationStaticAssets () {
    var stream = gulp.src(config.files.static_assets.app)
      .pipe(gulp.dest(config.build_dir + 'assets/'))
      .pipe(livereload());
    return stream;
  }

  gulp.task('build-app-static-assets', function() {
    return buildApplicationStaticAssets();
  });

  function buildApplicationCSS() {
    var stream = gulp.src(config.files.css.app)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulp.dest(config.build_dir))
    .pipe(livereload());
    return stream;
  }

  gulp.task('build-app-sass', function() {
    return buildApplicationCSS();
  });

  gulp.task('build-vendor', function() {
    var stream = gulp.src(mainBowerFiles({filter: '**/*.js'}))
        .pipe(debug({title: 'Vendor Files (JS):'}))
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(config.build_dir))
        .pipe(livereload());
    return stream;
  });

  gulp.task('build-vendor-css', function() {
    var stream = gulp.src(mainBowerFiles({filter: '**/*.css'}))
        .pipe(debug({title: 'Vendor Files (CSS):'}))
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(config.buildCss_dir))
        .pipe(livereload());
    return stream;
  });

  gulp.task('build-vendor-spec', function() {
    var stream = gulp.src(mainBowerFiles({filter: '**/*.js', includeDev: true}))
      .pipe(debug({title: 'Vendor Files:'}))
      .pipe(concat('vendor-spec.js'))
      .pipe(gulp.dest(config.build_dir))
      .pipe(livereload());
    return stream;
  });

  gulp.task('bower', function() {
    bower();
  });

  gulp.task('clean', function(cb) {
    del([config.build_dir], cb);
  });

  return {
    livereload: livereload
  }
};
