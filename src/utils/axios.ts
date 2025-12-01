import axios, { type AxiosInstance } from 'axios'
import { useAuthStore } from "@/stores/auth";
import { config } from '@/utils/config.ts'

const conf = await config.getConfig()
const baseUrl = conf.baseUrl

const service:AxiosInstance = axios.create(
  {
    baseURL: baseUrl + 'api/v1/',
    timeout: 60000,
    withCredentials: true,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    }
  }
)

service.interceptors.request.use(
  (config) => {
    const auth = useAuthStore()
    if (auth.token.accessToken)
    {
      config.headers.Authorization = `Bearer ${auth.token.accessToken}`
    }
    return config;
  }
)

service.interceptors.response.use(
  (response) => response,
  async (error) => {
    const auth = useAuthStore();
    if (error.response?.status === 401) {
      // access_token 过期，尝试刷新
      try {
        const token:string = await auth.resetTokens()
        error.config.headers.Authorization = `Bearer ${token}`;
        return service.request(error.config);
      } catch (_e) {
        window.location.href = "/login";
        return Promise.reject(new Error("登录已过期，请重新登录"));
      }
    }
    return Promise.reject(error);
  }
)

export default service
