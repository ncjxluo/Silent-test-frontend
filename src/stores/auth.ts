import { defineStore } from 'pinia'
import service from '@/utils/axios.ts'
import { router } from '@/router'


interface TokenPayload {
  accessToken: string
  username: string
}

interface AuthState {
  token: TokenPayload;
  isRefreshing: boolean;
  refreshSubscribers: ((token: string) => void)[]
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => (
    {
      token: {accessToken:"", username:""},
      isRefreshing: false,
      refreshSubscribers: [],
    }
  ),
  actions: {
    setTokens(payload:TokenPayload) {
      this.token = payload
    },
    clearTokens() {
      this.token = { accessToken: '', username: '' };
    },
    async logout() {
      await service.post('auth/logout', {})
      this.clearTokens()
      localStorage.clear()
      await router.push('/login')
    },
    async resetTokens(): Promise<string> {

      if (this.isRefreshing){
        return new Promise((resolve) => {
          this.refreshSubscribers.push(resolve);
        })
      }

      this.isRefreshing = true
      return await this.refresh()
    },
    async refresh() {
      try{
        const res = await service.post('/auth/refresh', {});
        const payload: TokenPayload = {
          accessToken: res.data.data.access_token,
          username: res.data.data.username,
        };
        this.setTokens(payload);
        this.refreshSubscribers.forEach((cb) => cb(payload.accessToken));
        this.refreshSubscribers = [];
        return payload.accessToken;
      }
     finally {
        this.isRefreshing = false;
      }
    }
  }
})
