import { useState } from 'react';
import { markets } from '@/lib/config/markets';

const getInitialMarket = () => {
    const keys = Object.keys(markets)
    return markets[keys[0]];
};
export default () => {
    const [current,] = useState(getInitialMarket());

    return { current }
}