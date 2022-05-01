import { Button, Card, Result } from 'antd';
import Back from '@/components/Back';
import { history } from 'umi';
export default ({ symbol = '', isBtn = false, title = 'Your balance is zero', subTitle = '' }) => {

  const newSubTitle = subTitle ? subTitle : `Your balance of ${symbol} is 0, transfer ${symbol} to your wallet to be able to supply`;

  return <Card bordered={false} style={{ paddingBottom: 30 }}>
    <Back />
    <Result
      icon={<></>}
      title={title}
      style={{}}
      subTitle={newSubTitle}
      extra={[
        isBtn ? <Button type="primary" onClick={() => { history.push('/deposit') }} key="deposit">Supply now</Button> : ''
      ]}
    />
  </Card>
}
