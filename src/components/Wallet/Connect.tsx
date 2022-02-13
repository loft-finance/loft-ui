import React, { useEffect, useState, useImperativeHandle } from 'react';
import { Modal, Spin, Button } from 'antd';
import { useModel } from 'umi';

export default function ({ refs }) {
  useImperativeHandle(refs, () => {
    return {
      show: () => {
        setVisible(true);
      },
      close: handler.close,
    };
  });

  const { initialState, setInitialState } = useModel('@@initialState');

  const handler = {
    close: () => {
      setVisible(false);
    },
    connect: () => {
      setInitialState({
        ...initialState,
        wallet: {
          balance: 1,
          auth: false,
        },
      });

      setVisible(false);
    },
  };

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Modal
      title={'连接钱包'}
      visible={visible}
      onCancel={handler.close}
      okText={'确定'}
      cancelText={'取消'}
      width={600}
      footer={false}
    >
      <Spin spinning={loading}>
        <Button type="primary" onClick={handler.connect}>
          connect
        </Button>
      </Spin>
    </Modal>
  );
}
