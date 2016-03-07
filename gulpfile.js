
var path = require('path');
var fs = require('fs');
var yargs = require('yargs').argv;
var gulp = require('gulp');
var less = require('gulp-less');
var header = require('gulp-header');
var tap = require('gulp-tap');
var nano = require('gulp-cssnano');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var minifyHtml = require("gulp-minify-html");
var jshint = require("gulp-jshint");
var uglify = require("gulp-uglify");
var cheerio = require('cheerio');
var pkg = require('./package.json');

var option = {base: 'src'};
var dist = __dirname + '/dist';
var layout = '';

gulp.task('layout', function () {
    gulp.src(['src/common/layout.html'], option)
        .pipe(tap(function (file) {
            var contents = file.contents.toString();
            var dir = path.dirname(file.path);
            contents = contents.replace(/include\('(.*)'\)/gi, function (match, $1) {
                var filename = path.join(dir, $1);
                var content = fs.readFileSync(filename, 'utf-8');
                return content;
            });

            layout = contents;
        }))
})

gulp.task('source', ['layout'], function () {
    gulp.src('src/*.html', option)
        .pipe(tap(function (file) {
            var content = fs.readFileSync(file.path, 'utf-8');
            var dir = path.dirname(file.path);
            var o = {};
            content = content.replace(/include\('(.*)'\)/gi, function (match, $1) {
                var filename = path.join(dir, $1);
                var content = fs.readFileSync(filename, 'utf-8');
                return content;
            }).replace(/\{\{(.*):([\s\S}]*?)\}\}/gi, function (match, $1, $2) {
                o[$1] = $2;
                return '';
            }).replace(/<script(.*)(?:type=(["'])text\/html\2\s*src=(["'])(.*)\3|src=(["'])(.*)\5\s*type=(["'])text\/html\7)\s*?(?:\/>|>[\s\S]*?<\/script>)?/gi, function (match, $1, $2, $3, $4, $5, $6, $7) {
                var file = $4 || $6;
                var filename = path.join(dir, file);
                var content = fs.readFileSync(filename, 'utf-8');
                return '<script ' + $1.trim() + ' type="text/html">\n' + content + '\n</script>';
            });

            o.content = content;
            var out = content;
            if (!o.noLayout) {
                out = layout.replace(/\$\{\{(.*?)(?::([\s\S}]*?))?\}\}/gi, function (match, $1, $2) {
                    return o[$1] || $2 || '';
                })
            }
            var $ = cheerio.load(out);

            if (o.noNav) {
                $(".ui-nav").remove();
            }
            file.contents = new Buffer($.html());
        }))
        .pipe(minifyHtml())
        .pipe(jshint())
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
})


gulp.task('json', function () {
    gulp.src('src/json/*.json', option)
        .pipe(minifyHtml())
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
})

gulp.task('styles', function () {
    gulp.src('src/assets/styles/**', option)
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
})

gulp.task('script', function () {
    gulp.src(['src/assets/scripts/common/**','src/assets/scripts/users/**'], option)
        .pipe(jshint())
        //.pipe(uglify())
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
})

gulp.task('images', function () {
    gulp.src('src/assets/images/**', option)
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
})

gulp.task('releases', ['source','script','json','styles','images'])

gulp.task('watch', function () {
    gulp.watch('src/assets/images/**', ['images'], function () {
        browserSync.reload();
    });
    gulp.watch(['src/assets/scripts/common/**','src/assets/scripts/users/**'], ['script'], function () {
        browserSync.reload();
    });
    gulp.watch('src/assets/styles/**', ['styles'], function () {
        browserSync.reload();
    });
    gulp.watch(['src/json/*.json'], ['json'], function () {
        browserSync.reload();
    });
    gulp.watch(['src/*.html','src/**/*.html'], ['source'], function () {
        browserSync.reload();
    });
});

gulp.task('server', function () {
    yargs.p = yargs.p || 8080;
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        startPath: '/'
    });
});


// 参数说明
//  -w: 实时监听
//  -s: 启动服务器
//  -p: 服务器启动端口，默认8080
gulp.task('default', ['releases'], function () {
    if (yargs.s) {
        gulp.start('server');
    }

    if (yargs.w) {
        gulp.start('watch');
    }
});