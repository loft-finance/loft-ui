import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  primaryColor: '#38C79E',
  layout: 'top',
  contentWidth: 'Fixed',
  headerHeight: 48,
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  splitMenus: false,
  title: 'Loft',
  pwa: false,
  logo: '/logo.png',
  iconfontUrl: '',
};

export default Settings;
