import { useState, useImperativeHandle } from 'react';
import { FormattedMessage, useModel } from 'umi';
import { Modal, Card, Row, Col, Button, Form, Input, message } from 'antd';
import { valueToBigNumber } from '@aave/protocol-js';
import Bignumber from '@/components/Bignumber';
import { TokenIcon } from '@aave/aave-ui-kit';

import styles from './index.less';

export default ({ refs }: any) => {
    useImperativeHandle(refs, () => {
        return {
            show: (params: any) => {
                const { title = 'Amount', max, txt, ok } = params
                form.resetFields()
                setTitle(title)
                setMax(max)
                setArgs({
                    txt,
                    ok
                })
                handler.init(params)
                setVisible(true);
            },
            close: handler.close,
        };
    });

    const symbol = ''

    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [max, setMax] = useState(valueToBigNumber(0));
    const [args, setArgs] = useState<any>({});

    const [form] = Form.useForm();

    const handler = {
        close: () => {
            setVisible(false);
        },
        async init(params: any, confirming = false) {

        },
        max() {
            form.setFieldsValue({
                amount: max.toString()
            })
        },
        submit(values: any) {
            const amount = valueToBigNumber(values.amount)
            if(amount.gt(max)){
                message.error('The quality must be less than max amount to deposit')
                return;
            }

            const { ok } = args
            ok({amount})
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
                <div className={styles.desc}>
                    <div className={styles.title}>{args?.txt?.title || ''}</div>
                    <div className={styles.text}>
                        {args?.txt?.desc || ''}
                    </div>
                </div>
                <div className={styles.form}>
                    <Row>
                        <Col span={20} offset={2}>
                            <Form
                                name="basic"
                                form={form}
                                layout={'vertical'}
                                onFinish={handler.submit}
                                autoComplete="off"
                            >
                                <div className={styles.able}>
                                    <span>{args?.txt?.available || ''}</span>
                                    <span className={styles.amount}><Bignumber value={max} /> {symbol}</span>
                                </div>
                                <Form.Item
                                    name="amount"
                                    rules={[{ required: true, message: args?.txt?.validate || '' }]}
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
                                        suffix={<a onClick={handler.max}>{args?.txt?.max || 'Max'}</a>}
                                    />
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 2, span: 20 }}>
                                    <Button block type="primary" htmlType="submit">
                                        {args?.txt?.button || ''}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </div>
            </Card>
        </Modal>
    );
};
