import React, { useEffect, useState } from 'react';
import { useModel, history, FormattedMessage } from 'umi';
import { Card, Row, Col, Button, Descriptions, Steps, Divider, Badge, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'
import { BigNumber, calculateHealthFactorFromBalancesBigUnits, valueToBigNumber } from '@aave/protocol-js';
import { normalize } from '@aave/math-utils';
import { sendEthTransaction, TxStatusType } from '@/lib/helpers/send-ethereum-tx';
import Bignumber from '@/components/Bignumber';

import Back from '@/components/Back';
import styles from './confirm.less';
const { Step } = Steps;

export default ({ poolReserve, userReserve, maxAmountToDeposit, changeIsZore, match: { params: { amount: amount0 } }, }: any,) => {
    if (!poolReserve || !userReserve) {
        return <div style={{ textAlign: 'center' }}><Spin /></div>
    }
    const underlyingSymbol = poolReserve?.symbol || ''
    const amount = valueToBigNumber(amount0);


    const [steps, setSteps] = useState<any>([]);
    const [current, setCurrent] = useState(0);
    const [approveTxData, setApproveTxData] = useState<any>(undefined);
    const [actionTxData, setActionTxData] = useState<any>(undefined)
    const [customGasPrice, setCustomGasPrice] = useState<string | null>(null);
    const [records, setRecords] = useState<any>([]);
    const [healthFactorAfter, setHealthFactorAfter] = useState<BigNumber | undefined>(undefined);

    const { user, baseCurrency, refreshPool } = useModel('pool', res => ({
        user: res.user,
        baseCurrency: res.baseCurrency,
        refreshPool: res.refresh
    }))
    const { account, provider, refreshWallet } = useModel('wallet', res => ({
        account: res.account,
        refreshWallet: res.refresh,
        provider: res.provider
    }));
    const { lendingPool } = useModel('lendingPool', res => ({
        lendingPool: res.lendingPool
    }));

    const refresh = () => {
        refreshPool();
        refreshWallet()
    }

    const marketRefPriceInUsd = normalize(baseCurrency?.marketReferenceCurrencyPriceInUsd || '0', 8)
    const amountIntEth = amount.multipliedBy(poolReserve.priceInMarketReferenceCurrency || '0');
    const amountInUsd = amountIntEth.multipliedBy(marketRefPriceInUsd);
    const totalCollateralMarketReferenceCurrencyAfter = valueToBigNumber(
        user?.totalCollateralMarketReferenceCurrency || '0'
    ).plus(amountIntEth);

    const liquidationThresholdAfter = valueToBigNumber(user?.totalCollateralMarketReferenceCurrency || '0')
        .multipliedBy(user?.currentLiquidationThreshold || '0')
        .plus(amountIntEth.multipliedBy(poolReserve.reserveLiquidationThreshold))
        .dividedBy(totalCollateralMarketReferenceCurrencyAfter);

    const healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits(
        totalCollateralMarketReferenceCurrencyAfter,
        valueToBigNumber(user.totalBorrowsMarketReferenceCurrency),
        liquidationThresholdAfter
    );

    const notShowHealthFactor =
        user.totalBorrowsMarketReferenceCurrency !== '0' && poolReserve.usageAsCollateralEnabled;

    const usageAsCollateralEnabledOnDeposit = poolReserve.usageAsCollateralEnabled ? userReserve.usageAsCollateralEnabledOnUser ? true : false : false;

    useEffect(() => {
        if (account) {
            handler.getTx({ depositing: false })
        }
    }, [account]);

    const handler = {
        async getTx({ depositing = false }) {
            try {
                const txs = await lendingPool.deposit({
                    user: user.id,
                    reserve: poolReserve.underlyingAsset,
                    amount: amount.toString(),
                });
                const mainTxType = ''
                const approveTx = txs.find((tx) => tx.txType === 'ERC20_APPROVAL');
                const actionTx = txs.find((tx) =>
                    [
                        'DLP_ACTION',
                        'GOVERNANCE_ACTION',
                        'STAKE_ACTION',
                        'GOV_DELEGATION_ACTION',
                        'REWARD_ACTION',
                        mainTxType,
                    ].includes(tx.txType)
                );

                let approve, action: any;
                if (approveTx) {
                    approve = {
                        txType: approveTx.txType,
                        unsignedData: approveTx.tx,
                        gas: approveTx.gas,
                        name: 'Approve',
                    }
                    setApproveTxData(approve)
                }
                if (actionTx) {
                    const mainTxName = 'Supply'
                    action = {
                        txType: actionTx.txType,
                        unsignedData: actionTx.tx,
                        gas: actionTx.gas,
                        name: mainTxName,
                    }
                    setActionTxData(action)
                }

                if ((approve || approveTxData) && action) {
                    if (!approve) approve = approveTxData
                    setSteps([
                        {
                            key: 'approve',
                            title: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.approve.title" /></span>,
                            buttonText: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.approve.button" /></span>,
                            stepText: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.approve.step" /></span>,
                            description: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.approve.desc" /></span>,
                            loading: false,
                            error: '',
                        },
                        {
                            key: 'supply',
                            title: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.deposit.title" /></span>,
                            buttonText: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.deposit.button" /></span>,
                            stepText: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.deposit.step" /></span>,
                            description: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.deposit.desc" /></span>,
                            loading: depositing ? true : false,
                            error: '',
                        },
                        {
                            key: 'completed',
                            title: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.completed.title" /></span>,
                            buttonText: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.completed.button" /></span>,
                            stepText: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.completed.step" /></span>,
                            description: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.completed.desc" /></span>,
                            loading: false,
                            error: '',
                        },
                    ]);
                } else if (action) {
                    setSteps([
                        {
                            key: 'supply',
                            title: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.deposit.title" /></span>,
                            buttonText: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.deposit.button" /></span>,
                            stepText: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.deposit.step" /></span>,
                            description: <span><FormattedMessage id="pages.deposit.detail.confirm.steps.deposit.desc" /></span>,
                            loading: depositing ? true : false,
                            error: '',
                        },
                        {
                            key: 'completed',
                            title: <FormattedMessage id="pages.deposit.detail.confirm.steps.completed.title" />,
                            buttonText: <FormattedMessage id="pages.deposit.detail.confirm.steps.completed.button" />,
                            stepText: <FormattedMessage id="pages.deposit.detail.confirm.steps.completed.step" />,
                            description: <FormattedMessage id="pages.deposit.detail.confirm.steps.completed.desc" />,
                            loading: false,
                            error: '',
                        },
                    ]);
                }

                return true;
            } catch (e) {
                console.log('Error on txs loading', e);
                return false;
            }
        },
        approve: {
            submit() {
                handler.loading.set('approve', true);
                handler.records.set('approve', 'approve', 'wait')
                sendEthTransaction(
                    approveTxData.unsignedData,
                    provider,
                    setApproveTxData,
                    customGasPrice,
                    {
                        onConfirmation: handler.approve.confirmed,
                        onError: handler.approve.error
                    }
                )
            },
            confirmed() {
                console.log('approve confirmed----')
                handler.loading.set('approve', false);
                handler.records.set('approve', 'approve', 'confirmed')
                setCurrent(current + 1);
            },
            error(e: any) {
                console.log('approve error:', e)
                const key = 'approve'
                handler.error.set(key, e.message.indexOf('(') > -1 ? e.message.slice(0, e.message.indexOf('(')) : e.message);
                handler.loading.set(key, false);
                handler.records.set(key, 'approve', 'error')
            }
        },
        action: {
            async submit() {
                handler.loading.set('supply', true);
                handler.records.set('supply', 'supply', 'wait')
                const success = await handler.getTx({ depositing: true })
                if (success) {
                    handler.loading.set('supply', true);
                    sendEthTransaction(
                        actionTxData.unsignedData,
                        provider,
                        setActionTxData,
                        customGasPrice,
                        {
                            onExecution: handler.action.executed,
                            onConfirmation: handler.action.confirmed,
                            onError: handler.action.error
                        }
                    );
                } else {
                    setActionTxData((state: any) => ({
                        ...state,
                        txStatus: TxStatusType.error,
                        loading: false,
                        error: 'transaction no longer valid',
                    }));
                    handler.loading.set('supply', false);
                }
            },
            executed() {
                console.log('--------deposit executed----')
            },
            confirmed() {
                handler.records.set('supply', 'supply', 'confirmed')
                setCurrent(current + 1);
                handler.loading.set('supply', false);
                changeIsZore(false);
                setHealthFactorAfter(healthFactorAfterDeposit);
                refresh();
            },
            error(e: any) {
                console.log('confirm error:', e)
                const key = 'supply'
                handler.error.set(key, e.message.indexOf('(') > -1 ? e.message.slice(0, e.message.indexOf('(')) : e.message);
                handler.loading.set(key, false);
                handler.records.set(key, 'supply', 'error')
            }
        },
        records: {
            set(key: string, name: string, status: string) {
                let id = records.findIndex((item: any) => item.key == key)
                if (id !== -1) {
                    records[id] = {
                        ...records[id],
                        status
                    }
                } else {
                    records.push({
                        key,
                        name,
                        status
                    })
                }

                setRecords([...records])
            }
        },
        loading: {
            set(key: string, status: boolean) {
                let list = steps.map((item: any) => {
                    if (item.key === key) {
                        item.loading = status
                    }
                    return item;
                })

                setSteps(list)
            }
        },
        error: {
            set(key: string, error: string) {
                let id = steps.findIndex((item: any) => item.key == key)
                if (id !== -1) {
                    steps[id] = {
                        ...steps[id],
                        error
                    }
                    setSteps([...steps])
                }
            }
        },
        async submit() {
            if (approveTxData && steps[current]?.key === 'approve') {
                handler.approve.submit()
            } else if (actionTxData && steps[current]?.key === 'supply') {
                handler.action.submit()
            } else if (steps[current]?.key === 'completed') {
                history.push('/control')
            }
        }
    };

    return (
        <Card bordered={false}>
            <Back />
            <Card bordered={false}>
                <Row>
                    <Col span={12} offset={6}>
                        <div className={styles.desc}>
                            <div className={styles.title}><FormattedMessage id="pages.deposit.detail.confirm.title" /></div>
                            <div className={styles.text}>
                                <FormattedMessage id="pages.deposit.detail.confirm.desc" />
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
                                <Descriptions.Item label={<FormattedMessage id="pages.deposit.detail.confirm.quantity" />} span={3}>
                                    <Bignumber value={amount} /> {underlyingSymbol}
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
                                    $ <Bignumber value={amountInUsd} />
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<FormattedMessage id="pages.deposit.detail.confirm.collateral" />}
                                    span={3}
                                    contentStyle={{ color: '#3163E2' }}
                                >
                                    {usageAsCollateralEnabledOnDeposit ? 'yes' : 'no'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<FormattedMessage id="pages.deposit.detail.confirm.HealthFactors" />}
                                    span={3}
                                    contentStyle={{ color: '#3163E2' }}
                                >
                                    {(!healthFactorAfter ? healthFactorAfterDeposit : healthFactorAfter).decimalPlaces(2).toString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </div>
                {!steps.length && <Row><Col span={10} offset={7} style={{ marginTop: 20, textAlign: 'center' }}><Spin /></Col></Row>}
                {steps.length > 0 &&
                    <Row>
                        <Col span={10} offset={7} style={{ marginBottom: 20 }}>
                            <Steps
                                type="navigation"
                                size="small"
                                current={current}
                                className="site-navigation-steps"
                            >
                                {steps.map((item: any, index: number) => (
                                    <Step title={item.title} key={index} />
                                ))}
                            </Steps>
                        </Col>
                        <Col span={7} offset={7}>
                            <p className={styles.tip}>
                                {current + 1}/{steps.length} {steps[current]?.stepText}
                            </p>

                            <p className={styles.tip} style={steps[current]?.error ? { color: '#F46D6D' } : {}}>{steps[current]?.error ? steps[current]?.error : steps[current]?.description}</p>
                        </Col>
                        <Col span={3}>
                            <Button type="primary" shape="round" loading={steps[current]?.loading ? true : false} onClick={handler.submit}>
                                {steps[current]?.buttonText}
                            </Button>
                        </Col>
                        <Col span={10} offset={7}>
                            <Divider style={{ margin: '12px 0' }} />
                        </Col>
                        <Col span={10} offset={7}>
                            <Row>
                                {
                                    records.map((item: any, index: number) =>
                                        <React.Fragment key={index}>
                                            <Col span={8}>{item.name}</Col>
                                            <Col span={8}>
                                                {item.status} {item.status == 'wait' ? <LoadingOutlined /> : <Badge status={item.status == 'confirmed' ? "success" : "error"} />}
                                            </Col>
                                            <Col span={8}><FormattedMessage id="pages.deposit.detail.confirm.explorer" /></Col>
                                        </React.Fragment>)

                                }
                            </Row>
                        </Col>
                    </Row>
                }
            </Card>
        </Card>
    );
};
