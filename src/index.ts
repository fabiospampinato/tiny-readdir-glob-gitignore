
/* IMPORT */

import findUpPath from 'find-up-path';
import path from 'node:path';
import process from 'node:process';
import readdirGlob from 'tiny-readdir-glob';
import {castArray, getIgnoreAt, getSearchPaths, getSkippedPaths} from './utils';
import type {Dirent, Ignore, Options, Result} from './types';

/* MAIN */

//TODO: Maybe find _all_ ignore files above?
//TODO: Maybe force only the current folder we are searching into, for each internal search, rather than all of them for all internal searches?

const readdirGlobGitignore = async ( glob: string | string[], options?: Options ): Promise<Result> => {

  const ignoreFiles = options?.ignoreFiles ?? ['.gitignore'];
  const ignoreFilesFindAbove = options?.ignoreFilesFindAbove ?? true;
  const ignoreFilesFindBetween = options?.ignoreFilesFindBetween ?? true;
  const ignoreFilesStrictly = options?.ignoreFilesStrictly ?? false;
  const ignores: Ignore[] = [];

  const rootPath = options?.cwd ?? process.cwd ();
  const searchPaths = getSearchPaths ( rootPath, glob );
  const skippedPaths = getSkippedPaths ( rootPath, glob );
  const forcedPaths = ignoreFilesStrictly ? [] : searchPaths;

  if ( glob.length && ignoreFilesFindAbove && ignoreFiles.length ) {
    const parentPath = path.dirname ( rootPath );
    for ( const ignoreFile of ignoreFiles ) {
      const filePath = findUpPath ( ignoreFile, parentPath );
      if ( !filePath ) continue;
      const folderPath = path.dirname ( filePath );
      const ignore = await getIgnoreAt ( folderPath, [ignoreFile], forcedPaths );
      if ( !ignore ) continue;
      ignores.push ( ignore );
    }
  }

  if ( glob.length && ignoreFilesFindBetween && ignoreFiles.length ) {
    for ( const skippedPath of skippedPaths ) {
      const ignore = await getIgnoreAt ( skippedPath, ignoreFiles, forcedPaths );
      if ( !ignore ) continue;
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
      const ignore = await getIgnoreAt ( folderPath, filesNames, forcedPaths );
      if ( !ignore ) return;
      ignores.push ( ignore );
    }
  });

};

/* EXPORT */

export default readdirGlobGitignore;
export type {Dirent, Options, Result};
