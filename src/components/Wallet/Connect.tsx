import { useState, useImperativeHandle } from 'react';
import { Modal, Row, Col, Spin, Image, Popconfirm  } from 'antd';
import { useModel } from 'umi';

import styles from './Connect.less';

export default function ({ refs }: any) {
  useImperativeHandle(refs, () => {
    return {
      show: () => {
        setVisible(true);
      },
      close: handler.close,
    };
  });

  const { connect, disconnect, status, wallet } = useModel('wallet')

  // console.log('wallet:', wallet)

  const handler = {
    close: () => {
      setVisible(false);
    },
    connect: (type: string) => {
      connect(type)
      handler.close()
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
      <Spin spinning={status === 'connecting'}>
        <div className={styles.box}>
          <Popconfirm
            title={`Are you sure to ${wallet?.current == 'MetaMask' ? 'disconnect': 'connect'} MetaMask?`}
            onConfirm={()=>handler.connect('MetaMask')}
            okText="Yes"
            cancelText="No"
          >
            <div className={`${styles.item} ${wallet?.current == 'MetaMask' ? styles.active : null}`}>
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
          <div className={`${styles.item} ${wallet?.current == 'WalletConnect' ? styles.active : null}`}>
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
          <div className={`${styles.item} ${wallet?.current == 'BinanceChainWallet' ? styles.active : null}`}>
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
