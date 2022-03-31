import BigNumber from 'bignumber.js'

export function toBigNumber(value: string | number): BigNumber {
    return new BigNumber(value)
}

export function weiToBigNumber(value?: string | number | BN, decimalPlaces = 18): BigNumber {
    if (!value) {
        return new BigNumber(0)
    }

    return new BigNumber(web3Utils.fromWei(value.toString())).dp(decimalPlaces, BigNumber.ROUND_DOWN)
}

export function weiToString(value: string | number | BN, decimalPlaces = 18): string {
    return weiToBigNumber(value, decimalPlaces)
        .toFixed(decimalPlaces)
}

export function toWei(amount: number | string): string {
    return toBigNumber(amount)
        .multipliedBy(toBigNumber('1e+18'))
        .toString(10)
}