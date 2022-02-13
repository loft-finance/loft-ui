import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Descriptions,
  InputNumber,
  Steps,
  Divider,
  Badge,
} from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import Back from '@/components/Back';
import styles from './Deposit.less';
const { Step } = Steps;

export default ({ wallet }) => {
  const [quantity, setQuantity] = useState(0);
  const [steps, setSteps] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (wallet) {
      const { balance, auth } = wallet;
      if (auth) {
        setSteps([
          {
            key: 'deposit',
            title: 'Deposit',
            buttonText: 'deposit',
          },
          {
            key: 'completed',
            title: 'Completed',
            buttonText: 'completed',
          },
        ]);
      } else {
        setSteps([
          {
            key: 'approval',
            title: 'Approval',
            buttonText: 'approval',
          },
          {
            key: 'deposit',
            title: 'Deposit',
            buttonText: 'deposit',
          },
          {
            key: 'completed',
            title: 'Completed',
            buttonText: 'completed',
          },
        ]);
      }
    }
  }, [wallet]);

  const handler = {
    quantity(values) {
      setQuantity(values.quantity);
    },
    submit() {
      setCurrent(current + 1);
    },
  };

  return (
    <Card bordered={false}>
      <Back />
      <Card bordered={false}>
        {!quantity && (
          <>
            <div className={styles.desc}>
              <div className={styles.title}>How much do you want to deposit</div>
              <div className={styles.text}>
                Please enter the amount to be deposited, the maximum amount you
              </div>
            </div>
            <div className={styles.form}>
              <Row>
                <Col span={8} offset={8}>
                  <Form
                    name="basic"
                    layout={'vertical'}
                    onFinish={handler.quantity}
                    autoComplete="off"
                  >
                    <div className={styles.able}>
                      <span>Available for deposit</span>
                      <span className={styles.amount}>6.296457 FUSDT</span>
                    </div>
                    <Form.Item
                      name="quantity"
                      rules={[{ required: true, message: 'Please input quantity!' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Quantity"
                        prefix={<DollarCircleOutlined className="site-form-item-icon" />}
                        suffix={<a>Max</a>}
                      />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 2, span: 20 }}>
                      <Button block type="primary" htmlType="submit">
                        Continue
                      </Button>
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
            </div>
          </>
        )}
        {quantity > 0 && (
          <>
            <Row>
              <Col span={12} offset={6}>
                <div className={styles.desc}>
                  <div className={styles.title}>Deposit overview</div>
                  <div className={styles.text}>
                    These are your transaction details. Please be sure to check whether it is
                    correct before submitting
                  </div>
                </div>
              </Col>
            </Row>
            <div>
              <Row>
                <Col span={10} offset={7} className={styles.info}>
                  <Descriptions
                    labelStyle={{ color: '#696D85' }}
                    contentStyle={{ justifyContent: 'end', color: '#29292D', fontWeight: 'bold' }}
                  >
                    <Descriptions.Item label="Quantity" span={3}>
                      {quantity}
                    </Descriptions.Item>
                    <Descriptions.Item
                      span={3}
                      contentStyle={{
                        color: '#696D85',
                        fontSize: 12,
                        fontWeight: 500,
                        marginTop: -20,
                      }}
                    >
                      $1.000029
                    </Descriptions.Item>
                    <Descriptions.Item
                      label="Collateral Usage"
                      span={3}
                      contentStyle={{ color: '#3163E2' }}
                    >
                      yes
                    </Descriptions.Item>
                    <Descriptions.Item
                      label="New health factors"
                      span={3}
                      contentStyle={{ color: '#3163E2' }}
                    >
                      14.12
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </div>
            <Row>
              <Col span={10} offset={7} style={{ marginBottom: 20 }}>
                <Steps
                  type="navigation"
                  size="small"
                  current={current}
                  className="site-navigation-steps"
                >
                  {steps.map((item) => (
                    <Step title={item.title} />
                  ))}
                </Steps>
              </Col>
              <Col span={7} offset={7}>
                <p className={styles.tip}>
                  {current + 1}/{steps.length} {steps[current].title}
                </p>
                <p className={styles.tip}>
                  The transaction failed for the following reasons:Please approve before depositing
                </p>
                <p className={styles.tip} style={{ color: '#F46D6D' }}>
                  Please approve before depositing
                </p>
              </Col>
              <Col span={3}>
                <Button type="primary" shape="round" onClick={handler.submit}>
                  {steps[current].buttonText}
                </Button>
              </Col>
              <Col span={10} offset={7}>
                <Divider style={{ margin: '12px 0' }} />
              </Col>
              <Col span={10} offset={7}>
                <Row>
                  <Col span={8}>approval</Col>
                  <Col span={8}>
                    confirmed <Badge status="success" />
                  </Col>
                  <Col span={8}>Explorer</Col>
                  <Col span={8}>deposit</Col>
                  <Col span={8}>
                    confirmed <Badge status="processing" />
                  </Col>
                  <Col span={8}>Explorer</Col>
                </Row>
              </Col>
            </Row>
          </>
        )}
      </Card>
    </Card>
  );
};