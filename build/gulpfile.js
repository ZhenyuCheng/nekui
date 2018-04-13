const gulp = require('gulp');

const webpack = require('webpack-stream');
const webpackConfig = require('../build/webpack.config');
const rimraf = require('rimraf');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const ignore = require('gulp-ignore');
const minifycss = require('gulp-clean-css');
const sequence = require('run-sequence');
const all = require('gulp-all');
// const mcss = require('gulp_mcss');
const glob = require('glob');
const path = require('path');
const Hexo = require('hexo');
const fs = require('fs');
const argv = require('yargs').argv;
const doc = require('../doc/source/doc');
// const themes = require('../src/mcss/themes');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');

const browserSync = require('browser-sync').create();

const reload = browserSync.reload;

const postcssConfig = require('../build/postcss.config');

gulp.task('dist-clean', (cb) => {
  rimraf('{dist,doc/public}', () => {
    rimraf('doc/source/components/*_.md', cb);
  });
});

gulp.task('dist-copy', () => all(
    gulp.src(path.join(__dirname, '../src/fonts/**')).pipe(gulp.dest(path.join(__dirname, '../dist/fonts'))),
    gulp.src([
      path.join(__dirname, '../node_modules/regularjs/dist/regular.min.js'),
      path.join(__dirname, '../node_modules/regularjs/dist/regular.js'),
    ]).pipe(gulp.dest(path.join(__dirname, '../dist/vendor')))));

gulp.task('dist-js', () => gulp.src(path.join(__dirname, '../src/js/index.js'))
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(path.join(__dirname, '../dist/js')))
    .pipe(ignore.exclude('*.js.map'))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(uglify())
    .pipe(gulp.dest(path.join(__dirname, '../dist/js'))));

// gulp.task('dist-css', () => {
//   const gulpCSS = function (theme) {
//     return gulp.src(`./src/mcss/${theme}.mcss`)
//       .pipe(mcss({
//         pathes: ['./node_modules'],
//         importCSS: true,
//       }))
//       .pipe(postcss(postcssConfig.plugins))
//       .pipe(rename(`nek-ui.${theme}.css`))
//       .pipe(gulp.dest('./dist/css'))
//       .pipe(rename({
//         suffix: '.min',
//       }))
//       .pipe(minifycss())
//       .pipe(gulp.dest('./dist/css'));
//   };

//   return all(themes.map(gulpCSS));
// });

gulp.task('dist-css', () => {
  gulp.src(path.join(__dirname, '../src/scss/index.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postcssConfig.plugins))
        .pipe(rename('nek-ui.default.css'))
        .pipe(gulp.dest(path.join(__dirname, '../dist/css')))
        .pipe(rename({
          suffix: '.min',
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(path.join(__dirname, '../dist/css')));
});

gulp.task('gen-mcss', (cb) => {
  glob(path.join(__dirname, '../src/js/components/**/**/*.scss'), (er, files) => {
    let out = '';
    files.forEach((d) => {
      out += `@import "${d}";\n`;
    });
    fs.writeFileSync(path.join(__dirname, '../src/scss/components.scss'), out);
    cb();
  });
});

gulp.task('gen-doc', (cb) => {
  const hexo = new Hexo(path.join(__dirname, 'doc'), {
    dev: argv.dev,
  });
  hexo.extend.filter.register('after_post_render', (data) => {
    let md = data.content;
    md = md.replace(/<!-- demo_start -->/gim, '<div class="grid-item" markdown="1">');
    md = md.replace(/<!-- demo_end -->/gim, '</div>');
    data.content = md;
    return data;
  });

  doc(argv.dev, () => {
    hexo.init().then(() => {
      const option = argv.dev ? {
        watch: true,
      } : {};
      hexo.call('generate', option, cb);
    });
  });
});

gulp.task('gen-easy-doc', (cb) => {
  doc(argv.dev, cb);
});

gulp.task('dist', (done) => {
  sequence('dist-clean', ['dist-copy', 'gen-mcss', 'dist-js', 'dist-css'], done);
});

gulp.task('reload', () => {
  reload();
});

gulp.task('default', (done) => {
  sequence('dist', 'gen-doc', 'reload', done);
});

gulp.task('default-doc', (done) => {
  sequence('gen-doc', 'reload', done);
});

gulp.task('easy-doc', (done) => {
  sequence('gen-easy-doc', 'reload', done);
});

gulp.task('server', ['default'], () => {
  browserSync.init({
    server: {
      baseDir: ['../doc/public', '../dist'],
    },
    browser: 'default',
    ghostMode: false,
    reloadDelay: 1000,
    cors: true,
    port: 8089,
  });
});

gulp.task('watch', ['server'], () => {
  gulp.watch(['../src/**/*'], ['default']);
});

gulp.task('watch-doc', ['server'], () => {
  gulp.watch(['../src/**/*', '../doc/source/partials/**/*'], ['easy-doc']);
});

/* 把v0.5版本的文档copy到pulic目录下 */
gulp.task('copy-oldDoc', () => gulp.src(path.join(__dirname, '../doc/v0.5/**')).pipe(gulp.dest(path.join(__dirname, '../doc/public/v0.5'))));