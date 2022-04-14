import { useIntl } from 'umi';
import { DefaultFooter } from '@ant-design/pro-layout';

export default () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: 'Copyright © 2006-2021 Loan agreement',
  });

  const currentYear = new Date().getFullYear();

  return <DefaultFooter style={{position:'fixed', bottom:0, left:0, right:0, padding:0}} copyright={`${currentYear} ${defaultMessage}`}/>;
};
