import { useEffect, useState } from 'react';
import { useModel, history } from 'umi';
import { Card, Row, Col, Button, Descriptions, Steps, Divider, Badge, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'
import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber, BigNumber, InterestRate } from '@aave/protocol-js';
import { sendEthTransaction, TxStatusType } from '@/lib/helpers/send-ethereum-tx';

import Back from '@/components/Back';
import styles from './confirm.less';
const { Step } = Steps;

export default ({ poolReserve, user, userReserve, maxAmountToRepay, debtType, walletBalance, networkConfig, match: { params: { amount: amount0 } }, }: any,) => {
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

    const marketRefPriceInUsd = baseCurrency.marketReferenceCurrencyPriceInUsd


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
                const approvalTx = txs.find((tx) => tx.txType === 'ERC20_APPROVAL');
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
                if (approvalTx) {
                    approve = {
                        txType: approvalTx.txType,
                        unsignedData: approvalTx.tx,
                        gas: approvalTx.gas,
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
                            key: 'approval',
                            title: approve.name,
                            buttonText: approve.name,
                            stepText: approve.name,
                            description: 'Please approve before repaying',
                            loading: false,
                            error: '',
                        },
                        {
                            key: 'repay',
                            title: action.name,
                            buttonText: action.name,
                            stepText: action.name,
                            description: 'Please submit a repay',
                            loading: repaying ? true : false,
                            error: '',
                        },
                        {
                            key: 'completed',
                            title: 'Completed',
                            buttonText: 'control panel',
                            stepText: 'Success ',
                            description: '',
                            loading: false,
                            error: '',
                        },
                    ]);
                } else if (action) {
                    setSteps([
                        {
                            key: 'repay',
                            title: action.name,
                            buttonText: action.name,
                            stepText: action.name,
                            description: 'Please submit a repay',
                            loading: repaying ? true : false,
                            error: '',
                        },
                        {
                            key: 'completed',
                            title: 'Completed',
                            buttonText: 'control panel',
                            stepText: 'Success ',
                            description: '',
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
                handler.loading.set('approval', true);
                handler.records.set('approval', 'approval', 'wait')
                sendEthTransaction(
                    approveTxData.unsignedData,
                    provider,
                    setApproveTxData,
                    customGasPrice,
                    {
                        onConfirmation: handler.approve.confirmed,
                    }
                )
            },
            confirmed() {
                console.log('approve confirmed----')
                handler.loading.set('approval', false);
                handler.records.set('approval', 'approval', 'confirmed')
                setCurrent(current + 1);
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
        async submit() {
            if (approveTxData && steps[current]?.key === 'approval') {
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
                            <div className={styles.title}>Overview of repay</div>
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
                                    {displayAmountToRepay.toString()}
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
                                    ${displayAmountToRepayInUsd.toString()}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="Collateral Usage"
                                    span={3}
                                    contentStyle={{ color: '#3163E2' }}
                                >
                                    {usageAsCollateralEnabledOnDeposit ? 'yes' : 'no'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="New health factors"
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
                                    <Col span={8}>Explorer</Col>
                                </>)}
                            </Row>
                        </Col>
                    </Row>
                }
            </Card>
        </Card>
    );
};
