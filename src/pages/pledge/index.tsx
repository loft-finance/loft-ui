import { useRef, useState } from 'react';
import { Card, Row, Col, Button, Form, Input, message } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import { useModel, FormattedMessage } from 'umi';
import { valueToBigNumber } from '@aave/math-utils';
import { TokenIcon } from '@aave/aave-ui-kit';
import Bignumber from '@/components/Bignumber'
import { lpToUsd } from '@/lib/helpers/utils';
import Amount from './Amount';
import Confirm from './Confirm'
import styles from './index.less'

export default () => {
  const symbol = ''

  const { wallet } = useModel('wallet');
  const { lpRewardPerYear, lpApy, balanceLp, depositedLp, earnedLp, isLpAllowanceEnough, lpApprove, lpDeposit, lpWithdraw } = useModel('pledge', res => ({
    lpRewardPerYear: res.lpRewardPerYear,
    lpApy: res.lpApy,
    balanceLp: res.balanceLp,
    depositedLp: res.depositedLp,
    earnedLp: res.earnedLp,
    isLpAllowanceEnough: res.isLpAllowanceEnough,
    lpApprove: res.lpApprove,
    lpDeposit: res.lpDeposit,
    lpWithdraw: res.lpWithdraw,
  }))
  
  const [form] = Form.useForm();
  const refAmount = useRef()
  const refConfirm = useRef()

  const handler = {
    submit(values: any) {
      const amount = valueToBigNumber(values.amount)
      if(amount.gt(balanceLp)){
        message.error('The quality must be less than max amount to deposit')
        return;
      }
      const txt = {
        overview: {
          title: 'Pledge Overview',
          desc: 'These are your transaction details. Please be sure to check whether it is correct before submiting.'
        },
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
        title: 'Stake',
        amount,
        amountInUsd: lpToUsd(amount),
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
    withdraw: {
      principal: {
        amount(){
          const txt = {
            title: 'How much do you want to unstake?',
            desc: 'Provide GEIST/FTM liquidity on SpookySwap and stake the LP token here to earn more GEIST',
            available: 'Can be pledge',
            max: 'Max',
            validate: 'Please input quantity!',
            button: 'Unstake'
          }
  
          refAmount.current.show({
            title: 'Unstake',
            txt,
            max: depositedLp,
            ok: handler.withdraw.principal.amountOk
          })
        },
        amountOk({ amount }: any){
          refAmount.current.close();
  
          const txt = {
            overview: {
              title: 'Unstake Overview',
              desc: 'These are your transaction details. Please be sure to check whether it is correct before submiting.'
            },
            approve: {
              title: 'approve',
              buttonText: 'approve',
              stepText: 'approve',
              description: 'Please approve before confirming',
            },
            confirm: {
              title: 'unstake',
              buttonText: 'unstake',
              stepText: 'unstake',
              description: 'Please submit a unstake',
            },
            completed: {
              title: 'Completed',
              buttonText: 'control panel',
              stepText: 'Success',
              description: '',
            },
          }
          refConfirm.current.show({
            title: 'Unstake',
            amount,
            amountInUsd: lpToUsd(amount),
            txt,
            confirm: lpWithdraw
          })
        }
      },
      earned() {
        const txt = {
          overview: {
            title: 'Unstake Earned Overview',
            desc: 'These are your transaction details. Please be sure to check whether it is correct before submiting.'
          },
          approve: {
            title: 'approve',
            buttonText: 'approve',
            stepText: 'approve',
            description: 'Please approve before confirming',
          },
          confirm: {
            title: 'unstake',
            buttonText: 'unstake',
            stepText: 'unstake',
            description: 'Please submit a unstake',
          },
          completed: {
            title: 'Completed',
            buttonText: 'control panel',
            stepText: 'Success',
            description: '',
          },
        }

        refConfirm.current.show({
          title: 'Unstake Earned',
          amount: 0,
          amountInUsd: 0,
          txt,
          confirm: lpWithdraw
        })
      }
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
                    <div className={styles.value}><Bignumber value={wallet?depositedLp:valueToBigNumber(0)} /> ($<Bignumber value={wallet?lpToUsd(depositedLp):valueToBigNumber(0)} /> USD)</div>
                    <div className={styles.button}>
                      <Button type="primary" block disabled={!wallet || depositedLp.eq('0')} onClick={handler.withdraw.principal.amount} >
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
                    <div className={styles.value}><Bignumber value={wallet?earnedLp:valueToBigNumber(0)} /> ($<Bignumber value={wallet?lpToUsd(earnedLp):valueToBigNumber(0)} /> USD)</div>
                    <div className={styles.button}>
                      <Button type="primary" block disabled={!wallet || earnedLp.eq('0')} onClick={handler.withdraw.earned}>
                        <FormattedMessage id="pages.pledge.action.require.button" />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
              <Card bordered={false} className={styles.view} bodyStyle={{padding:'10px 20px'}}>
                <Row>
                  <Col span={14} className={styles.label}><FormattedMessage id="pages.pledge.view.geist" /></Col>
                  <Col span={10} className={styles.value}><Bignumber value={lpRewardPerYear.div(12)} /></Col>
                  <Col span={14} className={styles.label}><FormattedMessage id="pages.pledge.view.annualization" /></Col>
                  <Col span={10} className={styles.value}><Bignumber value={lpApy} />%</Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </GridContent>
    <Amount refs={refAmount} />
    <Confirm refs={refConfirm} />
    </>
  );
};
