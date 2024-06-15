
/* IMPORT */

import fastIgnore from 'fast-ignore';
import fs from 'node:fs/promises';
import path from 'node:path';
import {explodeStart} from 'zeptomatch-explode';
import isStatic from 'zeptomatch-is-static';
import unescape from 'zeptomatch-unescape';
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

const globExplode = ( glob: string ): [paths: string[], glob: string] => {

  if ( isStatic ( glob ) ) { // Handling it as a relative path, not a glob

    return [[unescape ( glob )], '**/*'];

  } else { // Handling it as an actual glob

    const {statics, dynamic} = explodeStart ( glob );

    return [statics, dynamic];

  }

};

const getIgnoreAt = async ( folderPath: string, filesNames: string[], forcedPaths: string[] = [] ): Promise<Ignore | undefined> => {

  if ( !filesNames.length ) return;

  const filesPaths = filesNames.map ( fileName => path.join ( folderPath, fileName ) );
  const filesContents = await Promise.all ( filesPaths.map ( filePath => fs.readFile ( filePath, 'utf8' ).catch ( () => '' ) ) );
  const filesContentsValid = filesContents.filter ( Boolean );

  if ( !filesContentsValid.length ) return;

  const filesContentsWithForcedPaths = filesContentsValid.map ( content => getIgnoreContentWithForcedPaths ( folderPath, content, forcedPaths ) );
  const ignore = fastIgnore ( filesContentsWithForcedPaths );

  return ( targetPath: string ): boolean => {

    const relativePath = fastRelativeChildPath ( folderPath, targetPath );

    return !!relativePath && ignore ( relativePath );

  };

};

const getIgnoreContentWithForcedPaths = ( folderPath: string, content: string, forcedPaths: string[] ): string => {

  if ( !forcedPaths.length ) return content;

  const forcedRelativePathsInside = forcedPaths.map ( forcedPath => fastRelativeChildPath ( folderPath, forcedPath ) ).filter ( isString ).map ( unixify );

  if ( !forcedRelativePathsInside.length ) return content;

  const forcedContents = forcedRelativePathsInside.map ( forcedPath => `!/${forcedPath}` ).join ( '\n' );

  return `${content}\n${forcedContents}`;

};

const getSearchPaths = ( rootPath: string, globs: string | string[] ): string[] => {

  const searchPaths = new Set<string>();

  for ( const glob of castArray ( globs ) ) {

    const [statics] = globExplode ( glob );

    for ( const prefix of statics ) {

      let searchPath = path.join ( rootPath, prefix );

      while ( true ) {

        searchPaths.add ( searchPath );

        if ( searchPath === rootPath ) break;

        const searchPathNext = path.dirname ( searchPath );

        if ( searchPathNext.length <= rootPath.length ) break;

        searchPath = searchPathNext;

      }

    }

  }

  return [...searchPaths];

};

const getSkippedPaths = ( rootPath: string, globs: string | string[] ): string[] => {

  const skippedPaths = new Set<string>();

  for ( const glob of castArray ( globs ) ) {

    const [statics] = globExplode ( glob );

    for ( const prefix of statics ) {

      let skippedPath = path.join ( rootPath, path.dirname ( prefix ) );

      while ( true ) {

        skippedPaths.add ( skippedPath );

        if ( skippedPath === rootPath ) break;

        const skippedPathNext = path.dirname ( skippedPath );

        if ( skippedPathNext.length <= rootPath.length ) break;

        skippedPath = skippedPathNext;

      }

    }

  }

  return [...skippedPaths];

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

const unixify = ( filePath: string ): string => {

  return filePath.replace ( /[\\\/]+/g, '/' );

};

/* EXPORT */

export {castArray, fastRelativeChildPath, globExplode, getIgnoreAt, getIgnoreContentWithForcedPaths, getSearchPaths, getSkippedPaths, isString, unixify};
