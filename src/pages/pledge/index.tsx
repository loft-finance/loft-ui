import { useRef, useState } from 'react';
import { Card, Row, Col, Button, Form, Input, message } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import Back from '@/components/Back';
import { useModel, FormattedMessage } from 'umi';
import { valueToBigNumber } from '@aave/math-utils';
import { TokenIcon } from '@aave/aave-ui-kit';
import Bignumber from '@/components/Bignumber'
import Confirm from './Confirm'
import styles from './index.less'

export default () => {
  const symbol = ''

  const { wallet } = useModel('wallet');
  const { balanceLp, depositedLp, isLpAllowanceEnough, lpApprove, lpDeposit, lpWithdraw } = useModel('pledge')
  
  const [form] = Form.useForm();
  const refConfirm = useRef()

  const handler = {
    submit(values: any) {
      const amount = valueToBigNumber(values.amount)
      if(amount.gt(balanceLp)){
        message.error('The quality must be less than max amount to deposit')
        return;
      }
      const txt = {
        approve: {
          title: 'approve',
          buttonText: 'approve',
          stepText: 'approve',
          description: 'Please approve before confirming',
        },
        confirm: {
          title: 'pledge',
          buttonText: 'pledge',
          stepText: 'pledge',
          description: 'Please submit a pledge',
        },
        completed: {
          title: 'Completed',
          buttonText: 'control panel',
          stepText: 'Success',
          description: '',
        },
      }
      refConfirm.current.show({
        amount,
        txt,
        isAllowanceEnough: isLpAllowanceEnough,
        approve: lpApprove,
        confirm: lpDeposit
      })
    },
    max(){
      form.setFieldsValue({
        amount: balanceLp.toString()
      })
    },
    unstake(){
      const txt = {
        confirm: {
          title: 'withdraw',
          buttonText: 'withdraw',
          stepText: 'withdraw',
          description: 'Please submit a withdraw',
        },
        completed: {
          title: 'Completed',
          buttonText: 'control panel',
          stepText: 'Success',
          description: '',
        },
      }
      const amount = valueToBigNumber('1')
      refConfirm.current.show({
        amount,
        txt,
        confirm: lpWithdraw
      })
    }
  };

  return (
    <>
    <GridContent>
      <Info
        items={[
          {
            title: <FormattedMessage id="pages.pledge.info.funds" />,
            value: '$ 0.00 USD',
          },
        ]}
      />

      <Row>
        <Col span={16}>
          {!wallet && <WalletDisconnected showBack={false} />}
          {wallet &&
          <Card bordered={false}>
            <Back />
            <Card bordered={false}>
                <div className={styles.desc}>
                  <div className={styles.title}><FormattedMessage id="pages.pledge.amount.title" /></div>
                  <div className={styles.text}>
                    <FormattedMessage id="pages.pledge.amount.desc" />
                  </div>
                </div>
                <div className={styles.form}>
                  <Row>
                    <Col span={12} offset={6}>
                      <Form
                        name="basic"
                        form={form}
                        layout={'vertical'}
                        onFinish={handler.submit}
                        autoComplete="off"
                      >
                        <div className={styles.able}>
                          <span><FormattedMessage id="pages.pledge.amount.available" /></span>
                          <span className={styles.amount}><Bignumber value={balanceLp} /> {symbol}</span>
                        </div>
                        <Form.Item
                          name="amount"
                          rules={[{ required: true, message: <FormattedMessage id="pages.pledge.amount.validate" /> }]}
                        >
                          <Input
                            style={{ width: '100%' }}
                            placeholder="Quantity"
                            type={'number'}
                            prefix={<TokenIcon 
                              tokenSymbol={symbol}
                              height={20}
                              width={20}
                              tokenFullName={''}
                              className="MarketTableItem__token"
                            />}
                            suffix={<a onClick={handler.max}><FormattedMessage id="pages.pledge.amount.max" /></a>}
                          />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 2, span: 20 }}>
                          <Button block type="primary" htmlType="submit">
                            <FormattedMessage id="pages.pledge.amount.button" />
                          </Button>
                        </Form.Item>
                      </Form>
                    </Col>
                  </Row>
                </div>
            </Card>
          </Card>
          }
        </Col>
        <Col span={7} offset={1}>
          <Row>
            <Col span={24}>
              <Card bordered={false} className={styles.action}>
                <Row>
                  <Col span={24}>
                    <div className={styles.title}><FormattedMessage id="pages.pledge.action.unstake.title" /></div>
                    <div className={styles.value}>0 ($0 USD)</div>
                    <div className={styles.button}>
                      <Button type="primary" block onClick={handler.unstake} >
                        <FormattedMessage id="pages.pledge.action.unstake.button" />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
              <Card bordered={false} className={styles.action}>
                <Row>
                  <Col span={24}>
                    <div className={styles.title}><FormattedMessage id="pages.pledge.action.require.title" /></div>
                    <div className={styles.value}><Bignumber value={depositedLp} /> ($0 USD)</div>
                    <div className={styles.button}>
                      <Button type="primary" block >
                        <FormattedMessage id="pages.pledge.action.require.button" />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
              <Card bordered={false} className={styles.view} bodyStyle={{padding:'10px 20px'}}>
                <Row>
                  <Col span={14} className={styles.label}><FormattedMessage id="pages.pledge.view.geist" /></Col>
                  <Col span={10} className={styles.value}>0</Col>
                  <Col span={14} className={styles.label}><FormattedMessage id="pages.pledge.view.annualization" /></Col>
                  <Col span={10} className={styles.value}>5.2321%</Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </GridContent>
    <Confirm refs={refConfirm} quality={0} />
    </>
  );
};
