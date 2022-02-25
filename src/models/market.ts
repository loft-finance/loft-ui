import { useState } from 'react';
import { markets } from '@/lib/config/markets';

const getInitialMarket = () => {
    const keys = Object.keys(markets)
    return markets[keys[2]];
};
export default () => {
    const [current, setCurrent] = useState(getInitialMarket());

    return { current }
}