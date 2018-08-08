import * as webpack from 'webpack';
import {join} from 'path';
import {mkdirp, writeFile} from 'fs-extra';
import {resolve as urlResolve} from 'url';

export interface BundleDependency {
  file: string;
  publicPath: string;
  chunkName: string;
  id?: string;
  name?: string;
}

export interface ReactLoadableMetadata {
  [bundle: string]: BundleDependency[];
}

// TODO: add sha integrities
export class AsyncChunksPlugin implements webpack.Plugin {
  apply(compiler: webpack.Compiler) {
    compiler.hooks.afterEmit.tapAsync(
      'AsyncChunksPlugin',
      async (compilation, callback) => {
        const manifest: ReactLoadableMetadata = {};
        const context = compiler.options.context;

        for (const chunkGroup of compilation.chunkGroups) {
          const files: BundleDependency[] = [];
          for (const chunk of chunkGroup.chunks) {
            for (const file of chunk.files) {
              const publicPath = urlResolve(
                compilation.outputOptions.publicPath || '',
                file,
              );
              if (!file.endsWith('.map')) {
                files.push({
                  file,
                  publicPath,
                  chunkName: chunk.name,
                });
              }
            }
          }

          for (const block of chunkGroup.blocksIterable) {
            let name;
            let id;
            const dependency = block.module.dependencies.find(
              (dep: any) => block.request === dep.request,
            );

            if (dependency) {
              const module = dependency.module;
              id = module.id;
              name =
                typeof module.libIdent === 'function'
                  ? module.libIdent({context})
                  : null;
            }

            for (const file of files) {
              file.id = id;
              file.name = name;
            }

            manifest[block.request] = files;
          }
        }

        try {
          const outputDir = compilation.outputOptions.path;
          await mkdirp(outputDir);
          await writeFile(
            join(outputDir || '', 'react-loadable.json'),
            JSON.stringify(manifest, null, 2),
          );
        } catch (err) {
          compilation.errors.push(err);
        } finally {
          callback();
        }
      },
    );
  }
}
