gulp.task('ejs', async function () {
  const data = {
      pageTitle: 'My Website',
      siteName: 'Example Site',
      currentYear: new Date().getFullYear()
  };

  await gulp.src('./source/**/*.ejs')
      .pipe($.plumber())
      .pipe($.ejs({
          // options
          pretty: false
      }))
      .pipe(gulp.dest('./public/'));
});
