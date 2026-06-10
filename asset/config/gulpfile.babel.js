import { series, src, dest, } from 'gulp';
import babel from 'gulp-babel';
import ts from 'gulp-typescript';

function buildJs() {
  return src('src/server/**/*.js')
    .pipe(babel({
      presets: [
        [
          '@babel/preset-env',
          {
            'targets': {
              'node': 'current'
            }
          },
        ],
        'minify'
      ],
      plugins: [
        [
          'babel-plugin-root-import',
          {
            'paths': [
              {
                'rootPathSuffix': './src',
                'rootPathPrefix': '~/'
              },
            ]
          }
        ]
      ],
    }))
    .pipe(dest('dist'));
}

exports.build = series(buildJs, buildTs);
