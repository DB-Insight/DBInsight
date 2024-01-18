export const getAssetsUrl = (path: string): string => {
  return new URL(`../assets/${path}`, import.meta.url).href;
};

export const getWorkersUrl = (path: string): string => {
  return new URL(`../workers/${path}`, import.meta.url).href;
};
