import { useEffect, useRef, useState } from 'react';
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
import Percent from '@/components/Percent';

const price = config.loft.price

export default () => {
  const symbol = 'LOFT'
  const { account } = useModel('wallet', res => ({
    account: res.account
  }))
  const { updateDom } = useModel('domUpdateDid');

  const { loftRewardPerYear, loftApy, balanceLoft, depositedLoft, earnedLoft, isLoftAllowanceEnough, loftApprove, loftDeposit, loftWithdraw, getLoftAPY } = useModel('pledge', res => ({
    loftRewardPerYear: res.loftRewardPerYear,
    loftApy: res.loftApy,
    balanceLoft: res.balanceLoft,
    depositedLoft: res.depositedLoft,
    earnedLoft: res.earnedLoft,
    isLoftAllowanceEnough: res.isLoftAllowanceEnough,
    loftApprove: res.loftApprove,
    loftDeposit: res.loftDeposit,
    loftWithdraw: res.loftWithdraw,
  }))


  const [form] = Form.useForm();
  const refAmount = useRef()
  const refConfirm = useRef()

  useEffect(() => {
    updateDom();
  }, []);

  const handler = {
    submit(values: any) {
      form
        .validateFields()
        .then(values => {
          const amount = valueToBigNumber(values.amount)
          if (amount.gt(balanceLoft)) {
            message.error('The quality must be less than max amount to deposit')
            return;
          }
          const txt = {
            overview: {
              title: 'Stake Overview',
              desc: 'These are your transaction details. Please be sure to check whether it is correct before submiting.'
            },
            approve: {
              title: 'approve',
              buttonText: 'approve',
              stepText: 'approve',
              description: 'Please approve before confirming',
            },
            confirm: {
              title: 'Stake',
              buttonText: 'Stake',
              stepText: 'Stake',
              description: '',
            },
            completed: {
              title: 'Completed',
              buttonText: 'My Dashboard',
              stepText: 'Success',
              description: '',
            },
          };
          (refConfirm as any).current.show({
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
    max() {
      form.setFieldsValue({
        amount: balanceLoft.toString()
      })
    },
    withdraw: {
      principal: {
        amount() {
          const txt = {
            title: 'How much would you like to unstake?',
            desc: 'Please enter the amount to be unstake, the maximum amount you can unstake is shown below',
            available: 'Available to stake',
            max: 'Max',
            validate: 'Please input the correct amount',
            button: 'Unstake'
          };

          (refAmount as any).current.show({
            title: 'Withdraw Loft',
            txt,
            max: depositedLoft,
            ok: handler.withdraw.principal.amountOk
          })
        },
        amountOk({ amount }: any) {
          (refAmount as any).current.close();

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
              buttonText: 'My Dashboard',
              stepText: 'Success',
              description: '',
            },
          };
          (refConfirm as any).current.show({
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
            title: 'Claim LOFT Overview',
            desc: 'These are your transaction details. Please be sure to check whether it is correct before submiting.'
          },
          approve: {
            title: 'approve',
            buttonText: 'approve',
            stepText: 'approve',
            description: 'Please approve before confirming',
          },
          confirm: {
            title: 'claim',
            buttonText: 'claim',
            stepText: 'claim',
            description: '',
          },
          completed: {
            title: 'Completed',
            buttonText: 'My Dashboard',
            stepText: 'Success',
            description: '',
          },
        };

        (refConfirm as any).current.show({
          title: 'Claim LOFT',
          earned: true,
          amount: earnedLoft,
          amountInUsd: loftToUsd(earnedLoft),
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
              value: <Bignumber on={true} value={depositedLoft} />,
              tag: <>($<Bignumber on={true} value={account ? loftToUsd(depositedLoft) : valueToBigNumber(0)} />)</>,
            },
            {
              title: <FormattedMessage id="pages.manage.info.price" />,
              value: '$' + price,
            },
            {
              title: <FormattedMessage id="pages.manage.info.fluidity" />,
              value: '5.3M',
              tag: '(28.5 % LOCKED)',
            },
            {
              title: <FormattedMessage id="pages.manage.info.market" />,
              value: '$49.4M',
            },
          ]}
        />

        {!account && <WalletDisconnected showBack={false} subTitle="We couldn???t detect a wallet. Connect a wallet to stake." />}
        {account && (
          <Row>
            <Col span={10} style={{ paddingRight: 15 }}>
              <Card bordered={false}>
                <Row>
                  <Col span={18}>
                    <Title level={3}><FormattedMessage id="pages.manage.stake.title" /></Title>
                  </Col>
                  <Col span={6}>APY <Percent value={loftApy} /></Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <p className={styles.tip}>
                      <FormattedMessage id="pages.manage.stake.desc" />
                    </p>
                  </Col>
                  <Col span={24}>
                    <p className={styles.tip}><FormattedMessage id="pages.manage.stake.balance" /></p>
                    <p><Bignumber value={balanceLoft} /> {symbol}</p>
                  </Col>
                </Row>

                <Row className={styles.form}>
                  <Col span={14}>
                    <Form form={form} name="basic" layout={'vertical'} autoComplete="off">
                      <Form.Item
                        name="amount"
                        rules={[{ required: true, message: 'Please input the correct amount' }]}
                      >
                        <Input
                          style={{ width: '100%' }}
                          placeholder="Amount"
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
                    <Button shape="round" disabled={!account || depositedLoft.eq('0')} onClick={handler.withdraw.principal.amount}>
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
                  {/* <Col span={10}>
                    <p className={styles.tip}>
                      <FormattedMessage id="pages.manage.unlocked.desc" />
                    </p>
                  </Col> */}
                  <Col span={16}>
                    <p className={styles.tip}>
                      <Bignumber value={earnedLoft} /> {symbol}
                    </p>
                  </Col>
                  <Col span={6} >
                    <Button type="primary" shape="round" disabled={!account || earnedLoft.eq('0')} onClick={handler.withdraw.earned}>
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
                  <Col span={8}> LOFT</Col>
                  <Col span={8}>1.40029</Col>
                  <Col span={8} className={styles.tag}>
                    $0 USD
                  </Col>
                </Row>
                <Row className={styles.row}>
                  <Col span={8}> LOFT</Col>
                  <Col span={8}>1.40029</Col>
                  <Col span={8} className={styles.tag}>
                    $0 USD
                  </Col>
                </Row>
                <Row className={styles.row}>
                  <Col span={8}> LOFT</Col>
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
