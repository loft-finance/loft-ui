import { useEffect, useState } from 'react';
import { useModel, history, FormattedMessage } from 'umi';
import { Card, Row, Col, Button, Descriptions, Steps, Divider, Badge, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'
import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber, BigNumber, InterestRate } from '@aave/protocol-js';
import { sendEthTransaction, TxStatusType } from '@/lib/helpers/send-ethereum-tx';
import Bignumber from '@/components/Bignumber';
import { normalize } from '@aave/math-utils';

import Back from '@/components/Back';
import styles from './confirm.less';
const { Step } = Steps;

export default ({ poolReserve, user, userReserve, maxAmountToRepay, debtType, walletBalance, networkConfig, match: { params: { amount: amount0 } }, }: any,) => {
    if(!poolReserve || !userReserve) {
        return <div style={{textAlign:'center'}}><Spin /></div>
    }
    
    const amount = valueToBigNumber(amount0);

    const [steps, setSteps] = useState<any>([]);
    const [current, setCurrent] = useState(0);
    const [approveTxData, setApproveTxData] = useState<any>(undefined);
    const [actionTxData, setActionTxData] = useState<any>(undefined)
    const [customGasPrice, setCustomGasPrice] = useState<string | null>(null);
    const [records, setRecords] = useState<any>([]);

    const { baseCurrency } = useModel('pool')
    const { wallet } = useModel('wallet');
    const provider = wallet?.provider
    const { lendingPool } = useModel('lendingPool');

    const marketRefPriceInUsd = normalize(baseCurrency?.marketReferenceCurrencyPriceInUsd || '0', 8)

    const safeAmountToRepayAll = valueToBigNumber(maxAmountToRepay).multipliedBy('1.0025');

    let amountToRepay = amount.toString();
    let amountToRepayUI = amount;
    if (amountToRepay === '-1') {
        amountToRepayUI = BigNumber.min(walletBalance, safeAmountToRepayAll);
        if (
            userReserve.reserve.symbol.toUpperCase() === networkConfig.baseAsset ||
            walletBalance.eq(amountToRepayUI)
        ) {
            amountToRepay = BigNumber.min(walletBalance, safeAmountToRepayAll).toString();
        }
    }

    const displayAmountToRepay = BigNumber.min(amountToRepayUI, maxAmountToRepay);
    const displayAmountToRepayInUsd = displayAmountToRepay
        .multipliedBy(poolReserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd);

    const amountAfterRepay = maxAmountToRepay.minus(amountToRepayUI).toString();
    const displayAmountAfterRepay = BigNumber.min(amountAfterRepay, maxAmountToRepay);
    const displayAmountAfterRepayInUsd = displayAmountAfterRepay
        .multipliedBy(poolReserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd);

    const healthFactorAfterRepay = calculateHealthFactorFromBalancesBigUnits(
        user?.totalCollateralUSD,
        valueToBigNumber(user?.totalBorrowsUSD).minus(displayAmountToRepayInUsd.toNumber()),
        user?.currentLiquidationThreshold
    );

    const usageAsCollateralEnabledOnDeposit =
        poolReserve.usageAsCollateralEnabled &&
        (!userReserve?.underlyingBalance ||
            userReserve.underlyingBalance === '0' ||
            userReserve.usageAsCollateralEnabledOnUser);

    useEffect(() => {
        if (wallet) {
            handler.getTx({ repaying: false })
        }
    }, [wallet]);

    const handler = {
        async getTx({ repaying = false }) {
            try {
                const txs = await lendingPool.repay({
                    user: user.id,
                    reserve: poolReserve.underlyingAsset,
                    amount: amountToRepay.toString(),
                    interestRateMode: debtType as InterestRate,
                });
                console.log('txs', txs)
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
                    const mainTxName = 'Repay'
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
                            title: <FormattedMessage id="pages.loan.repay.confirm.steps.approve.title" />,
                            buttonText: <FormattedMessage id="pages.loan.repay.confirm.steps.approve.button" />,
                            stepText: <FormattedMessage id="pages.loan.repay.confirm.steps.approve.step" />,
                            description: <FormattedMessage id="pages.loan.repay.confirm.steps.approve.desc" />,
                            loading: false,
                            error: '',
                        },
                        {
                            key: 'repay',
                            title: <FormattedMessage id="pages.loan.repay.confirm.steps.withdraw.title" />,
                            buttonText: <FormattedMessage id="pages.loan.repay.confirm.steps.withdraw.button" />,
                            stepText: <FormattedMessage id="pages.loan.repay.confirm.steps.withdraw.step" />,
                            description: <FormattedMessage id="pages.loan.repay.confirm.steps.withdraw.desc" />,
                            loading: repaying ? true : false,
                            error: '',
                        },
                        {
                            key: 'completed',
                            title: <FormattedMessage id="pages.loan.repay.confirm.steps.completed.title" />,
                            buttonText: <FormattedMessage id="pages.loan.repay.confirm.steps.completed.button" />,
                            stepText: <FormattedMessage id="pages.loan.repay.confirm.steps.completed.step" />,
                            description: <FormattedMessage id="pages.loan.repay.confirm.steps.completed.desc" />,
                            loading: false,
                            error: '',
                        },
                    ]);
                } else if (action) {
                    setSteps([
                        {
                            key: 'repay',
                            title: <FormattedMessage id="pages.loan.repay.confirm.steps.withdraw.title" />,
                            buttonText: <FormattedMessage id="pages.loan.repay.confirm.steps.withdraw.button" />,
                            stepText: <FormattedMessage id="pages.loan.repay.confirm.steps.withdraw.step" />,
                            description: <FormattedMessage id="pages.loan.repay.confirm.steps.withdraw.desc" />,
                            loading: repaying ? true : false,
                            error: '',
                        },
                        {
                            key: 'completed',
                            title: <FormattedMessage id="pages.loan.repay.confirm.steps.completed.title" />,
                            buttonText: <FormattedMessage id="pages.loan.repay.confirm.steps.completed.button" />,
                            stepText: <FormattedMessage id="pages.loan.repay.confirm.steps.completed.step" />,
                            description: <FormattedMessage id="pages.loan.repay.confirm.steps.completed.desc" />,
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
                handler.error.set(key, e.message)
                handler.loading.set(key, false);
                handler.records.set(key, 'approve', 'error')
            }
        },
        action: {
            async submit() {
                handler.loading.set('repay', true);
                handler.records.set('repay', 'repay', 'wait')
                const success = await handler.getTx({ repaying: true })
                if (success) {
                    handler.loading.set('repay', true);
                    return sendEthTransaction(
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
                    setActionTxData((state) => ({
                        ...state,
                        txStatus: TxStatusType.error,
                        loading: false,
                        error: 'transaction no longer valid',
                    }));
                    handler.loading.set('repay', false);
                }
            },
            executed() {
                console.log('--------repay executed----')
            },
            confirmed() {
                handler.records.set('repay', 'repay', 'confirmed')
                setCurrent(current + 1);
                handler.loading.set('repay', false);
            },
            error(e: any) {
                console.log('confirm error:', e)
                const key = 'repay'
                handler.error.set(key, e.message)
                handler.loading.set(key, false);
                handler.records.set(key, 'repay', 'error')
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
            set(key: string, error: string){
                let id = steps.findIndex((item: any)=>item.key == key)
                if(id !==  -1){
                    steps[id] = {
                        ...steps[id],
                        error
                    }
                    setSteps([ ...steps ])
                }
            }
        },
        async submit() {
            if (approveTxData && steps[current]?.key === 'approve') {
                handler.approve.submit()
            } else if (actionTxData && steps[current]?.key === 'repay') {
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
                            <div className={styles.title}><FormattedMessage id="pages.loan.repay.confirm.title" /></div>
                            <div className={styles.text}>
                                <FormattedMessage id="pages.loan.repay.confirm.desc" />
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
                                <Descriptions.Item label={<FormattedMessage id="pages.loan.repay.confirm.quantity" />} span={3}>
                                    <Bignumber value={displayAmountToRepay} />
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
                                    $ <Bignumber value={displayAmountToRepayInUsd} />
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<FormattedMessage id="pages.loan.repay.confirm.collateral" />}
                                    span={3}
                                    contentStyle={{ color: '#3163E2' }}
                                >
                                    {usageAsCollateralEnabledOnDeposit ? 'yes' : 'no'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<FormattedMessage id="pages.loan.repay.confirm.quaHealthFactorsntity" />}
                                    span={3}
                                    contentStyle={{ color: '#3163E2' }}
                                >
                                    {user?.healthFactor.toString()}
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
                                {steps.map((item) => (
                                    <Step title={item.title} />
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
                                {records.map((item: any) => <>
                                    <Col span={8}>{item.name}</Col>
                                    <Col span={8}>
                                    {item.status} {item.status == 'wait' ? <LoadingOutlined /> : <Badge status={item.status == 'confirmed' ? "success" : "error"} />}
                                    </Col>
                                    <Col span={8}><FormattedMessage id="pages.loan.repay.confirm.explorer" /></Col>
                                </>)}
                            </Row>
                        </Col>
                    </Row>
                }
            </Card>
        </Card>
    );
};
