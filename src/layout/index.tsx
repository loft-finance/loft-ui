import { UseWalletProvider } from 'use-wallet';

import styles from './index.less';
import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { Link, useLocation, useModel } from 'umi';

import '../pages/wrappers/index.less';
import { useEffect, useLayoutEffect, useRef } from 'react';

const navList = [
  {
    name: 'market',
    url: '/market',
    icon: 'icon-ic_market'
  },
  {
    name: 'deposit',
    url: '/deposit',
    icon: 'icon-ic_deposit'
  },
  {
    name: 'loan',
    url: '/loan',
    icon: 'icon-ic_loan'
  },
  {

    name: 'manage currency',
    url: '/manage',
    icon: 'icon-ic_platform_currency'
  },
  {
    name: 'pledge',
    url: '/pledge',
    icon: 'icon-ic_Pledge'
  },
  {
    name: 'control panel',
    url: '/control',
    icon: 'icon-ic_control_panel'
  }
]

const Layout: React.FC = ({ children }) => {
  console.log(process.env.NODE_ENV)
  const location = useLocation();

  // const { reserves } = useModel('pool')
  const { domUpdateDid } = useModel('domUpdateDid');

  const footerRef = useRef(null);
  const appRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const appEle = (appRef.current as any);
    const footerEle = (footerRef.current as any);
    const contentEle = (contentRef.current as any);
    const classVal = footerEle.getAttribute('class') || '';
    const contentClass = contentEle.getAttribute('class') || '';

    if (appEle.offsetHeight >= document.documentElement.clientHeight && classVal.indexOf('footerstatic') == -1) {
      footerEle.setAttribute('class', classVal + ' ' + 'footerstatic');
      contentEle.setAttribute('class', '');
    } else {
      footerEle.setAttribute('class', classVal.replace(/footerstatic/g, ''));
      contentClass.indexOf('contentmain') == -1 && contentEle.setAttribute('class', 'contentmain');
    }
  }, [domUpdateDid, location.pathname]);

  return (
    <UseWalletProvider
      autoConnect
      connectors={{
        injected: {},
        walletconnect: {
          rpc: { 42: 'https://kovan.infura.io/v3/' },
        },
      }}>
      <div ref={appRef}>
        <header className={styles.header}>
          <div className={styles.newmain + ' ' + styles.head}>
            <div className={styles.logo}>
              <Link to='/' ><img src='/logo.png' /></Link>
            </div>
            <div className={styles.nav}>
              {
                navList.map((item: any, index: number) => {
                  return (<div key={index} className={location.pathname.indexOf(item.url) > -1 ? styles.active : ''}>
                    <Link to={item.url} >
                      <svg width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" className="">
                        <use xlinkHref={`#${item.icon}`}></use>
                      </svg>
                      <span>{item.name}</span></Link>
                  </div>)
                })
              }
            </div>
            <RightContent />
          </div>
        </header>
        <div ref={contentRef}>
          {children}
        </div>
        <div ref={footerRef} className={styles.footer}>
          <Footer />
        </div>
      </div>
    </UseWalletProvider>
  )
}

export default Layout;