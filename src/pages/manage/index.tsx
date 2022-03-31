import { Card, Row, Col, Button, Typography, Input, Divider, Form } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import Bignumber from '@/components/Bignumber';
import { useModel, FormattedMessage } from 'umi';
const { Title } = Typography;
import styles from './index.less';

export default () => {
  const { wallet } = useModel('wallet')
  const { balanceLoft, depositedLoft } = useModel('pledge')
  return (
    <GridContent>
      <Info
        items={[
          {
            title: <FormattedMessage id="pages.manage.info.pledge" />,
            value: '2.2M',
            tag: '($21.12MUSD)',
          },
          {
            title: <FormattedMessage id="pages.manage.info.price" />,
            value: '$9.33',
          },
          {
            title: <FormattedMessage id="pages.manage.info.fluidity" />,
            value: '5.3M',
            tag: '(28.5% LOCKED)',
          },
          {
            title: <FormattedMessage id="pages.manage.info.market" />,
            value: '$49.4M',
          },
        ]}
      />

      {!wallet && <WalletDisconnected showBack={false} />}
      {wallet && (
        <Row>
          <Col span={10}>
            <Card bordered={false}>
              <Row>
                <Col span={18}>
                  <Title level={3}><FormattedMessage id="pages.manage.stake.title" /></Title>
                </Col>
                <Col span={6}>APY 452.61%</Col>
              </Row>
              <Row>
                <Col span={24}>
                  <p className={styles.tip}>
                    <FormattedMessage id="pages.manage.stake.desc" />
                  </p>
                </Col>
                <Col span={24}>
                  <p className={styles.tip}><FormattedMessage id="pages.manage.stake.balance" /></p>
                  <p><Bignumber value={balanceLoft} /> GEIST</p>
                </Col>
              </Row>

              <Row className={styles.form}>
                <Col span={15}>
                  <Form name="basic" layout={'vertical'} autoComplete="off">
                    <Form.Item
                      name="quantity"
                      rules={[{ required: true, message: 'Please input quantity!' }]}
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder="Quantity"
                        prefix={<DollarCircleOutlined className="site-form-item-icon" />}
                        suffix={<a><FormattedMessage id="pages.manage.stake.max" /></a>}
                      />
                    </Form.Item>
                  </Form>
                </Col>
                <Col span={4} offset={1}>
                  <Button type="primary" shape="round">
                    <FormattedMessage id="pages.manage.stake.button.stake" />
                  </Button>
                </Col>
                <Col span={4}>
                  <Button shape="round">
                    <FormattedMessage id="pages.manage.stake.button.withdraw" />
                  </Button>
                </Col>
              </Row>
            </Card>
            <Card bordered={false} style={{ marginTop: 15 }}>
              <Row>
                <Col span={18}>
                  <Title level={3}><FormattedMessage id="pages.manage.help.title" /></Title>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <p className={styles.tip}>
                    <FormattedMessage id="pages.manage.help.desc" />
                  </p>
                </Col>
                <Col span={5} offset={19} style={{ marginTop: 18 }}>
                  <Button type="primary" shape="round">
                    <FormattedMessage id="pages.manage.help.button" />
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={13} offset={1}>
            <Card bordered={false}>
              <Row>
                <Col span={18}>
                  <Title level={3}><FormattedMessage id="pages.manage.unlocked.title" /></Title>
                </Col>
              </Row>
              <Row>
                <Col span={10}>
                  <p className={styles.tip}>
                    <FormattedMessage id="pages.manage.unlocked.desc" />
                  </p>
                </Col>
                <Col span={6} offset={1}>
                  <Bignumber value={depositedLoft} /> GEIST
                </Col>
                <Col span={5} offset={1}>
                  <Button type="primary" shape="round">
                    <FormattedMessage id="pages.manage.unlocked.button" />
                  </Button>
                </Col>
              </Row>
            </Card>
            {/* <Card bordered={false} style={{ marginTop: 15 }}>
              <Row>
                <Col span={18}>
                  <Title level={3}>Platform fees</Title>
                </Col>
                <Col span={6}>
                  <Button type="primary" shape="round">
                    Claim all
                  </Button>
                </Col>
              </Row>
              <div className={styles.table}>
                <Row className={styles.head}>
                  <Col span={8}>Token</Col>
                  <Col span={8}>Amount</Col>
                </Row>
                <Divider style={{ margin: 5 }} />
                <Row className={styles.row}>
                  <Col span={8}> GEIST</Col>
                  <Col span={8}>1.40029</Col>
                  <Col span={8} className={styles.tag}>
                    $0 USD
                  </Col>
                </Row>
                <Row className={styles.row}>
                  <Col span={8}> GEIST</Col>
                  <Col span={8}>1.40029</Col>
                  <Col span={8} className={styles.tag}>
                    $0 USD
                  </Col>
                </Row>
                <Row className={styles.row}>
                  <Col span={8}> GEIST</Col>
                  <Col span={8}>1.40029</Col>
                  <Col span={8} className={styles.tag}>
                    $0 USD
                  </Col>
                </Row>
              </div>
            </Card> */}
          </Col>
        </Row>
      )}
    </GridContent>
  );
};
