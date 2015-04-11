var gulp = require('gulp'),
    compass = require('gulp-for-compass'),
    livereload = require('gulp-livereload'),
    config = {
        cssDir: 'public/css/',
        scssDir: 'public/css/scss/',
        fontsDir: 'public/fonts/',
        jsDir: 'public/js/'
    };

gulp.task('css', function () {
    return gulp.src(config.scssDir + '**/*.scss')
        .pipe(compass({
            sassDir: config.scssDir,
            cssDir: config.cssDir,
            fontsDir: config.fontsDir,
            httpFontsDir: 'fonts',
            force: true,
            //sourcemap: true
        }))
        .pipe(livereload());
});

gulp.task('js', function () {
    return gulp.src([config.jsDir + '**/*.js'])
        .pipe(livereload())
});

gulp.task('html', function () {
    return gulp.src(['public/**/*.html'])
        .pipe(livereload())
});

gulp.task('watch', function () {
    livereload.listen({
        port: 35729
    });
    gulp.watch('public/**/*.html', ['html']);
    gulp.watch(config.scssDir + '**/*.scss', ['css']);
    gulp.watch([config.jsDir + '**/*.js', '!' + config.jsDir + 'vendor/**/*.js'], ['js']);
});

gulp.task('default', ['css', 'watch']);
