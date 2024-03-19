
/* IMPORT */

import fastIgnore from 'fast-ignore';
import fs from 'node:fs/promises';
import path from 'node:path';
import type {Ignore} from './types';

/* MAIN */

const castArray = <T> ( value: T[] | T ): T[] => {

  return Array.isArray ( value ) ? value : [value];

};

const fastRelativeChildPath = ( fromPath: string, toPath: string ): string | undefined => {

  if ( toPath.startsWith ( fromPath ) ) {

    if ( toPath[fromPath.length] === path.sep ) {

      return toPath.slice ( fromPath.length + 1 );

    }

  }

};

const getIgnoreAt = async ( folderPath: string, filesNames: string[] ): Promise<Ignore> => {

  if ( !filesNames.length ) return () => false;

  const filesPaths = filesNames.map ( fileName => path.join ( folderPath, fileName ) );
  const filesContents = await Promise.all ( filesPaths.map ( filePath => fs.readFile ( filePath, 'utf8' ) ) );
  const ignore = fastIgnore ( filesContents );

  return ( targetPath: string ): boolean => {

    const relativePath = fastRelativeChildPath ( folderPath, targetPath );

    return !!relativePath && ignore ( relativePath );

  };

};

/* EXPORT */

export {castArray, fastRelativeChildPath, getIgnoreAt};
