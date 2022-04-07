import { useState } from 'react';
import { useModel, history, FormattedMessage } from 'umi';
import { Table, Row, Col, Menu, Radio, Input, Spin } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import { valueToBigNumber } from '@aave/protocol-js';
import { isAssetStable } from '@/lib/config/assets'
import { TokenIcon } from '@aave/aave-ui-kit';
import { normalize } from '@aave/math-utils';

import styles from './style.less';
import { fixedToValue } from '@/utils';

const { Search } = Input;


export default () => {
  const [searchValue, setSearchValue] = useState('');
  const [showOnlyStableCoins, setShowOnlyStableCoins] = useState(false);

  const { reserves, baseCurrency, user } = useModel('pool', res => ({
    reserves: res.reserves,
    baseCurrency: res.baseCurrency,
    user: res.user
  }))
  const marketRefPriceInUsd = normalize(baseCurrency?.marketReferenceCurrencyPriceInUsd || '0', 8)

  const { wallet, balances } = useModel('wallet', res => ({
    wallet: res.wallet,
    balances: res.balances,
  }))


  const { reserveIncentives } = useModel('incentives', res => ({
    reserveIncentives: res.reserveIncentives
  }))

  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);


  const filteredReserves = reserves.filter(
    (reserve: any) =>
      reserve.symbol.toLowerCase().includes(searchValue.toLowerCase()) &&
      reserve.isActive &&
      (!showOnlyStableCoins || isAssetStable(reserve.symbol))
  );

  const list = (withFilter: boolean) => {
    const data = (reserves: any[]) =>
      reserves.map((reserve) => {
        const userReserve = user?.userReservesData.find(
          (userRes: any) => userRes.reserve.symbol === reserve.symbol
        );
        const walletBalance =
          !wallet || balances[reserve.underlyingAsset] === '0'
            ? valueToBigNumber('0')
            : valueToBigNumber(balances[reserve.underlyingAsset] || '0').dividedBy(
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
          underlyingBalance: wallet && userReserve ? userReserve.underlyingBalance : '0',
          underlyingBalanceInUSD: wallet && userReserve ? userReserve.underlyingBalanceUSD : '0',
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

    if (withFilter) {
      if (sortDesc) {
        return (
          data(filteredReserves)
            .sort((a, b) => +b.walletBalanceInUSD - +a.walletBalanceInUSD)
            // @ts-ignore
            .sort((a, b) => a[sortName] - b[sortName])
        );
      } else {
        return (
          data(filteredReserves)
            .sort((a, b) => +b.walletBalanceInUSD - +a.walletBalanceInUSD)
            // @ts-ignore
            .sort((a, b) => b[sortName] - a[sortName])
        );
      }
    } else {
      return data(reserves);
    }
  };

  const handler = {
    detail(record: any) {
      history.push(`/deposit/detail/${record.underlyingAsset}/${record.id}`);
    },
    search(value: string) {
      setSearchValue(value)
    },
    marketDetail(record: any) {
      history.push(`/market/detail/${record.underlyingAsset}/${record.id}`);
    }
  };

  const columns = [
    {
      title: <FormattedMessage id="pages.deposit.index.table.col.assets" />,
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
      title: <FormattedMessage id="pages.deposit.index.table.col.balance" />,
      dataIndex: 'walletBalance',
      render: (text: any) => {
        return fixedToValue(text.toString())
      }
    },
    {
      title: <FormattedMessage id="pages.deposit.index.table.col.rate" />,
      dataIndex: 'liquidityRate',
      render: (text: any) => {
        return Number(text).toFixed(2) + '%'
      }
    },
  ];

  const totalValue = list(false).reduce((a, b) => a + (+b['underlyingBalanceInUSD'] || 0), 0)

  return (
    <Spin spinning={!reserves || !reserves.length}>
      <GridContent>
        <Row>
          <Col span={12}>
            <Radio.Group defaultValue={showOnlyStableCoins ? "stable" : "all"} buttonStyle="solid" onChange={(e) => { setShowOnlyStableCoins(e.target.value === 'stable') }} >
              <Radio.Button value="all" style={{ width: 112, textAlign: 'center' }}>
                <FormattedMessage id="pages.deposit.index.filter.all" />
              </Radio.Button>
              <Radio.Button value="stable">
                <FormattedMessage id="pages.deposit.index.filter.stable" />
              </Radio.Button>
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
              loading={!list(true)?.length}
              pagination={false}
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
                <FormattedMessage id="pages.deposit.index.my" />
              </Menu.Item>
              {list(false).map((item: any, index: number) =>
                item.underlyingBalance.toString() > '0' &&
                <Menu.Item key={index} onClick={() => { handler.marketDetail(item) }}>
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
                      <span className={styles.value}>{fixedToValue(item.underlyingBalance.toString())}</span>
                    </Col>
                  </Row>
                </Menu.Item>
              )}
              {totalValue > 0 && <Menu.Divider />}
              <Menu.Item key="total">
                <FormattedMessage id="pages.deposit.index.my.total" />
                <span className={styles.value}>{fixedToValue(totalValue)}</span>
              </Menu.Item>
            </Menu>
          </Col>
        </Row>
      </GridContent>
    </Spin>
  );
};
