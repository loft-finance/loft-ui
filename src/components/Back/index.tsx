import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { history } from 'umi';
export default ({}) => {
  return (
    <Button
      size="small"
      onClick={() => history.goBack()}
      style={{ borderRadius: 16, paddingBottom: 10 }}
      icon={<LeftOutlined style={{ fontSize: 10, marginRight: -3 }} />}
    >
      Back
    </Button>
  );
};
