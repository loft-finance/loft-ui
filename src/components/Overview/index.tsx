import { Row, Col, Card, Descriptions } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './style.less';

export default ({ title = '', items = [] }) => {
  return (
    <div className={styles.overview}>
      <Card bordered={false}>
        <Row>
          <Col span={9} offset={1} className={styles.title}>
            Deposit to FTM
          </Col>
          <Col span={9} offset={4} className={styles.title}>
            Fantom Reserve Overview
          </Col>
        </Row>
        <Row>
          <Col span={9} offset={1}>
            <Descriptions
              labelStyle={{ color: '#696D85' }}
              contentStyle={{ justifyContent: 'end', color: '#29292D', fontWeight: 'bold' }}
            >
              <Descriptions.Item label="Utilization rate" span={3}>
                50.52%
              </Descriptions.Item>
              <Descriptions.Item label="Available liquidity" span={3}>
                118,373,674.27901 FTM
              </Descriptions.Item>
              <Descriptions.Item label="Deposit APY (Annual Yield)" span={3}>
                9.74%
              </Descriptions.Item>
              <Descriptions.Item label="Deposit APY (Annual Yield)" span={3}>
                yes
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={9} offset={4}>
            <Descriptions
              labelStyle={{ color: '#696D85' }}
              contentStyle={{ justifyContent: 'end', color: '#29292D', fontWeight: 'bold' }}
            >
              <Descriptions.Item label="Utilization rate" span={3}>
                50.52%
              </Descriptions.Item>
              <Descriptions.Item label="Available liquidity" span={3}>
                118,373,674.27901 FTM
              </Descriptions.Item>
              <Descriptions.Item label="Deposit APY (Annual Yield)" span={3}>
                9.74%
              </Descriptions.Item>
              <Descriptions.Item label="Deposit APY (Annual Yield)" span={3}>
                yes
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
