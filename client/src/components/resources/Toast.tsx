import { notification } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

type NotificationType = 'success' | 'error';

export const showToast = (type: NotificationType, message: string) => {
  notification[type]({
    message: type === 'success' ? 'Success' : 'Failed',
    description: message,
    icon: type === 'success' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    placement: 'topRight',
    duration: 3
  });
};
