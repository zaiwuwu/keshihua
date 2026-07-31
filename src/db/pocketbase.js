import PocketBase from 'pocketbase';

// 使用相同域名访问 PocketBase API —— 开发模式 Vite 代理 /api 到 localhost:8090
// 生产模式需将前端和 PocketBase 部署在同一域名下
const PB_URL = '';

let _client = null;

export function getClient() {
  if (!_client) {
    _client = new PocketBase(PB_URL);
  }
  return _client;
}

export default getClient;
