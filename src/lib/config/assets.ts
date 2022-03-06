import {
  getAssetInfoFactory,
  assetsList,
  STABLE_ASSETS as stableAssets,
} from '@aave/aave-ui-kit';


export const getAssetInfo = getAssetInfoFactory(assetsList);

export const getAssetColor = (assetSymbol: string) => {
  const asset = getAssetInfo(assetSymbol);
  const assetColor = asset.color;

  return assetColor || '#2ebac6';
};

export const isAssetStable = (assetSymbol: string) => {
  const assetInfo = getAssetInfo(assetSymbol);
  return stableAssets.includes(assetInfo.symbol.toLocaleUpperCase());
};
