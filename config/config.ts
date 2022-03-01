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
    baseNavigator: true,
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
          hideInMenu: true,
        },
        {
          path: '/market/detail/:underlyingAsset/:id',
          name: 'detail',
          component: './market/detail',
          hideInMenu: true,
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
        },
        {
          path: '/deposit/detail/:id',
          name: 'detail',
          component: './deposit/detail',
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/loan',
      name: 'loan',
      icon: 'icon-ic_loan',
      component: './loan',
    },
    {
      path: '/manage',
      name: 'manage',
      icon: 'icon-ic_platform_currency',
      component: './manage',
    },
    {
      path: '/pledge',
      name: 'pledge',
      icon: 'icon-ic_Pledge',
      component: './pledge',
    },
    {
      path: '/control',
      name: 'control',
      icon: 'icon-ic_control_panel',
      component: './control',
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
