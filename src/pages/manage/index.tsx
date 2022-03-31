import { useRef, useState } from 'react';
import { Card, Row, Col, Button, Typography, Input, message, Form } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import Bignumber from '@/components/Bignumber';
import Amount from '../pledge/Amount';
import Confirm from '../pledge/Confirm';
import { valueToBigNumber } from '@aave/math-utils';
import { useModel, FormattedMessage } from 'umi';
import { config } from "@/lib/config/pledge"
import { loftToUsd } from '@/lib/helpers/utils';
const { Title } = Typography;
import styles from './index.less';

const price = config.loft.price

export default () => {
  const { wallet } = useModel('wallet')
  const { balanceLoft, depositedLoft, earnedLoft, isLoftAllowanceEnough, loftApprove, loftDeposit, loftWithdraw } = useModel('pledge')
  
  const [form] = Form.useForm();
  const refAmount = useRef()
  const refConfirm = useRef()

  const handler = {
    submit(values: any) {
      form
      .validateFields()
      .then(values => {
        const amount = valueToBigNumber(values.amount)
        if(amount.gt(balanceLoft)){
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
          title: 'Stake Loft',
          amount,
          amountInUsd: loftToUsd(amount),
          txt,
          isAllowanceEnough: isLoftAllowanceEnough,
          approve: loftApprove,
          confirm: loftDeposit
        })
      })
    },
    max(){
      form.setFieldsValue({
        amount: balanceLoft.toString()
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
            title: 'Withdraw Loft',
            txt,
            max: depositedLoft,
            ok: handler.withdraw.principal.amountOk
          })
        },
        amountOk({ amount }: any){
          refAmount.current.close();
  
          const txt = {
            overview: {
              title: 'Withdraw Overview',
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
            title: 'Withdraw',
            amount,
            amountInUsd: loftToUsd(amount),
            txt,
            confirm: loftWithdraw
          })
        }
      },
      earned() {
        const txt = {
          overview: {
            title: 'Withdraw Earned Overview',
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
          title: 'Withdraw Earned',
          amount: 0,
          amountInUsd: 0,
          txt,
          confirm: loftWithdraw
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
            title: <FormattedMessage id="pages.manage.info.pledge" />,
            value: <Bignumber value={depositedLoft} />,
            tag: <>($<Bignumber value={loftToUsd(depositedLoft)} /> USD)</>,
          },
          {
            title: <FormattedMessage id="pages.manage.info.price" />,
            value: '$' + price,
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
          <Col span={10} style={{paddingRight:15}}>
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
                <Col span={14}>
                  <Form form={form} name="basic" layout={'vertical'} autoComplete="off">
                    <Form.Item
                      name="amount"
                      rules={[{ required: true, message: 'Please input quantity!' }]}
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder="Quantity"
                        prefix={<DollarCircleOutlined className="site-form-item-icon" />}
                        suffix={<a onClick={handler.max}><FormattedMessage id="pages.manage.stake.max" /></a>}
                      />
                    </Form.Item>
                  </Form>
                </Col>
                <Col span={4} offset={1}>
                  <Button type="primary" shape="round" onClick={handler.submit}>
                    <FormattedMessage id="pages.manage.stake.button.stake" />
                  </Button>
                </Col>
                <Col span={5}>
                  <Button shape="round" onClick={handler.withdraw.principal.amount}>
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
          <Col span={13}>
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
                  <Bignumber value={earnedLoft} /> GEIST
                </Col>
                <Col span={5} offset={1}>
                  <Button type="primary" shape="round" onClick={handler.withdraw.earned}>
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
    <Amount refs={refAmount} />
    <Confirm refs={refConfirm} />
    </>
  );
};
