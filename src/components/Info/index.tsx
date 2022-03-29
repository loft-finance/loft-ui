import { Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './style.less';

export default ({ title = '', items = [] }: any) => {
  return (
    <div className={styles.info}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.content}>
        <Row>
          {items.map((item: any, index: number) => (
            <Col key={index} span={item.span?item.span:6} className={styles.col}>
              <div className={styles.text}>
                {item.title} {item.info && <InfoCircleOutlined className={styles.icon} />}
              </div>
              <div className={styles.value} style={item.style ? item.style : {}}>
                {!item.content && (
                  <>
                    {item.value}
                    {item.tag && <span className={styles.tag}>{item.tag}</span>}
                  </>
                )}
                {!!item.content && <>{item.content}</>}
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};
