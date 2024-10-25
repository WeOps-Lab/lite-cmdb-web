import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useEffect, useCallback, useState, useRef } from 'react';
import { useAuth } from '@/context/auth';
import { message } from 'antd';
import { signIn } from 'next-auth/react';
import { useTranslation } from '@/utils/i18n';

const apiClient = axios.create({
  baseURL: '/reqApi',
  timeout: 100000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleResponse = (response: AxiosResponse, onError?: () => void) => {
  const { result, message: msg, data } = response.data;
  if (!result) {
    message.error(msg);
    if (onError) {
      onError();
    }
    throw new Error(msg);
  }
  return data;
};

const useApiClient = () => {
  const { t } = useTranslation();
  const authContext = useAuth();
  const token = authContext?.token || null;
  const tokenRef = useRef(token);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tokenRef.current = token;
    if (token) {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // 请求拦截器
    const requestInterceptor = apiClient.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!tokenRef.current) {
          signIn('keycloak');
          return Promise.reject(new Error('No token available'));
        }
        config.headers.Authorization = `Bearer ${tokenRef.current}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    const responseInterceptor = apiClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response) {
          const { status } = error.response;
          const messageText = error.response?.data?.message;
          if (status === 401) {
            // 处理 401 错误，重定向到 Keycloak 登录页面
            signIn('keycloak');
          } else if (status === 403) {
            // 处理 403 错误，显示无权限消息
            message.error(messageText || t('common.noPermission'));
            return Promise.reject(new Error(messageText));
          } else if (status === 500) {
            // 处理 500 错误，例如显示错误消息
            message.error(messageText || t('common.serverError'));
            return Promise.reject(new Error(t('common.serverError')));
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
  }, []);

  // 封装请求方法，并使用 useCallback 确保函数是稳定的
  const get = useCallback(async <T = any>(url: string, config?: AxiosRequestConfig, onError?: () => void): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return handleResponse(response, onError);
  }, []);

  const post = useCallback(async <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig, onError?: () => void): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return handleResponse(response, onError);
  }, []);

  const put = useCallback(async <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig, onError?: () => void): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return handleResponse(response, onError);
  }, []);

  const del = useCallback(async <T = any>(url: string, config?: AxiosRequestConfig, onError?: () => void): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return handleResponse(response, onError);
  }, []);

  const patch = useCallback(async <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig, onError?: () => void): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return handleResponse(response, onError);
  }, []);

  return { get, post, put, del, patch, isLoading };
};

export default useApiClient;