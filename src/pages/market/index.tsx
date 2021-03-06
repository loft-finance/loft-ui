import { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Row, Col, Card, Button, Image, Spin } from 'antd';
import { history, useModel, FormattedMessage, useLocation } from 'umi';
import { valueToBigNumber } from '@aave/protocol-js';
import { TokenIcon } from '@aave/aave-ui-kit';
import { normalize } from '@aave/math-utils';

import Bignumber from '@/components/Bignumber'
import Percent from '@/components/Percent'

import styles from './style.less';
import { numberWithCommas } from '@/utils';


export default () => {
  const location = useLocation();
  const { reserves, baseCurrency } = useModel('pool', res => ({
    reserves: res.reserves,
    baseCurrency: res.baseCurrency
  }))
  const { reserveIncentives } = useModel('incentives', res => ({
    reserveIncentives: res.reserveIncentives
  }))
  const { updateDom } = useModel('domUpdateDid');

  let list: any = []

  let totalLockedInUsd = valueToBigNumber('0');
  let totalLockedLiquidity = valueToBigNumber('0');
  const marketRefPriceInUsd = normalize(baseCurrency?.marketReferenceCurrencyPriceInUsd || '0', 8)
  if (reserves) {
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

        totalLockedLiquidity = totalLockedLiquidity.plus(valueToBigNumber(reserve.totalLiquidity))


        const totalBorrows = Number(reserve.totalDebt);
        const totalBorrowsInUSD = valueToBigNumber(reserve.totalDebt)
          .multipliedBy(reserve.priceInMarketReferenceCurrency)
          .multipliedBy(marketRefPriceInUsd)
          .toNumber();
        const reserveIncentiveData = reserveIncentives[reserve.underlyingAsset.toLowerCase()] || false;
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

  // console.log('data:', totalLockedInUsd)

  const handler = {
    detail(record: any) {
      history.push(`/market/detail/${record.underlyingAsset}/${record.id}`);
    }
  };

  const columns: any = [
    {
      title: <FormattedMessage id="pages.market.index.table.collumn.assets" />,
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
      title: <FormattedMessage id="pages.market.index.table.collumn.MarketSize" />,
      dataIndex: 'totalBorrows',
      width: 200,
      render: (text: any, record: any) => {
        return record.isPriceInUSD ? <>$ <Bignumber on={true} value={record.totalLiquidityInUSD} /></> : <Bignumber on={true} value={record.totalLiquidity} />
      },
      sorter: (a: any, b: any) => a.totalBorrows - b.totalBorrows
    },
    {
      title: <FormattedMessage id="pages.market.index.table.collumn.TotalBorrowings" />,
      dataIndex: 'totalBorrowsInUSD',
      render: (text: any, record: any) => {
        return text < 0 ? <>--</> : <>$ <Bignumber on={true} value={text} /></>
      },
      width: 200,
      align: 'center',
      sorter: (a: any, b: any) => a.totalBorrowsInUSD - b.totalBorrowsInUSD
    },
    {
      title: <FormattedMessage id="pages.market.index.table.collumn.DepositApy" />,
      dataIndex: 'depositAPY',
      render: (text: any, record: any) => {
        return <div className={styles.TagBox}>
          <Percent value={text} /> 
          <div className={styles.tag}><span className={styles.tagloft}>loft</span><Percent value={record.aincentivesAPR} /> <span>APR</span></div>
          </div>
      },
      align: 'center',
      sorter: (a: any, b: any) => a.depositAPY - b.depositAPY
    },
    {
      title: <FormattedMessage id="pages.market.index.table.collumn.BorrowingRate" />,
      dataIndex: 'variableBorrowRate',
      align: 'center',
      render: (text: any, record: any) => {
        return <div className={styles.TagBox}><Percent value={text} /> <div className={styles.tag}><span className={styles.tagloft}>loft</span><Percent value={record.vincentivesAPR} /> <span>APR</span></div></div>
      },
      sorter: (a: any, b: any) => a.variableBorrowRate - b.variableBorrowRate
    },
  ];

  const PageHeaderContent = ({ }) => {
    return (
      <div className={styles.pageHeaderContent}>
        <div className={styles.main}>
          <Row>
            <Col span={16}>
              <div className={styles.text}>
                <FormattedMessage id="pages.market.index.describe" />
              </div>
              <div className={styles.value}>$ {numberWithCommas(totalLockedInUsd.toNumber())}</div>
              <div>
                <Button type="primary" size="large" style={{ width: 200 }}>
                  <FormattedMessage id="pages.market.index.button" />
                </Button>
              </div>
            </Col>
            <Col span={6}>
              <Image width={260} preview={false} src="/homeimg@3x.png" />
            </Col>
          </Row>
        </div>
        <div style={{ margin: 15, marginBottom: -30 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div className={styles.value}>
                  <Bignumber on={true} value={totalLockedLiquidity} />
                </div>
                <div className={styles.title}><FormattedMessage id="pages.market.index.info.pledge" /></div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div style={{ color: '#FF5E2C' }} className={styles.value}>
                  $<Bignumber on={true} value={marketRefPriceInUsd} />
                </div>
                <div className={styles.title}><FormattedMessage id="pages.market.index.info.price" /></div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div style={{ color: '#6464E7' }} className={styles.value}>
                  5.3M
                </div>
                <div className={styles.title}><FormattedMessage id="pages.market.index.info.fluidity" /></div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div style={{ color: '#FF5E2C' }} className={styles.value}>
                  $ <Bignumber on={true} value={totalLockedInUsd.toNumber()} />
                </div>
                <div className={styles.title}><FormattedMessage id="pages.market.index.info.value" /></div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  useEffect(() => {
    updateDom();
  }, [reserves, location.pathname]);

  return (
    <Spin spinning={!list || !list.length}>
      <PageContainer breadcrumb={false} title={false} content={<PageHeaderContent />}>
        <div style={{ marginTop: 50, }} className={styles.newmain}>
          <Table
            rowKey={'id'}
            columns={columns}
            dataSource={list}
            loading={!list || !list.length}
            onRow={(record) => ({ onClick: () => handler.detail(record) })}
            pagination={false}
          // scroll={{ y: 400 }}
          />
        </div>
      </PageContainer>
    </Spin>
  );
};
