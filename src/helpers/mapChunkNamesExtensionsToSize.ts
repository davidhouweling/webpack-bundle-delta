/*
 * Copyright (c) Trainline Limited, 2020. All rights reserved.
 * See LICENSE.md in the project root for license information.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import webpack from 'webpack';
import {
  FILENAME_JS_MJS_CSS_EXTENSIONS,
  FILENAME_QUERY_REGEXP,
  SupportedExtensions,
} from './constants';
import extractStats from './extractStats';
import getNameFromAsset from './getNameFromAsset';

export interface ChunkNamesExtensionsToSize {
  [chunkName: string]: {
    [extension in SupportedExtensions]: {
      size: number;
      gzSize?: number;
      brSize?: number;
    };
  };
}

const mapChunkNamesExtensionsToSize = (
  compilationStats: webpack.Stats.ToJsonOutput,
  chunkFilename: string
): ChunkNamesExtensionsToSize => {
  return extractStats(compilationStats).reduce((chunkNamesExtensionsToSize, stats) => {
    const { assets } = stats;
    assets
      .filter((asset) =>
        FILENAME_JS_MJS_CSS_EXTENSIONS.test(asset.name.replace(FILENAME_QUERY_REGEXP, ''))
      )
      .forEach((asset) => {
        const { name, size } = asset;
        const nameWithoutQuery = name.split('?')[0];
        const extension = nameWithoutQuery.split('.').pop();
        // these are only generated when the ratio is high enough
        const gzAsset = assets.find((a) => a.name.startsWith(`${nameWithoutQuery}.gz`));
        const brAsset = assets.find((a) => a.name.startsWith(`${nameWithoutQuery}.br`));

        const customName = getNameFromAsset(asset, chunkFilename, false);

        // eslint-disable-next-line no-param-reassign
        chunkNamesExtensionsToSize[customName] = {
          ...chunkNamesExtensionsToSize[customName],
          [extension]: {
            size,
            gzSize: gzAsset ? gzAsset.size : null,
            brSize: brAsset ? brAsset.size : null,
          },
        };
      });
    return chunkNamesExtensionsToSize;
  }, {} as ChunkNamesExtensionsToSize);
};

export default mapChunkNamesExtensionsToSize;
