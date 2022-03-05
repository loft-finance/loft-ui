import { Card, Result } from 'antd';
import Back from '@/components/Back';
export default ({ symbol='' }) => (
  <Card bordered={false} style={{ paddingBottom: 30 }}>
    <Back />
    <Result
      icon={<></>}
      title="Your balance is zero"
      style={{}}
      subTitle={`Your ${symbol} balance is 0, please transfer ${symbol} to your wallet to deposit`}
    />
  </Card>
);
