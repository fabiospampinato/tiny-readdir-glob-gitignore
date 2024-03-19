# Tiny Readdir Glob Gitignore

A simple promisified recursive readdir function, with support for globs and `.gitignore` files.

Compared to simply searching for `.gitignore` files first, and normal files second, this approach is more efficient because both are searched for simultaneously, meaning that a single folder is entered at most once, and if a folder is discarded by a `.gitignore` file it won't be entered at all.

## Install

```sh
npm install --save tiny-readdir-glob-gitignore
```

## Usage

```ts
import readdir from 'tiny-readdir-glob-gitignore';

const aborter = new AbortController ();

const result = await readdir ( ['src/**/*.js'], {
  depth: 20, // Maximum depth to look at
  limit: 1_000_000, // Maximum number of files explored, useful as a stop gap in some edge cases
  followSymlinks: true, // Whether to follow symlinks or not
  ignore: ['**/.git', '**/node_modules'], // Globs, or raw function, that if returns true will ignore this particular file or a directory and its descendants
  ignoreFiles: ['.gitignore'], // List of .gitignore-like files to look for, defaults to ['.gitignore']
  ignoreFilesFindAbove: true, // Whether to look for .gitignore-like files in parent directories also, defaults to true
  signal: aborter.signal, // Optional abort signal, useful for aborting potentially expensive operations
  onDirents: dirents => console.log ( dirents ) // Optional callback that will be called as soon as new dirents are available, useful for example for discovering ".gitignore" files while searching
});

console.log ( result.directories ); // => Array of absolute paths pointing to directories, filtered by the provided glob
console.log ( result.files ); // => Array of absolute paths pointing to files, filtered by the provided glob
console.log ( result.symlinks ); // => Array of absolute paths pointing to symlinks, filtered by the provided glob

console.log ( result.directoriesFound ); // => Array of absolute paths pointing to directories, not fully filtered by the provided glob yet
console.log ( result.filesFound ); // => Array of absolute paths pointing to files, not fully filtered by the provided glob yet
console.log ( result.symlinksFound ); // => Array of absolute paths pointing to symlinks, not fully filtered by the provided glob yet

console.log ( result.directoriesFoundNames ); // => Set of directories names found
console.log ( result.filesFoundNames ); // => Set of files name found
console.log ( result.symlinksFoundNames ); // => Set of symlinks names found

console.log ( result.directoriesFoundNamesToPaths ); // => Record of directories names found to their paths
console.log ( result.filesFoundNamesToPaths ); // => Record of files name found to their paths
console.log ( result.symlinksFoundNamesToPaths ); // => Record of symlinks names found to their paths

setTimeout ( () => aborter.abort (), 10000 ); // Aborting if it's going to take longer than 10s
```

## License

MIT © Fabio Spampinato
