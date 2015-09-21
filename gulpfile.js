var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browserSync = require('browser-sync').create();

var globs = {
    static: [
        'public/src/*.html',
        'public/src/js/**/*',
        'public/src/img/**/*',
        'public/src/fonts/**/*'
    ],
    scss: [
        'public/src/scss/**/*.scss'
    ]
};

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

gulp.task('static', function() {
    gulp.src(globs.static, {base: 'public/src/'})
        .pipe(gulp.dest('public/dist'));
});

gulp.task('styles', function() {
    gulp.src(globs.scss)
        .pipe($.plumber({
            errorHandler: handleError
        }))
        .pipe($.compass({
            config_file: 'config.rb',
            css: 'public/dist/css',
            sass: 'public/src/scss'
        }))
        .pipe(gulp.dest('public/dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('sync', function() {
    browserSync.init({
        proxy: 'localhost:8888'
    });
});

gulp.task('server', function() {
    $.nodemon({
        script: 'index.js',
        ignore: [
            'public/**/*'
        ]
    })
});

gulp.task('clean', function(cb) {
    del(['public/dist/**/*'], {
        force: true
    }, cb);
});

gulp.task('watch', function() {
    gulp.watch(globs.static, ['static']).on('change', browserSync.reload);
    gulp.watch(globs.scss, ['styles']);
});

gulp.task('default', $.sequence('clean', ['styles', 'static'], 'server', 'watch', 'sync'));
