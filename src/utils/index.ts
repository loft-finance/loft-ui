export const fixedToValue = (value: string | number, len: number = 8) => {
  if (!value) {
    return '0';
  }

  if (typeof value === 'string') {
    if (Number(value) === 0) {
      return '0';
    } else {
      return Number(value).toFixed(len).replace(/0{0,6}$/, '');
    }
  }

  if (typeof value === 'number') {
    if (value === 0) {
      return '0';
    } else {
      return value.toFixed(len).replace(/0{0,6}$/, '')
    }
  }

  return value;
}