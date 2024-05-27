
/* IMPORT */

import type {Dirent, Result} from 'tiny-readdir-glob';

/* HELPERS */

type ArrayMaybe<T> = T[] | T;

type PromiseMaybe<T> = Promise<T> | T;

/* MAIN */

type Ignore = ( targetPath: string ) => boolean;

type Options = {
  cwd?: string,
  depth?: number,
  limit?: number,
  followSymlinks?: boolean,
  ignore?: ArrayMaybe<Ignore | RegExp | string>,
  ignoreFiles?: string[],
  ignoreFilesFindAbove?: boolean,
  ignoreFilesFindBetween?: boolean,
  ignoreFilesStrictly?: boolean,
  signal?: { aborted: boolean },
  onDirents?: ( dirents: Dirent[] ) => PromiseMaybe<undefined>
};

/* EXPORT */

export type {ArrayMaybe, PromiseMaybe, Dirent, Ignore, Options, Result};
