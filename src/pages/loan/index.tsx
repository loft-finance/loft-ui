import { useEffect, useState } from 'react';
import { useModel, history, FormattedMessage } from 'umi';
import { Table, Row, Col, Menu, Radio, Input, Spin } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import { valueToBigNumber, BigNumber } from '@aave/protocol-js';
import { isAssetStable } from '@/lib/config/assets'
import { TokenIcon } from '@aave/aave-ui-kit';

import styles from './style.less';
import { fixedToValue } from '@/utils';
import Percent from '@/components/Percent';

const { Search } = Input;


export default () => {
  const [searchValue, setSearchValue] = useState('');
  const [showOnlyStableCoins, setShowOnlyStableCoins] = useState(false);
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const { reserves, baseCurrency, user } = useModel('pool', res => ({
    reserves: res.reserves,
    baseCurrency: res.baseCurrency,
    user: res.user
  }))
  const { updateDom } = useModel('domUpdateDid');

  const marketRefPriceInUsd = baseCurrency.marketRefPriceInUsd

  const { reserveIncentives } = useModel('incentives', res => ({
    reserveIncentives: res.reserveIncentives
  }))

  const { account } = useModel('wallet', res => ({
    account: res.account,
  }))

  const availableBorrowsMarketReferenceCurrency = valueToBigNumber(
    user?.availableBorrowsMarketReferenceCurrency || 0
  );

  const filteredReserves = reserves.filter(
    (reserve: any) =>
      reserve.symbol.toLowerCase().includes(searchValue.toLowerCase()) &&
      reserve.isActive &&
      (!showOnlyStableCoins || isAssetStable(reserve.symbol))
  );

  const list = (withFilter: boolean) => {
    const data = (reserves: any) =>
      reserves.map((reserve: any) => {
        const availableBorrows = account && availableBorrowsMarketReferenceCurrency.gt(0)
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
            account && user?.userReservesData.find((userReserve: any) => userReserve.reserve.id === reserve.id)
              ?.totalBorrows || '0',
          currentBorrowsInUSD:
            account && user?.userReservesData.find((userReserve: any) => userReserve.reserve.id === reserve.id)
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
    detail(record: any) {
      history.push(`/loan/detail/${record.underlyingAsset}/${record.id}`);
    },
    // data() {
    //   reserves.map((reserve: any) => {
    //     const userReserve = user?.userReservesData.find(
    //       (userRes: any) => userRes.reserve.symbol === reserve.symbol
    //     );
    //     const walletBalance =
    //       walletData[reserve.underlyingAsset] === '0'
    //         ? valueToBigNumber('0')
    //         : valueToBigNumber(walletData[reserve.underlyingAsset] || '0').dividedBy(
    //           valueToBigNumber('10').pow(reserve.decimals)
    //         );
    //     const walletBalanceInUSD = walletBalance
    //       .multipliedBy(reserve.priceInMarketReferenceCurrency)
    //       .multipliedBy(marketRefPriceInUsd)
    //       .toString();
    //     const reserveIncentiveData = reserveIncentives[reserve.underlyingAsset.toLowerCase()];
    //     return {
    //       ...reserve,
    //       walletBalance,
    //       walletBalanceInUSD,
    //       underlyingBalance: userReserve ? userReserve.underlyingBalance : '0',
    //       underlyingBalanceInUSD: userReserve ? userReserve.underlyingBalanceUSD : '0',
    //       liquidityRate: reserve.supplyAPY,
    //       avg30DaysLiquidityRate: Number(reserve.avg30DaysLiquidityRate),
    //       borrowingEnabled: reserve.borrowingEnabled,
    //       interestHistory: [],
    //       aincentivesAPR: reserveIncentiveData
    //         ? reserveIncentiveData.aIncentives.incentiveAPR
    //         : '0',
    //       vincentivesAPR: reserveIncentiveData
    //         ? reserveIncentiveData.vIncentives.incentiveAPR
    //         : '0',
    //       sincentivesAPR: reserveIncentiveData
    //         ? reserveIncentiveData.sIncentives.incentiveAPR
    //         : '0',
    //     };
    //   });
    // },
    search(value: string) {
      setSearchValue(value)
    },
    marketDetail(record: any) {
      history.push(`/market/detail/${record.underlyingAsset}/${record.id}`);
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
      title: <FormattedMessage id="pages.loan.index.table.col.available" />,
      dataIndex: 'availableBorrows',
      render: (text: any) => {
        return fixedToValue(text)
      }
    },
    {
      title: <FormattedMessage id="pages.loan.index.table.col.BorrowApy" />,
      dataIndex: 'variableBorrowRate',
      width: 200,
      render: (text: any) => {
        return <Percent value={text} />
      },
      sorter: (a: any, b: any) => a.variableBorrowRate - b.variableBorrowRate
    },
  ];

  const totalValue = list(false).reduce((a: any, b: any) => a + (+b['currentBorrowsInUSD'] || 0), 0)

  useEffect(() => {
    updateDom();
  }, [reserves]);

  return (
    <Spin spinning={!reserves || !reserves.length}>
      <GridContent>
        <Row>
          <Col span={12}>
            <Radio.Group defaultValue={showOnlyStableCoins ? "stable" : "all"} buttonStyle="solid" onChange={(e) => { setShowOnlyStableCoins(e.target.value === 'stable') }} >
              <Radio.Button value="all" style={{ width: 112, textAlign: 'center' }}><FormattedMessage id="pages.loan.index.filter.all" /></Radio.Button>
              <Radio.Button value="stable"><FormattedMessage id="pages.loan.index.filter.stable" /></Radio.Button>
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
              // scroll={{ y: 600 }}
              onRow={(record) => ({ onClick: () => handler.detail(record) })}
            />
          </Col>
          <Col style={{ marginTop: 20 }} span={6} offset={1}>
            <Menu className={styles.menu} selectable={false}>
              <Menu.Item
                key="header"
                style={{ borderRadius: '3px 3px 0 0', background: '#151515', color: '#fff' }}
              >
                <FormattedMessage id="pages.loan.index.my" />
              </Menu.Item>
              {list(false).map((item: any, index: number) =>
                item.currentBorrows.toString() > '0' &&
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
                      <span className={styles.value}>{fixedToValue(item.currentBorrows.toString())}</span>
                    </Col>
                  </Row>
                </Menu.Item>
              )}
              {totalValue > 0 && <Menu.Divider />}
              <Menu.Item key="total">
                <FormattedMessage id="pages.loan.index.my.total" />
                <span className={styles.value}>{fixedToValue(totalValue)}</span>
              </Menu.Item>
            </Menu>
          </Col>
        </Row>
      </GridContent>
    </Spin>
  );
};
