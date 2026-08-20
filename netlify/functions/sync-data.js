// Netlify Function: 数据同步
// 用 Netlify Blobs 存储用户数据（匿名设备ID）

const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const store = getStore('cst-app-data');

    if (event.httpMethod === 'GET') {
      // 读取用户数据
      const deviceId = event.queryStringParameters?.deviceId;
      if (!deviceId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少 deviceId' }) };
      }

      const data = await store.get(`user:${deviceId}`, { type: 'json' });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: data || null }),
      };
    }

    if (event.httpMethod === 'POST') {
      // 保存用户数据
      const body = JSON.parse(event.body);
      const { deviceId, data } = body;

      if (!deviceId || !data) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少 deviceId 或 data' }) };
      }

      await store.setJSON(`user:${deviceId}`, {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      // 维护设备列表
      try {
        let devices = await store.get('devices', { type: 'json' }) || [];
        if (!devices.includes(deviceId)) {
          devices.push(deviceId);
          await store.setJSON('devices', devices);
        }
      } catch (e) {
        // 忽略设备列表更新失败
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: '方法不允许' }) };
  } catch (error) {
    console.error('数据同步错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
