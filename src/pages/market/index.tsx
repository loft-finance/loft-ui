import { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Row, Col, Card, Button, Image, Spin } from 'antd';
import { history, useModel } from 'umi';
import { valueToBigNumber } from '@aave/protocol-js';
import { TokenIcon } from '@aave/aave-ui-kit';
import { normalize } from '@aave/math-utils';

import styles from './style.less';


export default () => {
  const { reserves, baseCurrency } = useModel('pool')
  
  let list: any = []

  let totalLockedInUsd = valueToBigNumber('0');
  const marketRefPriceInUsd = normalize(baseCurrency?.marketReferenceCurrencyPriceInUsd?baseCurrency?.marketReferenceCurrencyPriceInUsd:'0', 8)
  if(reserves){
    list = reserves
    .filter((res: any) => res.isActive && !res.isFrozen)
    .map((reserve: any) => {
      totalLockedInUsd = totalLockedInUsd.plus(
        valueToBigNumber(reserve.totalLiquidity)
          .multipliedBy(reserve.priceInMarketReferenceCurrency)
          .multipliedBy(marketRefPriceInUsd)
      );

      const totalLiquidity = Number(reserve.totalLiquidity);
      const totalLiquidityInUSD = valueToBigNumber(reserve.totalLiquidity)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd)
        .toNumber();

      const totalBorrows = Number(reserve.totalDebt);
      const totalBorrowsInUSD = valueToBigNumber(reserve.totalDebt)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd)
        .toNumber();
      // const reserveIncentiveData = reserveIncentives[reserve.underlyingAsset.toLowerCase()];
      const reserveIncentiveData = false
      return {
        totalLiquidity,
        totalLiquidityInUSD,
        totalBorrows: reserve.borrowingEnabled ? totalBorrows : -1,
        totalBorrowsInUSD: reserve.borrowingEnabled ? totalBorrowsInUSD : -1,
        id: reserve.id,
        underlyingAsset: reserve.underlyingAsset,
        currencySymbol: reserve.symbol,
        depositAPY: reserve.borrowingEnabled ? Number(reserve.supplyAPY) : -1,
        avg30DaysLiquidityRate: Number(reserve.avg30DaysLiquidityRate),
        stableBorrowRate:
          reserve.stableBorrowRateEnabled && reserve.borrowingEnabled
            ? Number(reserve.stableBorrowAPY)
            : -1,
        variableBorrowRate: reserve.borrowingEnabled ? Number(reserve.variableBorrowAPY) : -1,
        avg30DaysVariableRate: Number(reserve.avg30DaysVariableBorrowRate),
        borrowingEnabled: reserve.borrowingEnabled,
        stableBorrowRateEnabled: reserve.stableBorrowRateEnabled,
        isFreezed: reserve.isFrozen,
        aincentivesAPR: reserveIncentiveData ? reserveIncentiveData.aIncentives.incentiveAPR : '0',
        vincentivesAPR: reserveIncentiveData ? reserveIncentiveData.vIncentives.incentiveAPR : '0',
        sincentivesAPR: reserveIncentiveData ? reserveIncentiveData.sIncentives.incentiveAPR : '0',
      };
    });
  }

  // console.log('data:', list)

  useEffect(() => {

  },[])

  const handler = {
    detail(record: any) {
      history.push(`/market/detail/${record.underlyingAsset}/${record.id}`);
    }
  };

  const columns = [
    {
      title: 'Assets',
      dataIndex: 'currencySymbol',
      width: 240,
      render: (text: any, record: any) => {
        return <TokenIcon 
          tokenSymbol={record.currencySymbol}
          height={35}
          width={35}
          tokenFullName={record.currencySymbol}
          className="MarketTableItem__token"
        />
      },
      // align: 'center'
    },
    {
      title: 'Market Size',
      dataIndex: 'totalBorrows',
      width: 200,
      render: (text: any, record: any) => {
        return record.isPriceInUSD ? ('$' +record.totalLiquidityInUSD.toFixed(2)) : record.totalLiquidity.toFixed(2)
      }
    },
    {
      title: 'total borrowings',
      dataIndex: 'totalBorrowsInUSD',
      render: (text: any, record: any) => {
        return text < 0 ? '--' : ( '$ ' + (text ? text.toFixed(2) : text) )
      },
      width: 200,
      align: 'center'
    },
    {
      title: <div style={{textAlign:'center'}}>deposit APY <p>(annual rate of return)</p></div>,
      dataIndex: 'depositAPY',
      render: (text: any, record: any) => {
        return <div className={styles.TagBox}>{text < 0 ? '--' : (text.toFixed(2) + '%')} <div className={styles.tag}>{record.aincentivesAPR}% <span>APR</span></div></div>
      },
      align: 'center'
    },
    {
      title: 'annual interest rate of borrowing',
      dataIndex: 'variableBorrowRate',
      align: 'center',
      render: (text: any, record: any) => {
        return <div className={styles.TagBox}>{text < 0 ? '--' : (text.toFixed(2) + '%')} <div className={styles.tag}>{record.vincentivesAPR}% <span>APR</span></div></div>
      },
    },
  ];

  const PageHeaderContent = ({}) => {
    return (
      <div className={styles.pageHeaderContent}>
        <div className={styles.main}>
          <Row>
            <Col span={12}>
              <div className={styles.text}>
                Is an open source and non-custodial liquidity agreement used to earn interest on
                deposits and borrowed assets
              </div>
              <div className={styles.value}>$ {totalLockedInUsd.toNumber().toFixed(2)}</div>
              <div>
                <Button type="primary" size="large" style={{ width: 200 }}>
                  To trade coins
                </Button>
              </div>
            </Col>
            <Col span={8}>
              <Image width={260} preview={false} src="/homeimg@3x.png" />
            </Col>
          </Row>
        </div>
        <div style={{ margin: 15, marginBottom: -30 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div className={styles.value}>113M</div>
                <div className={styles.title}>Pledge coin</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div style={{ color: '#FF5E2C' }} className={styles.value}>
                  $9.54
                </div>
                <div className={styles.title}>Coin price</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div style={{ color: '#6464E7' }} className={styles.value}>
                  5.3M
                </div>
                <div className={styles.title}>Fluidity</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div style={{ color: '#FF5E2C' }} className={styles.value}>
                  $49.5M
                </div>
                <div className={styles.title}>Market value</div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  return (
    <Spin spinning={!list || !list.length}>
      <PageContainer breadcrumb={false} title={false} content={<PageHeaderContent />}>
        <div style={{marginTop: 50}}>
          <Table
            rowKey={'id'}
            columns={columns}
            dataSource={list}
            loading={!list || !list.length}
            onRow={(record) => ({ onClick: () => handler.detail(record) })}
            pagination={false}
            scroll={{ y: 400 }}
          />
        </div>      
      </PageContainer>
    </Spin>
  );
};
