import { Button, Card, Result } from 'antd';
import Back from '@/components/Back';
import { history } from 'umi';
export default ({ symbol = '', isBtn = false }) => (
  <Card bordered={false} style={{ paddingBottom: 30 }}>
    <Back />
    <Result
      icon={<></>}
      title="Your balance is zero"
      style={{}}
      subTitle={`Your ${symbol} balance is 0, please transfer ${symbol} to your wallet to deposit`}
      extra={[
        isBtn ? <Button type="primary" onClick={() => { history.push('/deposit') }} key="deposit">Deposit now</Button> : ''
      ]}
    />
  </Card>
);
