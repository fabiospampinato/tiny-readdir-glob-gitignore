
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
    const modulesPath = path.join ( rootPath, 'node_modules' );
    const fooIgnorePath = path.join ( rootPath, '.fooignore' );
    const fooIgnoreContent = 'src';

    const result1 = await readdir ( '**/*', {
      cwd: rootPath
    });

    const result2 = await readdir ( '**/*', {
      cwd: modulesPath
    });

    const result3 = await readdir ( '**/*', {
      cwd: modulesPath,
      ignoreFilesFindAbove: false
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

    console.log ( result1.files );

    t.true ( result1.files.length < 100 );
    t.is ( result2.files.length, 0 );

    t.true ( result3.files.length > 100 );
    t.true ( result4.files.length > result3.files.length );
    t.true ( result5.files.length < result4.files.length );
    t.true ( result6.files.length < result1.files.length );

  });

});
