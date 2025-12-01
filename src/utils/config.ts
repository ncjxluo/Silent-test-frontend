// import conf from '../../public/config/config.json'
//
// export const config = {
//   conf
// }

// utils/config.ts
let appConfig:any = null;

export const config = {
  // 动态加载配置
  async loadConfig() {
    if (appConfig) return appConfig;

    try {
      const response = await fetch('/config/config.json');
      appConfig = await response.json();
      return appConfig;
    } catch (error) {
      console.error('Failed to load config:', error);
      // 默认配置
      appConfig = {
        baseUrl: window.location.origin
      };
      return appConfig;
    }
  },

  // 获取配置
  async getConfig() {
    return await this.loadConfig();
  }
};
