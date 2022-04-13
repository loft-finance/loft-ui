import { useRef } from 'react';
import { Space, Button, Menu, Dropdown } from 'antd';
import React from 'react';
import { useModel, SelectLang } from 'umi';
import styles from './index.less';
import { createFromIconfontCN } from '@ant-design/icons';
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_3128701_ei68zukt4a9.js',
});
// import { getNetwork } from '@/lib/helpers/provider';
import Connect from '@/components/Wallet/Connect';
import networkNameConfig from './index.network';
import { useWallet } from 'use-wallet';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { reset, account, chainId, isConnected } = useWallet();

  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  let className = styles.right;

  const connectRef = useRef();

  const handler = {
    connect() {
      (connectRef as any).current.show();
    },
    disconnect() {
      reset()
    }
  };

  const menu = (
    <Menu>
      {/* <Menu.Divider /> */}
      <Menu.Item key="3" onClick={handler.disconnect}>DISCONNECT</Menu.Item>
    </Menu>
  );

  const networkConfig = networkNameConfig[chainId || 0];

  return (
    <>
      <Space className={className}>
        <IconFont type="icon-ic_twitter" className={styles.share} />
        <IconFont type="icon-ic_telegram" className={styles.share} />
        {!isConnected() && (
          <Button
            size="small"
            style={{ borderRadius: 16, padding: '0 10px 24px' }}
            onClick={handler.connect}
          >
            connect
          </Button>
        )}
        {isConnected() && !!account && (
          <Dropdown overlay={menu} trigger={['click']}>
            <div className={styles.user}>
              {networkConfig || 'Anther'} Network
              <div className={styles.account}>{account.slice(0, 4)}...{account.slice(-4)}</div>
            </div>
          </Dropdown>
        )}
        <SelectLang className={styles.action} />
      </Space>
      <Connect refs={connectRef} />
    </>
  );
};

export default GlobalHeaderRight;
