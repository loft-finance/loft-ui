import { UseWalletProvider } from 'use-wallet';

import styles from './index.less';
import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { Link, useLocation } from 'umi';
// import { defineConfig } from 'umi';
const Layout: React.FC = ({ children }) => {
  // console.log(defineConfig)
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
      name: 'manage currency',
      url: '/loan',
      icon: 'icon-ic_loan'
    },
    {

      name: 'market',
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
  const location = useLocation();

  return (
    <UseWalletProvider
      autoConnect
      connectors={{
        injected: {},
        walletconnect: {
          rpc: { 42: 'https://kovan.infura.io/v3/' },
        },
      }}>

      <header className={styles.header}>
        <div className={styles.newmain + ' ' + styles.head}>
          <div className={styles.logo}>
            <Link to='/' ><img src='./logo.png' /></Link>
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


      {/* <div className={styles.newmain}> */}
      {children}
      {/* </div> */}

      <Footer />
    </UseWalletProvider>
  )
}

export default Layout;