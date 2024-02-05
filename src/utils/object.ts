export const compareChanged = (obj1: any, obj2: any) => {
  const arr1 = Object.entries(obj1);
  const arr2 = Object.entries(obj2);

  const arr = arr1.concat(arr2).map((item) => JSON.stringify(item));
  const result = Array.from(new Set(arr)).map((item) => JSON.parse(item));

  result.splice(0, arr1.length);

  return Object.fromEntries(result);
};
