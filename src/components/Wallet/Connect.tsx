import { useState, useImperativeHandle } from 'react';
import { Modal, Row, Col, Image } from 'antd';
import IconMetamask from '@/images/wallet/metamask.png'
import IconWalletConnect from '@/images/wallet/wallet-connect.png'
import styles from './Connect.less';
import { useWallet } from 'use-wallet';

export default function ({ refs }: any) {
  
  const { connect, reset } = useWallet();

  useImperativeHandle(refs, () => {
    return {
      show: () => {
        setVisible(true);
      },
      close: handler.close,
    };
  });

  const handler = {
    close: () => {
      setVisible(false);
    },
    connect: (type: string) => {
      connect(type)
      handler.close()
    },
    disconnect: () => {
      reset()
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
      <div className={styles.box}>

        <div className={`${styles.item}`} onClick={() => handler.connect('injected')}>
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

        <div className={`${styles.item}`}>
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

      </div>
    </Modal>
  );
}
