
/* IMPORT */

import {describe} from 'fava';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readdir from '../dist/index.js';

/* MAIN */

describe ( 'Tiny Readdir Glob Gitignore', it => {

  it ( 'works', async t => {

    const rootPath = process.cwd ();
    const distPath = path.join ( rootPath, 'dist' );
    const modulesPath = path.join ( rootPath, 'node_modules' );
    const fooIgnorePath = path.join ( rootPath, '.fooignore' );
    const fooIgnoreContent = 'src';

    const result1 = await readdir ( '**/*', {
      cwd: rootPath
    });

    const result2 = await readdir ( '**/*', {
      cwd: modulesPath,
      ignoreFilesStrictly: true
    });

    const result3 = await readdir ( '**/*', {
      cwd: modulesPath,
      ignoreFilesFindAbove: false,
      ignoreFilesStrictly: true
    });

    const result4 = await readdir ( '**/*', {
      cwd: rootPath,
      ignoreFiles: ['.fooignore']
    });

    fs.writeFileSync ( fooIgnorePath, fooIgnoreContent );

    const result5 = await readdir ( '**/*', {
      cwd: rootPath,
      ignoreFiles: ['.fooignore']
    });

    const result6 = await readdir ( '**/*', {
      cwd: rootPath,
      ignoreFiles: ['.gitignore', '.fooignore']
    });

    fs.unlinkSync ( fooIgnorePath );

    const result7 = await readdir ( 'dist/**/*', {
      cwd: rootPath,
      ignoreFilesStrictly: true
    });

    const result8 = await readdir ( 'dist/**/*', {
      cwd: rootPath,
      ignoreFilesFindAbove: false,
      ignoreFilesStrictly: true
    });

    const result9 = await readdir ( 'dist/**/*', {
      cwd: rootPath,
      ignoreFiles: ['.fooignore'],
      ignoreFilesStrictly: true
    });

    const result10 = await readdir ( '**/*', {
      cwd: distPath,
      ignoreFilesFindAbove: false,
      ignoreFilesStrictly: true
    });

    // t.true ( result1.files.length < 150 );
    t.is ( result2.files.length, 0 );

    t.true ( result3.files.length > 100 );
    t.true ( result4.files.length > result3.files.length );
    t.true ( result5.files.length < result4.files.length );
    t.true ( result6.files.length < result1.files.length );

    t.true ( result7.files.length === 0 );
    t.true ( result8.files.length === 0 );
    t.true ( result9.files.length > 0 );
    t.true ( result10.files.length > 0 );

  });

  it ( 'supports reincluding back explicitly searched into roots', async t => {

    const {files: files1} = await readdir ( 'node_modules' );

    t.true ( files1.length > 0 );

    const {files: files2} = await readdir ( 'node_modules', {
      ignoreFilesStrictly: false
    });

    t.true ( files2.length > 0 );

    const {files: files3} = await readdir ( '{node_modules,dist}' );

    t.true ( files3.length === 0 );

    const {files: files4} = await readdir ( '{node_modules,dist}/**', { //TODO: Should the extra globstar be necessary here?
      ignoreFilesStrictly: false
    });

    t.true ( files4.length > 0 );
    t.true ( files4.length > files1.length );

    const {files: files5} = await readdir ( 'node_modules/tiny-readdir', {
      ignoreFilesStrictly: false
    });

    t.true ( files5.length > 0 );

    const {files: files6} = await readdir ( 'node_modules/tiny-readdir/dist', {
      ignoreFilesStrictly: false
    });

  });

  it ( 'supports relative paths expressed in various ways', async t => {

    const {files: files1} = await readdir ( '.' );
    const {files: files2} = await readdir ( './' );

    t.true ( files1.length === files2.length );

  });

});
