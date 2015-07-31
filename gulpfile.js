var gulp = require('gulp'),
		browserify = require('browserify'),
		source = require('vinyl-source-stream'),
		buffer = require('vinyl-buffer'),
		babelify = require('babelify'),
		browserSync = require('browser-sync'),
		reload = browserSync.reload,
		$ = require('gulp-load-plugins')();

// Define paths
var paths = {
	srcCSS: './src/styles/',
	distCSS: './build/styles/',
	srcJS : './src/scripts/' ,
	distJS: './build/scripts/',
	srcI: './src/images/',
	distI: './build/images/',
	srcT: './src/templates/',
	distT: './build/'
}

// Setup PostCSS Plugins
var processors = [
	require('cssnext')(), // https://github.com/cssnext/cssnext
	require('precss'),
	require('postcss-pseudo-class-enter')(), //https://github.com/jonathantneal/postcss-pseudo-class-enter
	require('postcss-position')(), // https://github.com/seaneking/postcss-position
	require('postcss-size'), // https://github.com/postcss/postcss-size
	require('postcss-quantity-queries')(), // https://github.com/pascalduez/postcss-quantity-queries
	require('autoprefixer-core')({ browsers: ['last 2 version'] }), // https://github.com/postcss/autoprefixer-core
	require('postcss-reporter')() // https://github.com/postcss/postcss-reporter
];

gulp.task('styles', function () {
	return gulp.src(paths.srcCSS + 'style.css')
		.pipe($.plumber({
		  errorHandler: $.notify.onError("Error: <%= error.message %>")
		}))
		.pipe($.sourcemaps.init())
		.pipe($.postcss(processors))
		.pipe($.minifyCss())
    .pipe($.sourcemaps.write())
		.pipe(gulp.dest(paths.distCSS))
		.pipe(reload({stream:true}));
});

gulp.task('templates', function () {
	return gulp.src([paths.srcT + '*.jade', '!' + paths.srcT + 'layout.jade'])
		.pipe($.plumber({
		  errorHandler: $.notify.onError("Error: <%= error.message %>")
		}))
		.pipe($.jade({
	    pretty : true
	  }))
		.pipe(gulp.dest(paths.distT))
		.pipe(reload({stream:true}));
})

gulp.task('scripts', function () {
	var b = browserify({
	  entries: paths.srcJS + 'app.js',
	  debug: true,
	  transform: [babelify]
	});

	return b.bundle()
	  .pipe(source('main.min.js'))
	  .pipe(buffer())
	  .pipe($.sourcemaps.init({loadMaps: true}))
	  .pipe($.uglify())
	  .pipe($.plumber({
	    errorHandler: $.notify.onError("Error: <%= error.message %>")
	  }))
	  .pipe($.sourcemaps.write('.'))
	  .pipe(gulp.dest('./build/scripts/'))
	  .pipe(reload({stream:true}));
});	

gulp.task('watch', function() {
	gulp.watch(paths.srcCSS + '**/*.css', ['styles']);
	gulp.watch(paths.srcJS + '**/*.js', ['scripts']);
	gulp.watch(paths.srcT + '**/*.jade', ['templates']);
	gulp.watch(paths.srcI, ['images']);
});

gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: './build'
		}
	})
});

gulp.task('images', function () {
	return gulp.src(paths.srcI + '*')
		.pipe($.imagemin())
		.pipe(gulp.dest(paths.distI));
});

gulp.task('default', ['styles', 'templates', 'scripts', 'images', 'browser-sync','watch']);