import React, { useRef, useState } from 'react';
import { useModel, history } from 'umi';
import { Table, Card, Row, Col, Menu, Button } from 'antd';
import { SettingOutlined, UserOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';

import styles from './style.less';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { wallet } = initialState;

  const handler = {
    detail(record) {
      history.push('/loan/detail/' + record.key);
    },
  };

  const columns = [
    {
      title: 'Assets',
      dataIndex: 'name',
    },
    {
      title: 'Can be borrowed',
      dataIndex: 'chinese',
      sorter: {
        compare: (a, b) => a.chinese - b.chinese,
        multiple: 3,
      },
    },
    {
      title: 'Borrow APY',
      dataIndex: 'math',
      sorter: {
        compare: (a, b) => a.math - b.math,
        multiple: 2,
      },
    },
  ];

  const data = [
    {
      key: '1',
      name: 'John Brown',
      chinese: 98,
      math: 60,
    },
    {
      key: '2',
      name: 'Jim Green',
      chinese: 98,
      math: 66,
    },
    {
      key: '3',
      name: 'Joe Black',
      chinese: 98,
      math: 90,
    },
    {
      key: '4',
      name: 'Jim Red',
      chinese: 88,
      math: 99,
    },
  ];
  return (
    <GridContent>
      <Row>
        <Col>form</Col>
      </Row>
      <Row>
        <Col span={16}>
          <Table
            rowKey={'name'}
            columns={columns}
            dataSource={data}
            pagination={false}
            onRow={(record) => ({ onClick: () => handler.detail(record) })}
          />
        </Col>
        <Col style={{ marginTop: 20 }} span={6} offset={1}>
          <Menu className={styles.menu} selectable={false}>
            <Menu.Item
              key="header"
              style={{ borderRadius: '3px 3px 0 0', background: '#151515', color: '#fff' }}
            >
              My deposits
            </Menu.Item>
            <Menu.Item key="center">
              <UserOutlined />
              USDT
              <span className={styles.value}>1.500001</span>
            </Menu.Item>
            <Menu.Item key="settings">
              <SettingOutlined />
              DAI
              <span className={styles.value}>1.500001</span>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="total">
              Total
              <span className={styles.value}>1.500001</span>
            </Menu.Item>
          </Menu>
        </Col>
      </Row>
    </GridContent>
  );
};