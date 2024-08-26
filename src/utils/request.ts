import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/context/auth';
import { message } from 'antd';
import { signIn } from 'next-auth/react';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'reqApi',
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

const useApiClient = () => {
  const authContext = useAuth();
  const token = authContext?.token || null;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // 请求拦截器
    const requestInterceptor = apiClient.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!token) {
          signIn('keycloak');
          return Promise.reject(new Error('No token available'));
        }
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    const responseInterceptor = apiClient.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error) => {
        if (error.response) {
          const { status } = error.response;
          const messgae = error.response?.data?.message
          if (status === 401) {
            // 处理 401 错误，重定向到 Keycloak 登录页面
            signIn('keycloak');
          } else if (status === 403) {
            // 处理 403 错误，显示无权限消息
            message.error(messgae);
          } else if (status === 500) {
            // 处理 500 错误，例如显示错误消息
            console.error('Server error:', messgae);
            message.error('服务器错误，请稍后再试');
          }
        }
        return Promise.reject(error);
      }
    );

    // 清理拦截器
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // 封装请求方法，并使用 useCallback 确保函数是稳定的
  const get = useCallback((url: string, config?: AxiosRequestConfig) => {
    return apiClient.get(url, config);
  }, []);

  const post = useCallback((url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return apiClient.post(url, data, config);
  }, []);

  const put = useCallback((url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return apiClient.put(url, data, config);
  }, []);

  const del = useCallback((url: string, config?: AxiosRequestConfig) => {
    return apiClient.delete(url, config);
  }, []);

  return { get, post, put, del, isLoading };
};

export default useApiClient;
