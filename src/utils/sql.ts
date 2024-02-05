export const getSqlValue = (value: any) => {
  if (typeof value === "string") {
    return `'${value}'`;
  }
  return value;
};
