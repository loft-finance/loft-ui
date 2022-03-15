import { valueToBigNumber } from '@aave/protocol-js';
const POSTFIXES = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];
export default ({value, maximumFractionDigits = 2, ...props }: any) => {
    const bnValue = valueToBigNumber(value);

    const integerPlaces = bnValue.toFixed(0).length;
    const significantDigitsGroup = Math.min(
        Math.floor(integerPlaces ? (integerPlaces - 1) / 3 : 0),
        POSTFIXES.length - 1
    );
    const postfix = POSTFIXES[significantDigitsGroup];
    const formattedValue = bnValue.dividedBy(10 ** (3 * significantDigitsGroup)).toNumber();

    return (
        <>{formattedValue.toFixed(maximumFractionDigits)}{postfix}</>
    );
}