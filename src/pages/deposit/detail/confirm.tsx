import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import { Card, Row, Col, Button, Descriptions, Steps, Divider, Badge } from 'antd';
import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber } from '@aave/protocol-js';

import Back from '@/components/Back';
import styles from './confirm.less';
const { Step } = Steps;

export default ({ poolReserve, maxAmountToDeposit, match: { params: { amount: amount0 } }, }: any,) => {
    const amount = valueToBigNumber(amount0);

    const [steps, setSteps] = useState([]);
    const [current, setCurrent] = useState(0);

    const { user, userReserve, baseCurrency } = useModel('pool')
    const { wallet } = useModel('wallet');
    const { lendingPool } = useModel('lendingPool');


    const amountIntEth = amount.multipliedBy(poolReserve.priceInMarketReferenceCurrency);
    const amountInUsd = amountIntEth.multipliedBy(baseCurrency.marketReferenceCurrencyPriceInUsd);
    const totalCollateralMarketReferenceCurrencyAfter = valueToBigNumber(
        user.totalCollateralMarketReferenceCurrency
    ).plus(amountIntEth);


    const liquidationThresholdAfter = valueToBigNumber(user.totalCollateralMarketReferenceCurrency)
        .multipliedBy(user.currentLiquidationThreshold)
        .plus(amountIntEth.multipliedBy(poolReserve.reserveLiquidationThreshold))
        .dividedBy(totalCollateralMarketReferenceCurrencyAfter);

    const healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits(
        totalCollateralMarketReferenceCurrencyAfter,
        valueToBigNumber(user.totalBorrowsMarketReferenceCurrency),
        liquidationThresholdAfter
    );


    const notShowHealthFactor =
        user.totalBorrowsMarketReferenceCurrency !== '0' && poolReserve.usageAsCollateralEnabled;

    const usageAsCollateralEnabledOnDeposit =
        poolReserve.usageAsCollateralEnabled &&
        (!userReserve?.underlyingBalance ||
            userReserve.underlyingBalance === '0' ||
            userReserve.usageAsCollateralEnabledOnUser);

    useEffect(() => {
        if (wallet) {
            const { auth } = wallet;
            if (auth) {
                setSteps([
                    {
                        key: 'deposit',
                        title: 'Deposit',
                        buttonText: 'deposit',
                    },
                    {
                        key: 'completed',
                        title: 'Completed',
                        buttonText: 'completed',
                    },
                ]);
            } else {
                setSteps([
                    {
                        key: 'approval',
                        title: 'Approval',
                        buttonText: 'approval',
                    },
                    {
                        key: 'deposit',
                        title: 'Deposit',
                        buttonText: 'deposit',
                    },
                    {
                        key: 'completed',
                        title: 'Completed',
                        buttonText: 'completed',
                    },
                ]);
            }
        }
    }, [wallet]);

    const handler = {
        async submit() {
            // setCurrent(current + 1);
            const res = await lendingPool.deposit({
                user: user.id,
                reserve: poolReserve.underlyingAsset,
                amount: amount.toString(),
            });

            console.log('deposit:', res)
        }
    };

    return (
        <Card bordered={false}>
            <Back />
            <Card bordered={false}>
                <Row>
                    <Col span={12} offset={6}>
                        <div className={styles.desc}>
                            <div className={styles.title}>Deposit overview</div>
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
                                    {amount.toString()}
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
                                    ${amountInUsd.toString()}
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
                                    {healthFactorAfterDeposit.toString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </div>
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
                            {current + 1}/{steps.length} {steps[current]?.title}
                        </p>
                        <p className={styles.tip}>
                            The transaction failed for the following reasons:Please approve before depositing
                        </p>
                        <p className={styles.tip} style={{ color: '#F46D6D' }}>
                            Please approve before depositing
                        </p>
                    </Col>
                    <Col span={3}>
                        <Button type="primary" shape="round" onClick={handler.submit}>
                            {steps[current]?.buttonText}
                        </Button>
                    </Col>
                    <Col span={10} offset={7}>
                        <Divider style={{ margin: '12px 0' }} />
                    </Col>
                    <Col span={10} offset={7}>
                        <Row>
                            <Col span={8}>approval</Col>
                            <Col span={8}>
                                confirmed <Badge status="success" />
                            </Col>
                            <Col span={8}>Explorer</Col>
                            <Col span={8}>deposit</Col>
                            <Col span={8}>
                                confirmed <Badge status="processing" />
                            </Col>
                            <Col span={8}>Explorer</Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
        </Card>
    );
};
