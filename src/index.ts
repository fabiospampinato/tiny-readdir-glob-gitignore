
/* IMPORT */

import findUpPath from 'find-up-path';
import path from 'node:path';
import process from 'node:process';
import readdirGlob from 'tiny-readdir-glob';
import {castArray, getIgnoreAt} from './utils';
import type {Dirent, Ignore, Options, Result} from './types';

/* MAIN */

//TODO: Maybe find _all_ ignore files above?

const readdirGlobGitignore = async ( glob: string | string[], options?: Options ): Promise<Result> => {

  const ignoreFiles = options?.ignoreFiles ?? ['.gitignore'];
  const ignoreFilesFindAbove = options?.ignoreFilesFindAbove ?? true;
  const ignores: Ignore[] = [];

  if ( ignoreFilesFindAbove ) {
    const parentPath = path.dirname ( options?.cwd ?? process.cwd () );
    for ( const ignoreFile of ignoreFiles ) {
      const filePath = findUpPath ( ignoreFile, parentPath );
      if ( !filePath ) continue;
      const folderPath = path.dirname ( filePath );
      const ignore = await getIgnoreAt ( folderPath, [ignoreFile] );
      ignores.push ( ignore );
    }
  }

  return readdirGlob ( glob, {
    ...options,
    ignore: [
      ( targetPath: string ) => ignores.some ( ignore => ignore ( targetPath ) ),
      ...castArray ( options?.ignore || [] )
    ],
    onDirents: async dirents => {
      await options?.onDirents?.( dirents );
      if ( !ignoreFiles.length ) return;
      const ignoreDirents = dirents.filter ( dirent => dirent.isFile () && ignoreFiles.includes ( dirent.name ) );
      if ( !ignoreDirents.length ) return;
      const folderPath = ignoreDirents[0].path;
      const filesNames = ignoreDirents.map ( dirent => dirent.name );
      const ignore = await getIgnoreAt ( folderPath, filesNames );
      ignores.push ( ignore );
    }
  });

};

/* EXPORT */

export default readdirGlobGitignore;
export type {Dirent, Options, Result};
