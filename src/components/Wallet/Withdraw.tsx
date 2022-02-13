import { Card, Row, Col, Button, Form, Input } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import Back from '@/components/Back';
import styles from './Withdraw.less';

export default () => (
  <Card bordered={false}>
    <Back />
    <Card bordered={false}>
      <div className={styles.desc}>
        <div className={styles.title}>Withdrawal</div>
        <div className={styles.text}>How much do you want to withdraw</div>
      </div>
      <div className={styles.form}>
        <Row>
          <Col span={8} offset={8}>
            <Form name="basic" layout={'vertical'} autoComplete="off">
              <div className={styles.able}>
                <span>Able to withdraw</span>
                <span className={styles.amount}>6.296457 FUSDT</span>
              </div>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input
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
    </Card>
  </Card>
);
