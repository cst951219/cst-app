// Netlify Function: 数据同步
// 用 Netlify Blobs REST API 存储用户数据（匿名设备ID）

const blobs = require('./blobs-helper.js');
const STORE = 'cst-app-data';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    if (event.httpMethod === 'GET') {
      const deviceId = event.queryStringParameters?.deviceId;
      if (!deviceId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少 deviceId' }) };
      }

      const data = await blobs.getJSON(STORE, `user:${deviceId}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: data || null }),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { deviceId, data } = body;

      if (!deviceId || !data) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少 deviceId 或 data' }) };
      }

      await blobs.setJSON(STORE, `user:${deviceId}`, {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      // 维护设备列表
      try {
        let devices = await blobs.getJSON(STORE, 'devices') || [];
        if (!devices.includes(deviceId)) {
          devices.push(deviceId);
          await blobs.setJSON(STORE, 'devices', devices);
        }
      } catch (e) {}

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
