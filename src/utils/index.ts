import BigNumber from 'bignumber.js'

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


export function numberWithCommas(x?: string | number | BigNumber, decimalPlace = 2, showSign?: boolean): string {
  if (x === undefined || !x.toString().length) {
    return numberWithCommas('0', decimalPlace, showSign)
  }

  const trimTrailingZero = (x: string): string => {
    if (x.length <= decimalPlace) {
      return x.padEnd(decimalPlace, '0')
    }

    return x[x.length - 1] !== '0' ? x : trimTrailingZero(x.substring(0, length - 1))
  }

  const parts: string[] = new BigNumber(x).toFixed(decimalPlace).split('.')

  parts[0] = (parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')) ?? '0'

  if (!parts[1]) {
    parts[1] = '0'.repeat(decimalPlace)
  } else {
    parts[1] = trimTrailingZero(parts[1])
  }

  if (!decimalPlace) {
    return parts[0]
  }
  return [
    showSign && new BigNumber(x).gte(0) ? '+' : '',
    parts.join('.')
  ].join('')
}