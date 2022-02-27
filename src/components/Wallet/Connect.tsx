import React, { useEffect, useState, useImperativeHandle } from 'react';
import { Modal, Row, Col, Spin, Image, Popconfirm  } from 'antd';
import { useModel } from 'umi';
// import { hooks, metaMask } from '@/lib/connectors/metaMask'

// const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

import styles from './Connect.less';

export default function ({ refs }) {
  useImperativeHandle(refs, () => {
    return {
      show: () => {
        setVisible(true);
      },
      close: handler.close,
    };
  });

  const { current, connect, disconnect, reconnect, connecting, currentAccount } = useModel('wallet')

  console.log('wallet status:', currentAccount)

  const { initialState, setInitialState } = useModel('@@initialState');

  const handler = {
    close: () => {
      setVisible(false);
    },
    connect: (type: string) => {
      // onClick={()=>current ? (current == 'MetaMask' ? disconnect() : reconnect('MetaMask')) : connect('MetaMask')}

      if(current){
        if(current == type){
          disconnect()
        }
        reconnect(type)
      } else {
        connect(type)
      }
      // setInitialState({
      //   ...initialState,
      //   wallet: {
      //     balance: 1,
      //     auth: false,
      //   },
      // });

      // setVisible(false);
    },
    disconnect: () => {
      disconnect()
    }
  };

  const [visible, setVisible] = useState(false);

  return (
    <Modal
      title={'Connect to wallet'}
      visible={visible}
      onCancel={handler.close}
      width={480}
      wrapClassName={'modalConnect'}
      bodyStyle={{
        padding: '12px 24px'
      }}
      footer={false}
    >
      <Spin spinning={connecting}>
        <div className={styles.box}>
          <Popconfirm
            title={`Are you sure to ${current == 'MetaMask' ? 'disconnect': 'connect'} MetaMask?`}
            onConfirm={()=>handler.connect('MetaMask')}
            okText="Yes"
            cancelText="No"
          >
            <div className={`${styles.item} ${current == 'MetaMask' ? styles.active : null}`}>
              <Row>
                <Col span={18} className={styles.title}>
                  MetaMask
                </Col>
                <Col span={6} className={styles.icon}>
                  <Image
                    width={34}
                    preview={false}
                    src={'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimgres.1666.com%2F1666%2F72%2F359331-202110091420106161349a96987.jpg&refer=http%3A%2F%2Fimgres.1666.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1648386669&t=07e7aba201369e4269a4a4b59b880e6c'}
                  />
                </Col>
              </Row>
            </div>
          </Popconfirm>
          <div className={`${styles.item} ${current == 'WalletConnect' ? styles.active : null}`}>
            <Row>
              <Col span={18} className={styles.title}>
                WalletConnect
              </Col>
              <Col span={6} className={styles.icon}>
                <Image
                  width={34}
                  preview={false}
                  src={'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimgres.1666.com%2F1666%2F72%2F359331-202110091420106161349a96987.jpg&refer=http%3A%2F%2Fimgres.1666.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1648386669&t=07e7aba201369e4269a4a4b59b880e6c'}
                />
              </Col>
            </Row>
          </div>
          <div className={`${styles.item} ${current == 'BinanceChainWallet' ? styles.active : null}`}>
            <Row>
              <Col span={18} className={styles.title}>
                Binance Chain Wallet
              </Col>
              <Col span={6} className={styles.icon}>
                <Image
                  width={34}
                  preview={false}
                  src={'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimgres.1666.com%2F1666%2F72%2F359331-202110091420106161349a96987.jpg&refer=http%3A%2F%2Fimgres.1666.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1648386669&t=07e7aba201369e4269a4a4b59b880e6c'}
                />
              </Col>
            </Row>
          </div>
        </div>
      </Spin>
    </Modal>
  );
}
