// Netlify Blobs REST API 工具模块
// 用 fetch 直接调用 Netlify Blobs REST API，不依赖 @netlify/blobs 包

const SITE_ID = process.env.NETLIFY_SITE_ID;
const API_TOKEN = process.env.NETLIFY_API_TOKEN;
const BASE_URL = `https://api.netlify.com/api/v1/sites/${SITE_ID}/blobs`;

async function blobFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res;
}

// 获取 blob（文本）
async function get(store, key) {
  try {
    const res = await blobFetch(`${BASE_URL}/${store}/${encodeURIComponent(key)}`, {
      redirect: 'manual',
    });
    // 404 = 不存在
    if (res.status === 404) return null;
    // 302/307 = 重定向到S3，需要再请求一次
    if (res.status === 302 || res.status === 307 || res.status === 301) {
      const s3Url = res.headers.get('location');
      if (s3Url) {
        // 请求S3，不带Authorization头（S3用预签名URL认证）
        const s3Res = await fetch(s3Url);
        if (s3Res.status === 404) return null;
        if (!s3Res.ok) throw new Error(`S3 GET failed: ${s3Res.status}`);
        return await s3Res.text();
      }
    }
    if (!res.ok) throw new Error(`Blobs GET failed: ${res.status}`);
    return await res.text();
  } catch (e) {
    console.error('Blobs get error:', e.message);
    return null;
  }
}

// 获取 blob（JSON）
async function getJSON(store, key) {
  const text = await get(store, key);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

// 设置 blob（文本）
async function set(store, key, value) {
  try {
    const res = await blobFetch(`${BASE_URL}/${store}/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: typeof value === 'string' ? value : JSON.stringify(value),
    });
    if (!res.ok) throw new Error(`Blobs SET failed: ${res.status}`);
    return true;
  } catch (e) {
    console.error('Blobs set error:', e.message);
    return false;
  }
}

// 设置 blob（JSON）
async function setJSON(store, key, value) {
  return set(store, key, JSON.stringify(value));
}

// 删除 blob
async function remove(store, key) {
  try {
    const res = await blobFetch(`${BASE_URL}/${store}/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Blobs DELETE failed: ${res.status}`);
    return true;
  } catch (e) {
    console.error('Blobs delete error:', e.message);
    return false;
  }
}

module.exports = { get, getJSON, set, setJSON, remove };
