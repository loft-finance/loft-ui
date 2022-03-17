import { useRef } from 'react';
import { Space, Button, Menu, Dropdown } from 'antd';
import React from 'react';
import { useModel, SelectLang } from 'umi';
import styles from './index.less';
import { createFromIconfontCN } from '@ant-design/icons';
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_3128701_ei68zukt4a9.js',
});
import { getNetwork } from '@/lib/helpers/provider';
import Connect from '@/components/Wallet/Connect';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }

  const { wallet, disconnect } = useModel('wallet');

  const connectRef = useRef();

  const handler = {
    connect() {
      connectRef.current.show();
    },
    disconnect(){
      disconnect()
    }
  };

  const menu = (
    <Menu>
      {/* <Menu.Divider /> */}
      <Menu.Item key="3" onClick={handler.disconnect}>DISCONNECT</Menu.Item>
    </Menu>
  );

  const { current: currentMarket } = useModel('market');
  const chainId = currentMarket.chainId
  const networkConfig = getNetwork(chainId);

  return (
    <>
      <Space className={className}>
        <IconFont type="icon-ic_twitter" className={styles.share} />
        <IconFont type="icon-ic_telegram" className={styles.share} />
        {!wallet && (
          <Button
            size="small"
            style={{ borderRadius: 16, padding: '0 10px 24px' }}
            onClick={handler.connect}
          >
            connect
          </Button>
        )}
        {!!wallet && (
          <Dropdown overlay={menu} trigger={['click']}>
            <div className={styles.user}>
              {networkConfig.name} Network
              <div className={styles.account}>{wallet.currentAccount.slice(0,4)}...{wallet.currentAccount.slice(-4)}</div>
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
