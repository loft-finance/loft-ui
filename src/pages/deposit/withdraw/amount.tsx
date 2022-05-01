import { useEffect } from 'react';
import { Card, Row, Col, Button, Form, Input, message } from 'antd';
import { history, FormattedMessage } from 'umi';
import { TokenIcon } from '@aave/aave-ui-kit';
import Bignumber from '@/components/Bignumber';
import Back from '@/components/Back';
import styles from './amount.less';
import { valueToBigNumber } from '@aave/protocol-js';

export default ({ poolReserve, maxUserAmountToWithdraw }: any) => {
  const symbol = poolReserve?poolReserve.symbol:''
  const [form] = Form.useForm();
  useEffect(() => {
    
  }, []);

  const handler = {
    submit(values: any) {
      const amount = valueToBigNumber(values.amount)
      if(amount.gt(maxUserAmountToWithdraw)){
        message.error('The quality must be less than max amount to withdraw')
        return;
      }
      history.push(`/deposit/withdraw/${poolReserve.underlyingAsset}/${poolReserve.id}/confirm/${values.amount}`);
    },
    max(){
      form.setFieldsValue({
        amount: maxUserAmountToWithdraw.toString()
      })
    }
  };
  
  return (
    <Card bordered={false}>
      <Back />
      <Card bordered={false}>
          <div className={styles.desc}>
            <div className={styles.title}><FormattedMessage id="pages.deposit.withdraw.amount.title" /></div>
            <div className={styles.text}><FormattedMessage id="pages.deposit.withdraw.amount.desc" /></div>
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
                    <span><FormattedMessage id="pages.deposit.withdraw.amount.available" /></span>
                    <span className={styles.amount}><Bignumber value={maxUserAmountToWithdraw || '0'} /> {symbol}</span>
                  </div>
                  <Form.Item
                    name="amount"
                    rules={[{ required: true, message: <FormattedMessage id="pages.deposit.withdraw.amount.validate" /> }]}
                  >
                    <Input
                      style={{ width: '100%' }}
                      placeholder="Amount"
                      prefix={<TokenIcon 
                        tokenSymbol={symbol}
                        height={20}
                        width={20}
                        tokenFullName={''}
                        className="MarketTableItem__token"
                      />}
                      suffix={<a onClick={handler.max}><FormattedMessage id="pages.deposit.withdraw.amount.max" /></a>}
                    />
                  </Form.Item>

                  <Form.Item wrapperCol={{ offset: 2, span: 20 }}>
                    <Button block type="primary" htmlType="submit" disabled={maxUserAmountToWithdraw == '0'}>
                      <FormattedMessage id="pages.deposit.withdraw.amount.button" />
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
