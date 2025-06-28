import copy from '@guanghechen/rollup-plugin-copy';
import { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';

const banner = `/**
* SWADE Stat Block Importer
* Author: Arnon Ram
*/`;

const srcDirectory = 'src';
const distDirectory = 'dist';
const staticFiles = ['templates', 'lang', 'module.json'];

const bundle: RollupOptions = {
  strictDeprecations: true,
  input: 'src/swadeNpcImporter.ts',
  output: {
    dir: distDirectory,
    format: 'es',
    sourcemap: process.env.CI ? false : true,
    assetFileNames: '[name].[ext]',
    banner: banner,
  },
  plugins: [
    typescript({ noEmitOnError: false }),
    copy({
      targets: [
        {
          src: staticFiles.map(f => `${srcDirectory}/${f}`),
          dest: distDirectory,
        },
      ],
    }),
    ...(process.env.DEV
      ? [
          livereload({
            watch: distDirectory,
            exts: ['js'],
            extraExts: [],
          }),
        ]
      : []),
  ],
};

export default bundle;
