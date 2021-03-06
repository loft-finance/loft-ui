import { useEffect, useState } from 'react';
import { useModel, history, FormattedMessage } from 'umi';
import { Card, Row, Col, Button, Descriptions, Steps, Divider, Badge, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'
import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber, BigNumber } from '@aave/protocol-js';
import { sendEthTransaction, TxStatusType } from '@/lib/helpers/send-ethereum-tx';
import Bignumber from '@/components/Bignumber';

import Back from '@/components/Back';
import styles from './confirm.less';
import React from 'react';
const { Step } = Steps;

export default ({ poolReserve, user, userReserve, maxAmountToDeposit, match: { params: { amount: amount0 } }, }: any,) => {
    if (!poolReserve || !userReserve) {
        // return <div style={{textAlign:'center'}}><Spin /></div>
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

    const { refreshPool } = useModel('pool', res => ({
        refreshPool: res.refresh
    }));
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
        refreshWallet();
    }

    const usageAsCollateralEnabledOnDeposit =
        poolReserve.usageAsCollateralEnabled &&
        (!userReserve?.underlyingBalance ||
            userReserve.underlyingBalance === '0' ||
            userReserve.usageAsCollateralEnabledOnUser);

    const underlyingBalance = valueToBigNumber(userReserve.underlyingBalance);
    const availableLiquidity = valueToBigNumber(poolReserve.availableLiquidity);
    let maxAmountToWithdraw = BigNumber.min(underlyingBalance, availableLiquidity);
    let maxCollateralToWithdrawInETH = valueToBigNumber('0');

    if (
        userReserve.usageAsCollateralEnabledOnUser &&
        poolReserve.usageAsCollateralEnabled &&
        user.totalBorrowsMarketReferenceCurrency !== '0'
    ) {
        // if we have any borrowings we should check how much we can withdraw without liquidation
        // with 0.5% gap to avoid reverting of tx
        const excessHF = valueToBigNumber(user.healthFactor).minus('1');
        if (excessHF.gt('0')) {
            maxCollateralToWithdrawInETH = excessHF
                .multipliedBy(user.totalBorrowsMarketReferenceCurrency)
                // because of the rounding issue on the contracts side this value still can be incorrect
                .div(Number(poolReserve.reserveLiquidationThreshold) + 0.01)
                .multipliedBy('0.99');
        }
        maxAmountToWithdraw = BigNumber.min(
            maxAmountToWithdraw,
            maxCollateralToWithdrawInETH.dividedBy(poolReserve.priceInMarketReferenceCurrency)
        );
    }

    let amountToWithdraw = amount;
    let displayAmountToWithdraw = amount;

    if (amountToWithdraw.eq('-1')) {
        if (user.totalBorrowsMarketReferenceCurrency !== '0') {
            if (!maxAmountToWithdraw.eq(underlyingBalance)) {
                amountToWithdraw = maxAmountToWithdraw;
            }
        }
        displayAmountToWithdraw = maxAmountToWithdraw;
    }

    let blockingError = '';
    let totalCollateralInETHAfterWithdraw = valueToBigNumber(
        user.totalCollateralMarketReferenceCurrency
    );
    let liquidationThresholdAfterWithdraw = user.currentLiquidationThreshold;
    let healthFactorAfterWithdraw = valueToBigNumber(user.healthFactor);

    if (userReserve.usageAsCollateralEnabledOnUser && poolReserve.usageAsCollateralEnabled) {
        const amountToWithdrawInEth = displayAmountToWithdraw.multipliedBy(
            poolReserve.priceInMarketReferenceCurrency
        );
        totalCollateralInETHAfterWithdraw =
            totalCollateralInETHAfterWithdraw.minus(amountToWithdrawInEth);

        liquidationThresholdAfterWithdraw = valueToBigNumber(
            user.totalCollateralMarketReferenceCurrency
        )
            .multipliedBy(user.currentLiquidationThreshold)
            .minus(
                valueToBigNumber(amountToWithdrawInEth).multipliedBy(
                    poolReserve.reserveLiquidationThreshold
                )
            )
            .div(totalCollateralInETHAfterWithdraw)
            .toFixed(4, BigNumber.ROUND_DOWN);

        healthFactorAfterWithdraw = calculateHealthFactorFromBalancesBigUnits(
            totalCollateralInETHAfterWithdraw,
            user.totalBorrowsMarketReferenceCurrency,
            liquidationThresholdAfterWithdraw
        );

        if (healthFactorAfterWithdraw.lt('1') && user.totalBorrowsMarketReferenceCurrency !== '0') {
            // blockingError = intl.formatMessage(messages.errorCanNotWithdrawThisAmount);
        }
    }

    const isHealthFactorDangerous =
        user.totalBorrowsMarketReferenceCurrency !== '0' &&
        healthFactorAfterWithdraw.toNumber() <= 1.05;

    console.log(healthFactorAfterWithdraw.toNumber())
    useEffect(() => {
        if (account) {
            handler.getTx({ withdrawing: false })
        }
    }, [account]);

    const handler = {
        async getTx({ withdrawing = false }) {
            try {
                const txs = await lendingPool.withdraw({
                    user: user.id,
                    reserve: poolReserve.underlyingAsset,
                    amount: amountToWithdraw.toString(),
                    aTokenAddress: poolReserve.aTokenAddress,
                });
                const mainTxType = ''
                const approvalTx = txs.find((tx: any) => tx.txType === 'ERC20_APPROVAL');
                const actionTx = txs.find((tx: any) =>
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
                    const mainTxName = 'Withdraw'
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
                            title: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.approve.title" /></span>,
                            buttonText: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.approve.button" /></span>,
                            stepText: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.approve.step" /></span>,
                            description: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.approve.desc" /></span>,
                            loading: false,
                            error: '',
                        },
                        {
                            key: 'withdraw',
                            title: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.withdraw.title" /></span>,
                            buttonText: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.withdraw.button" /></span>,
                            stepText: <span> <FormattedMessage id="pages.deposit.withdraw.confirm.steps.withdraw.step" /></span>,
                            description: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.withdraw.desc" /></span>,
                            loading: withdrawing ? true : false,
                            error: '',
                        },
                        {
                            key: 'completed',
                            title: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.completed.title" /></span>,
                            buttonText: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.completed.button" /></span>,
                            stepText: <span> <FormattedMessage id="pages.deposit.withdraw.confirm.steps.completed.step" /></span>,
                            description: <span> <FormattedMessage id="pages.deposit.withdraw.confirm.steps.completed.desc" /></span>,
                            loading: false,
                            error: '',
                        },
                    ]);
                } else if (action) {
                    setSteps([
                        {
                            key: 'withdraw',
                            title: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.withdraw.title" /></span>,
                            buttonText: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.withdraw.button" /></span>,
                            stepText: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.withdraw.step" /></span>,
                            description: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.withdraw.desc" /></span>,
                            loading: withdrawing ? true : false,
                            error: '',
                        },
                        {
                            key: 'completed',
                            title: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.completed.title" /></span>,
                            buttonText: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.completed.button" /></span>,
                            stepText: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.completed.step" /></span>,
                            description: <span><FormattedMessage id="pages.deposit.withdraw.confirm.steps.completed.desc" /></span>,
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
                handler.loading.set('withdraw', true);
                handler.records.set('withdraw', 'withdraw', 'wait')
                const success = await handler.getTx({ withdrawing: true })
                if (success) {
                    handler.loading.set('withdraw', true);
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
                    setActionTxData((state: any) => ({
                        ...state,
                        txStatus: TxStatusType.error,
                        loading: false,
                        error: 'transaction no longer valid',
                    }));
                    handler.loading.set('withdraw', false);
                }
            },
            executed() {
                console.log('--------withdraw executed----')
            },
            confirmed() {
                handler.records.set('withdraw', 'withdraw', 'confirmed')
                setCurrent(current + 1);
                handler.loading.set('withdraw', false);
                setHealthFactorAfter(healthFactorAfterWithdraw)
                refresh();
            },
            error(e: any) {
                console.log('confirm error:', e.message)
                const key = 'withdraw'
                handler.error.set(key, e.message.indexOf('(') > -1 ? e.message.slice(0, e.message.indexOf('(')) : e.message);
                handler.loading.set(key, false);
                handler.records.set(key, 'withdraw', 'error')
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
            if (approveTxData && steps[current]?.key === 'approval') {
                handler.approve.submit()
            } else if (actionTxData && steps[current]?.key === 'withdraw') {
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
                            <div className={styles.title}><FormattedMessage id="pages.deposit.withdraw.confirm.title" /></div>
                            <div className={styles.text}>
                                <FormattedMessage id="pages.deposit.withdraw.confirm.desc" />
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
                                <Descriptions.Item label="Amount" span={3}>
                                    <Bignumber value={displayAmountToWithdraw} /> {underlyingSymbol}
                                </Descriptions.Item>
                                {/* <Descriptions.Item
                                    span={3}
                                    contentStyle={{
                                        color: '#696D85',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        marginTop: -20,
                                    }}
                                >
                                    $ <Bignumber value={displayAmountToWithdraw} maximumFractionDigits={4} />
                                </Descriptions.Item> */}
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
                                    <Bignumber value={!healthFactorAfter ? healthFactorAfterWithdraw : healthFactorAfter} />
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
                                {records.map((item: any, index: number) => <React.Fragment key={index}>
                                    <Col span={8}>{item.name}</Col>
                                    <Col span={8}>
                                        {item.status} {item.status == 'wait' ? <LoadingOutlined /> : <Badge status={item.status == 'confirmed' ? "success" : "error"} />}
                                    </Col>
                                    <Col span={8}>
                                        <FormattedMessage id="pages.deposit.withdraw.confirm.explorer" />
                                    </Col>
                                </React.Fragment>)}
                            </Row>
                        </Col>
                    </Row>
                }
            </Card>
        </Card>
    );
};
