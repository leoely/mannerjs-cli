import { series, src, dest, } from 'gulp';
import babel from 'gulp-babel';
import ts from 'gulp-typescript';

function buildJs() {
  return src('src/server/**/*.js')
    .pipe(babel())
    .pipe(dest('dist'));
}

function buildTs() {
  return src('src/server/**/*.ts')
    .pipe(babel())
    .pipe(dest('dist'));
}


exports.build = series(buildJs, buildTs);
