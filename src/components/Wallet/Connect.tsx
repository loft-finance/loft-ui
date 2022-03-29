import { useState, useImperativeHandle } from 'react';
import { Modal, Row, Col, Spin, Image, Popconfirm  } from 'antd';
import { useModel } from 'umi';
import IconMetamask from '@/images/wallet/metamask.png'
import IconWalletConnect from '@/images/wallet/wallet-connect.png'
import IconBsc from '@/images/wallet/bsc.png'
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
                    src={IconMetamask}
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
                  src={IconWalletConnect}
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
                  src={IconBsc}
                />
              </Col>
            </Row>
          </div>
        </div>
      </Spin>
    </Modal>
  );
}
