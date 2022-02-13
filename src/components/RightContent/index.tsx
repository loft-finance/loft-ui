import { useRef } from 'react';
import { Space, Button } from 'antd';
import React from 'react';
import { useModel, SelectLang } from 'umi';
import styles from './index.less';
import { createFromIconfontCN } from '@ant-design/icons';
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_3128701_ei68zukt4a9.js',
});

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

  const connectRef = useRef();

  const handler = {
    connect() {
      connectRef.current.show();
    },
  };

  const { wallet } = initialState;

  return (
    <>
      <Space className={className}>
        <IconFont type="icon-ic_twitter" className={styles.share} />
        <IconFont type="icon-ic_telegram" className={styles.share} />
        {!wallet && (
          <Button
            size="small"
            style={{ borderRadius: 16, padding: '0 10px' }}
            onClick={handler.connect}
          >
            connect
          </Button>
        )}
        {wallet && (
          <div className={styles.user}>
            Ftm Network
            <div className={styles.account}>0x00...176c</div>
          </div>
        )}
        <SelectLang className={styles.action} />
      </Space>
      <Connect refs={connectRef} />
    </>
  );
};

export default GlobalHeaderRight;
