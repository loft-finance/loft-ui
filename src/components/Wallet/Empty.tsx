import { Card, Result, Button } from 'antd';
import Back from '@/components/Back';
import { history } from 'umi';
export default () => (
  <Card bordered={false} style={{ paddingBottom: 30 }}>
    <Back />
    <Result
      icon={<></>}
      title="Your balance is zero"
      style={{}}
      subTitle="Your DAI balance is 0, please transfer DAI to your wallet to deposit"
    />
  </Card>
);
