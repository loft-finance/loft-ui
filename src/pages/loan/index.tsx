import { useRef, useState } from 'react';
import { useModel, history } from 'umi';
import { Table, Row, Col, Menu, Radio, Input } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import { valueToBigNumber, BigNumber } from '@aave/protocol-js';
import { isAssetStable } from '@/lib/config/assets'
import { TokenIcon } from '@aave/aave-ui-kit';

import styles from './style.less';

const { Search } = Input;


export default () => {
  const [searchValue, setSearchValue] = useState('');
  const [showOnlyStableCoins, setShowOnlyStableCoins] = useState(false);
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const { reserves, baseCurrency, user } = useModel('pool')
  const marketRefPriceInUsd = baseCurrency.marketRefPriceInUsd

  const { wallet } = useModel('wallet')

  const { reserveIncentives } = useModel('incentives')
  
  const availableBorrowsMarketReferenceCurrency = valueToBigNumber(
    user?.availableBorrowsMarketReferenceCurrency || 0
  );

  const filteredReserves = reserves.filter(
    (reserve) =>
      reserve.symbol.toLowerCase().includes(searchValue.toLowerCase()) &&
      reserve.isActive &&
      (!showOnlyStableCoins || isAssetStable(reserve.symbol))
  );

  const list = (withFilter: boolean) => {
    const data = (reserves: any) =>
      reserves.map((reserve: any) => {
        const availableBorrows = availableBorrowsMarketReferenceCurrency.gt(0)
          ? BigNumber.min(
              // one percent margin to don't fail tx
              availableBorrowsMarketReferenceCurrency
                .div(reserve.priceInMarketReferenceCurrency)
                .multipliedBy(
                  user && user.totalBorrowsMarketReferenceCurrency !== '0' ? '0.99' : '1'
                ),
              reserve.availableLiquidity
            ).toNumber()
          : 0;
        const availableBorrowsInUSD = valueToBigNumber(availableBorrows)
          .multipliedBy(reserve.priceInMarketReferenceCurrency)
          .multipliedBy(marketRefPriceInUsd)
          .toString();
        const reserveIncentiveData = reserveIncentives[reserve.underlyingAsset.toLowerCase()];
        return {
          ...reserve,
          currentBorrows:
            user?.userReservesData.find((userReserve) => userReserve.reserve.id === reserve.id)
              ?.totalBorrows || '0',
          currentBorrowsInUSD:
            user?.userReservesData.find((userReserve) => userReserve.reserve.id === reserve.id)
              ?.totalBorrowsUSD || '0',
          availableBorrows,
          availableBorrowsInUSD,
          stableBorrowRate:
            reserve.stableBorrowRateEnabled && reserve.borrowingEnabled
              ? Number(reserve.stableBorrowAPY)
              : -1,
          variableBorrowRate: reserve.borrowingEnabled ? Number(reserve.variableBorrowAPY) : -1,
          avg30DaysVariableRate: Number(reserve.avg30DaysVariableBorrowRate),
          interestHistory: [],
          aincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.aIncentives.incentiveAPR
            : '0',
          vincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.vIncentives.incentiveAPR
            : '0',
          sincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.sIncentives.incentiveAPR
            : '0',
        };
      });

    if (withFilter) {
      if (sortDesc) {
        // @ts-ignore
        return data(filteredReserves).sort((a, b) => a[sortName] - b[sortName]);
      } else {
        // @ts-ignore
        return data(filteredReserves).sort((a, b) => b[sortName] - a[sortName]);
      }
    } else {
      return data(reserves);
    }
  };;

  const handler = {
    detail(record) {
      history.push(`/loan/detail/${record.underlyingAsset}/${record.id}`);
    },
    data () {
      reserves.map((reserve) => {
        const userReserve = user?.userReservesData.find(
          (userRes) => userRes.reserve.symbol === reserve.symbol
        );
        const walletBalance =
          walletData[reserve.underlyingAsset] === '0'
            ? valueToBigNumber('0')
            : valueToBigNumber(walletData[reserve.underlyingAsset] || '0').dividedBy(
                valueToBigNumber('10').pow(reserve.decimals)
              );
        const walletBalanceInUSD = walletBalance
          .multipliedBy(reserve.priceInMarketReferenceCurrency)
          .multipliedBy(marketRefPriceInUsd)
          .toString();
        const reserveIncentiveData = reserveIncentives[reserve.underlyingAsset.toLowerCase()];
        return {
          ...reserve,
          walletBalance,
          walletBalanceInUSD,
          underlyingBalance: userReserve ? userReserve.underlyingBalance : '0',
          underlyingBalanceInUSD: userReserve ? userReserve.underlyingBalanceUSD : '0',
          liquidityRate: reserve.supplyAPY,
          avg30DaysLiquidityRate: Number(reserve.avg30DaysLiquidityRate),
          borrowingEnabled: reserve.borrowingEnabled,
          interestHistory: [],
          aincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.aIncentives.incentiveAPR
            : '0',
          vincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.vIncentives.incentiveAPR
            : '0',
          sincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.sIncentives.incentiveAPR
            : '0',
        };
      });
    },
    search(value: string) {
      setSearchValue(value)
    }
  };

  const columns = [
    {
      title: 'Assets',
      dataIndex: 'symbol',
      render: (text: any) => {
        return <TokenIcon 
          tokenSymbol={text}
          height={35}
          width={35}
          tokenFullName={text}
          className="MarketTableItem__token"
        />
      },
    },
    {
      title: 'Can be borrowed',
      dataIndex: 'availableBorrows',
      render: (text: any) => {
        return Number(text)
      }
    },
    {
      title: 'Borrow APY',
      dataIndex: 'variableBorrowRate',
      render: (text: any) => {
        return text.toFixed(2) + '%'
      }
    },
  ];

  const totalValue = list(false).reduce((a, b) => a + (+b['currentBorrowsInUSD'] || 0), 0)

  return (
    <GridContent>
      <Row>
        <Col span={12}>
          <Radio.Group defaultValue={showOnlyStableCoins?"stable":"all"} buttonStyle="solid" onChange={(e)=>{setShowOnlyStableCoins(e.target.value === 'stable')}} >
            <Radio.Button value="all" style={{width:112, textAlign:'center', borderRadius: '6px 0 0 6px'}}>All</Radio.Button>
            <Radio.Button value="stable" style={{ borderRadius: '0 6px 6px 0'}}>Stable Coins</Radio.Button>
          </Radio.Group>
        </Col>
        <Col span={12}>
          <Search placeholder="search" style={{ width: 200 }} onSearch={handler.search} />
        </Col>
      </Row>
      <Row>
        <Col span={16}>
          <Table
            rowKey={'id'}
            columns={columns}
            dataSource={list(true)}
            pagination={false}
            loading={!list(true)?.length}
            scroll={{ y: 600 }}
            onRow={(record) => ({ onClick: () => handler.detail(record) })}
          />
        </Col>
        <Col style={{ marginTop: 20 }} span={6} offset={1}>
          <Menu className={styles.menu} selectable={false}>
            <Menu.Item
              key="header"
              style={{ borderRadius: '3px 3px 0 0', background: '#151515', color: '#fff' }}
            >
              My deposits
            </Menu.Item>
            { list(false).map((item: any, index: number) => 
              item.currentBorrows.toString() > '0' && 
              <Menu.Item key={index}>
                <Row>
                  <Col span={12}>
                    <TokenIcon 
                      tokenSymbol={item.symbol}
                      height={25}
                      width={25}
                      tokenFullName={item.symbol}
                      className="MarketTableItem__token"
                    />
                  </Col>
                  <Col span={12}>
                    <span className={styles.value}>{item.currentBorrows.toString()}</span>
                  </Col>
                </Row>
              </Menu.Item>
            )}
            {totalValue > 0 &&<Menu.Divider /> }
            <Menu.Item key="total">
              Total
              <span className={styles.value}>{totalValue}</span>
            </Menu.Item>
          </Menu>
        </Col>
      </Row>
    </GridContent>
  );
};
