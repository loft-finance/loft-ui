// https://umijs.org/config/
import { defineConfig } from 'umi';
import { join } from 'path';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default en-US
    default: 'en-US',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: false,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/market',
      name: 'market',
      icon: 'icon-ic_market',
      routes: [
        {
          path: '/market',
          redirect: '/market/index',
        },
        {
          path: '/market/index',
          name: 'index',
          component: './market/index',
          wrappers: [
            '@/pages/wrappers/index',
          ],
          hideInMenu: true,
        },
        {
          path: '/market/detail/:underlyingAsset/:id',
          name: 'detail',
          component: './market/detail',
          hideInMenu: true,
          wrappers: [
            '@/pages/wrappers/index',
          ],
        },
      ],
    },
    {
      path: '/deposit',
      name: 'deposit',
      icon: 'icon-ic_deposit',
      routes: [
        {
          path: '/deposit',
          redirect: '/deposit/index',
        },
        {
          path: '/deposit/index',
          name: 'index',
          component: './deposit/index',
          hideInMenu: true,
          wrappers: [
            '@/pages/wrappers/index',
          ],
        },
        {
          path: '/deposit/detail/:underlyingAsset/:id',
          name: 'detail',
          hideInMenu: true,
          routes: [
            {
              path: '/deposit/detail/:underlyingAsset/:id',
              redirect: '/deposit/detail/:underlyingAsset/:id/amount',
            },
            {
              path: '/deposit/detail/:underlyingAsset/:id/amount',
              name: 'amount',
              component: '@/pages/deposit/detail/amount',
              wrappers: [
                '@/pages/wrappers/index',
                '@/pages/deposit/detail/index',
              ],
              hideInMenu: true,
            },
            {
              path: '/deposit/detail/:underlyingAsset/:id/confirm/:amount',
              name: 'confirm',
              component: '@/pages/deposit/detail/confirm',
              wrappers: [
                '@/pages/wrappers/index',
                '@/pages/deposit/detail',
              ],
              hideInMenu: true,
            }
          ]
        },
        {
          path: '/deposit/withdraw/:underlyingAsset/:id',
          name: 'withdraw',
          hideInMenu: true,
          routes: [
            {
              path: '/deposit/withdraw/:underlyingAsset/:id',
              redirect: '/deposit/withdraw/:underlyingAsset/:id/amount',
            },
            {
              path: '/deposit/withdraw/:underlyingAsset/:id/amount',
              name: 'amount',
              component: '@/pages/deposit/withdraw/amount',
              wrappers: [
                '@/pages/wrappers/index',
                '@/pages/deposit/withdraw/index',
              ],
              hideInMenu: true,
            },
            {
              path: '/deposit/withdraw/:underlyingAsset/:id/confirm/:amount',
              name: 'confirm',
              component: '@/pages/deposit/withdraw/confirm',
              wrappers: [
                '@/pages/wrappers/index',
                '@/pages/deposit/withdraw',
              ],
              hideInMenu: true,
            }
          ]
        },
        {
          path: '/deposit/collateral/:underlyingAsset/:id/confirm/:status',
          name: 'collateral',
          component: '@/pages/deposit/collateral/confirm',
          hideInMenu: true,
          wrappers: [
            '@/pages/wrappers/index',
          ],
        }
      ],
    },
    {
      path: '/loan',
      name: 'loan',
      icon: 'icon-ic_loan',
      routes: [
        {
          path: '/loan',
          redirect: '/loan/index',
        },
        {
          path: '/loan/index',
          name: 'index',
          component: './loan/index',
          hideInMenu: true,
          wrappers: [
            '@/pages/wrappers/index',
          ],
        },
        {
          path: '/loan/detail/:underlyingAsset/:id',
          name: 'detail',
          hideInMenu: true,
          routes: [
            {
              path: '/loan/detail/:underlyingAsset/:id',
              redirect: '/loan/detail/:underlyingAsset/:id/amount',
            },
            {
              path: '/loan/detail/:underlyingAsset/:id/amount',
              name: 'amount',
              component: '@/pages/loan/detail/amount',
              wrappers: [
                '@/pages/wrappers/index',
                '@/pages/loan/detail/index',
              ],
              hideInMenu: true,
            },
            {
              path: '/loan/detail/:underlyingAsset/:id/confirm/:amount',
              name: 'confirm',
              component: '@/pages/loan/detail/confirm',
              wrappers: [
                '@/pages/wrappers/index',
                '@/pages/loan/detail',
              ],
              hideInMenu: true,
            }
          ]
        },
        {
          path: '/loan/repay/:underlyingAsset/:id',
          name: 'repay',
          hideInMenu: true,
          routes: [
            {
              path: '/loan/repay/:underlyingAsset/:id',
              redirect: '/loan/repay/:underlyingAsset/:id/amount',
            },
            {
              path: '/loan/repay/:underlyingAsset/:id/amount',
              name: 'amount',
              component: '@/pages/loan/repay/amount',
              wrappers: [
                '@/pages/wrappers/index',
                '@/pages/loan/repay/index',
              ],
              hideInMenu: true,
            },
            {
              path: '/loan/repay/:underlyingAsset/:id/confirm/:amount',
              name: 'confirm',
              component: '@/pages/loan/repay/confirm',
              wrappers: [
                '@/pages/wrappers/index',
                '@/pages/loan/repay/index',
              ],
              hideInMenu: true,
            }
          ]
        },
        {
          path: '/loan/rate/:underlyingAsset/:id/confirm/:rateMode',
          name: 'rate',
          component: '@/pages/loan/rate/confirm',
          hideInMenu: true,
          wrappers: [
            '@/pages/wrappers/index',
          ],
        }
      ],
    },
    {
      path: '/manage',
      name: 'manage',
      icon: 'icon-ic_platform_currency',
      component: './manage',
      wrappers: [
        '@/pages/wrappers/index',
      ],
    },
    {
      path: '/pledge',
      name: 'pledge',
      icon: 'icon-ic_Pledge',
      component: './pledge',
      wrappers: [
        '@/pages/wrappers/index',
      ],
    },
    {
      path: '/control',
      name: 'control',
      icon: 'icon-ic_control_panel',
      component: './control',
      wrappers: [
        '@/pages/wrappers/index',
      ],
    },
    {
      path: '/',
      redirect: '/market',
    },
    {
      component: '404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': '#38C79E',
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  openAPI: [
    {
      requestLibPath: "import { request } from 'umi'",
      // 或者使用在线的版本
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from 'umi'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  nodeModulesTransform: {
    type: 'none',
  },
  mfsu: {},
  webpack5: {},
  exportStatic: {},
});
