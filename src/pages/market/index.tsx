import { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Row, Col, Card, Button, Image } from 'antd';
import { history } from 'umi';

import styles from './style.less';

export default () => {
  
  const loadData = async () => {
    
  }

  useEffect(() => {
    loadData()
  },[])

  const handler = {
    detail(record) {
      history.push('/market/detail/' + record.key);
    },
  };

  const columns = [
    {
      title: 'Assets',
      dataIndex: 'name',
    },
    {
      title: 'Market Size',
      dataIndex: 'chinese',
      sorter: {
        compare: (a, b) => a.chinese - b.chinese,
        multiple: 3,
      },
    },
    {
      title: 'total borrowings',
      dataIndex: 'math',
      sorter: {
        compare: (a, b) => a.math - b.math,
        multiple: 2,
      },
    },
    {
      title: 'deposit APY  (annual rate of return)',
      dataIndex: 'english',
      sorter: {
        compare: (a, b) => a.english - b.english,
        multiple: 1,
      },
    },
    {
      title: 'annual interest rate of borrowing',
      dataIndex: 'english',
      sorter: {
        compare: (a, b) => a.english - b.english,
        multiple: 1,
      },
    },
  ];

  const data = [
    {
      key: '1',
      name: 'John Brown',
      chinese: 98,
      math: 60,
      english: 70,
    },
    {
      key: '2',
      name: 'Jim Green',
      chinese: 98,
      math: 66,
      english: 89,
    },
    {
      key: '3',
      name: 'Joe Black',
      chinese: 98,
      math: 90,
      english: 70,
    },
    {
      key: '4',
      name: 'Jim Red',
      chinese: 88,
      math: 99,
      english: 89,
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
              <div className={styles.value}>$ 212,452,680.86</div>
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
    <PageContainer breadcrumb={false} title={false} content={<PageHeaderContent />}>
      <Table
        rowKey={'name'}
        columns={columns}
        dataSource={data}
        onRow={(record) => ({ onClick: () => handler.detail(record) })}
        pagination={false}
      />
    </PageContainer>
  );
};
