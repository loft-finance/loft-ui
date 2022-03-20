import { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Form, Input, message } from 'antd';
import { history } from 'umi';
import { TokenIcon } from '@aave/aave-ui-kit';
import Bignumber from '@/components/Bignumber';
import { valueToBigNumber } from '@aave/protocol-js';
import Back from '@/components/Back';
import styles from './amount.less';

export default ({ poolReserve, maxAmountToRepay }: any) => {
  const symbol = poolReserve?poolReserve.symbol:''
  const [form] = Form.useForm();
  useEffect(() => {
    
  }, []);

  const handler = {
    submit(values: any) {
      const amount = valueToBigNumber(values.amount)
      if(amount.gt(maxAmountToRepay)){
        message.error('The quality must be less than max amount to repay')
        return;
      }
      history.push(`/loan/repay/${poolReserve.underlyingAsset}/${poolReserve.id}/confirm/${values.amount}`);
    },
    max(){
      form.setFieldsValue({
        amount: maxAmountToRepay.toString()
      })
    }
  };

  return (
    <Card bordered={false}>
      <Back />
      <Card bordered={false}>
          <div className={styles.desc}>
            <div className={styles.title}>Repay</div>
            <div className={styles.text}>How much do you want to repay</div>
          </div>
          <div className={styles.form}>
            <Row>
              <Col span={8} offset={8}>
                <Form
                  name="basic"
                  form={form}
                  layout={'vertical'}
                  onFinish={handler.submit}
                  autoComplete="off"
                >
                  <div className={styles.able}>
                    <span>Able to repay</span>
                    <span className={styles.amount}><Bignumber value={maxAmountToRepay} /> {symbol}</span>
                  </div>
                  <Form.Item
                    name="amount"
                    rules={[{ required: true, message: 'Please input quantity!' }]}
                  >
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Quantity"
                      prefix={<TokenIcon 
                        tokenSymbol={symbol}
                        height={20}
                        width={20}
                        tokenFullName={''}
                        className="MarketTableItem__token"
                      />}
                      suffix={<a onClick={handler.max}>Max</a>}
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
};
