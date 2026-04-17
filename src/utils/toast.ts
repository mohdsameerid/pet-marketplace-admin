import { toast as _toast } from 'react-hot-toast';

const info = (message: string) =>
  _toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#eff6ff',
      color: '#1d4ed8',
      border: '1px solid #bfdbfe',
    },
  });

export const toast = Object.assign(_toast, { info });
