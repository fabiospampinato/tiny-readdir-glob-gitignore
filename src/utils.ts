
/* IMPORT */

import fastIgnore from 'fast-ignore';
import fs from 'node:fs/promises';
import path from 'node:path';
import {explodeStart} from 'zeptomatch-explode';
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

const getIgnoreAt = async ( folderPath: string, filesNames: string[] ): Promise<Ignore | undefined> => {

  if ( !filesNames.length ) return;

  const filesPaths = filesNames.map ( fileName => path.join ( folderPath, fileName ) );
  const filesContents = await Promise.all ( filesPaths.map ( filePath => fs.readFile ( filePath, 'utf8' ).catch ( () => '' ) ) );
  const filesContentsValid = filesContents.filter ( Boolean );

  if ( !filesContentsValid.length ) return;

  const ignore = fastIgnore ( filesContentsValid );

  return ( targetPath: string ): boolean => {

    const relativePath = fastRelativeChildPath ( folderPath, targetPath );

    return !!relativePath && ignore ( relativePath );

  };

};

const getSkippedPaths = ( rootPath: string, globs: string | string[] ): string[] => {

  const skippedPaths = new Set<string>();

  for ( const glob of castArray ( globs ) ) {

    const {statics} = explodeStart ( glob );

    for ( const prefix of statics ) {

      let skippedPath = path.join ( rootPath, path.dirname ( prefix ) );

      while ( true ) {

        skippedPaths.add ( skippedPath );

        if ( skippedPath === rootPath ) break;

        skippedPath = path.dirname ( skippedPath );

      }

    }

  }

  return [...skippedPaths];

};

/* EXPORT */

export {castArray, fastRelativeChildPath, getIgnoreAt, getSkippedPaths};
