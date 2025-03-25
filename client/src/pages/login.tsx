import { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { authApi, LoginPayload } from '@/services/api/auth';
import { ErrorResponse } from '@/utils';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const onFinish = async (values: LoginPayload) => {
    try {
      setLoading(true);
      const response = await authApi.login(values);
      localStorage.setItem('token', response.token);
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      setErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Calendar App</title>
      </Head>
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <Card style={{ width: 400, padding: '24px' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Login</h1>
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Email" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
} 