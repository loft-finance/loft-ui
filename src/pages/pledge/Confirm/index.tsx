import { useState, useImperativeHandle } from 'react';
import { history, FormattedMessage, useModel } from 'umi';
import { Modal, Card, Row, Col, Button, Descriptions, Steps, Divider, Badge, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'
import { valueToBigNumber } from '@aave/protocol-js';
import Bignumber from '@/components/Bignumber';

import styles from './index.less';
import React from 'react';
const { Step } = Steps;

export default ({ refs }: any) => {
    useImperativeHandle(refs, () => {
        return {
            show: (params: any) => {
                const { title, amount, amountInUsd, txt, isAllowanceEnough = false, approve = false, confirm, earned = false } = params
                setTitle(title)
                setCurrent(0)
                setAmount(amount)
                setAmountInUsd(amountInUsd)
                setArgs({
                    earned,
                    txt,
                    isAllowanceEnough,
                    approve,
                    confirm
                })
                handler.init(params)
                setVisible(true);
            },
            close: handler.close,
        };
    });

    const { refresh } = useModel('pledge', res => ({
        refresh: res.refresh
    }))

    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState(false);
    const [amount, setAmount] = useState(valueToBigNumber('0'));
    const [amountInUsd, setAmountInUsd] = useState(valueToBigNumber('0'));
    const [args, setArgs] = useState<any>({});
    const [steps, setSteps] = useState<any>([]);
    const [current, setCurrent] = useState(0);
    const [records, setRecords] = useState<any>([]);

    const handler = {
        close: () => {
            setVisible(false);
        },
        async init(params: any, confirming = false) {
            const { txt, isAllowanceEnough = false } = params
            const steps = [
                {
                    key: 'confirm',
                    title: txt.confirm.title,
                    buttonText: txt.confirm.buttonText,
                    stepText: txt.confirm.stepText,
                    description: txt.confirm.description,
                    loading: confirming ? true : false,
                    error: '',
                },
                {
                    key: 'completed',
                    title: txt.completed.title,
                    buttonText: txt.completed.buttonText,
                    stepText: txt.completed.stepText,
                    description: txt.completed.description,
                    loading: false,
                    error: '',
                }
            ]
            if (!isAllowanceEnough) {
                setSteps(steps)
            } else {
                if (!await isAllowanceEnough()) {
                    setSteps([
                        {
                            key: 'approve',
                            title: txt.approve.title,
                            buttonText: txt.approve.buttonText,
                            stepText: txt.approve.stepText,
                            description: txt.approve.description,
                            loading: false,
                            error: '',
                        },
                        ...steps
                    ])
                } else {
                    setSteps(steps)
                }
            }
        },
        approve: {
            async submit() {
                handler.loading.set('approve', true);
                handler.records.set('approve', 'approve', 'wait')
                const { approve } = args
                try {
                    const res = await approve()
                    res.wait()
                        .then(() => {
                            console.log('approve:', res)
                            handler.approve.confirmed()
                        })
                        .catch((e: any) => {
                            console.log('approve error 1:', e)
                        })
                } catch (e: any) {
                    console.log('approve error:', e)
                    const key = 'approve'
                    handler.error.set(key, e?.message || 'Error')
                    handler.loading.set(key, false);
                    handler.records.set(key, 'approve', 'error')
                }
            },
            confirmed() {
                console.log('approve confirmed----')
                handler.loading.set('approve', false);
                handler.records.set('approve', 'approve', 'confirmed')
                setCurrent(current + 1);
            }
        },
        confirm: {
            async submit() {
                handler.loading.set('confirm', true);
                handler.records.set('confirm', 'confirm', 'wait')
                const { confirm, earned } = args
                try {
                    const res = await confirm(earned ? 0 : amount.toString())
                    console.log('-----executed-----')
                    res.wait()
                        .then(() => {
                            console.log('--------confirmed--------')
                            handler.confirm.confirmed()
                            refresh();
                        })
                        .catch((e: any) => {
                            console.log('confirm error 1:', e)
                        })
                } catch (e: any) {
                    console.log('confirm error:', e)
                    const key = 'confirm'
                    handler.error.set(key, e?.message || 'Error')
                    handler.loading.set(key, false);
                    handler.records.set(key, 'confirm', 'error')
                }
            },
            executed() {
                console.log('--------deposit executed----')
            },
            confirmed() {
                handler.records.set('confirm', 'confirm', 'confirmed')
                setCurrent(current + 1);
                handler.loading.set('confirm', false);
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
            if (steps[current]?.key === 'approve') {
                handler.approve.submit()
            } else if (steps[current]?.key === 'confirm') {
                handler.confirm.submit()
            } else if (steps[current]?.key === 'completed') {
                history.push('/control')
            }
        }
    };

    return (
        <Modal
            title={title}
            visible={visible}
            onCancel={handler.close}
            maskClosable={false}
            width={550}
            bodyStyle={{ paddingTop: 0 }}
            footer={false}
        >
            <Card bordered={false}>
                <Row>
                    <Col span={24}>
                        <div className={styles.desc}>
                            <div className={styles.title}>{args?.txt?.overview?.title || ''}</div>
                            <div className={styles.text}>
                                {args?.txt?.overview?.desc || ''}
                            </div>
                        </div>
                    </Col>
                </Row>
                <div>
                    <Row>
                        <Col span={24} className={styles.info}>
                            <Descriptions
                                labelStyle={{ color: '#696D85' }}
                                contentStyle={{ justifyContent: 'end', color: '#29292D', fontWeight: 'bold' }}
                            >
                                <Descriptions.Item label={<FormattedMessage id="pages.deposit.detail.confirm.quantity" />} span={3}>
                                    <Bignumber value={amount} />
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
                            </Descriptions>
                        </Col>
                    </Row>
                </div>
                {!steps.length && <Row><Col span={24} style={{ marginTop: 20, textAlign: 'center' }}><Spin /></Col></Row>}
                {steps.length > 0 &&
                    <Row>
                        <Col span={24} style={{ marginBottom: 20 }}>
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
                        <Col span={17}>
                            <p className={styles.tip}>
                                {current + 1}/{steps.length} {steps[current]?.stepText}
                            </p>

                            <p className={styles.tip} style={steps[current]?.error ? { color: '#F46D6D' } : {}}>{steps[current]?.error ? steps[current]?.error : steps[current]?.description}</p>
                        </Col>
                        <Col span={7} >
                            <Button type="primary" shape="round" loading={steps[current]?.loading ? true : false} onClick={handler.submit}>
                                {steps[current]?.buttonText}
                            </Button>
                        </Col>
                        <Col span={24}>
                            <Divider style={{ margin: '12px 0' }} />
                        </Col>
                        <Col span={24}>
                            <Row>
                                {records.map((item: any, index: number) => <React.Fragment key={index}>
                                    <Col span={8}>{item.name}</Col>
                                    <Col span={8}>
                                        {item.status} {item.status == 'wait' ? <LoadingOutlined /> : <Badge status={item.status == 'confirmed' ? "success" : "error"} />}
                                    </Col>
                                    <Col span={8}><FormattedMessage id="pages.deposit.detail.confirm.explorer" /></Col>
                                </React.Fragment>)}
                            </Row>
                        </Col>
                    </Row>
                }
            </Card>
        </Modal>
    );
};
