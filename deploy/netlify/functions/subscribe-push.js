// Netlify Function: 推送订阅
// 保存用户的推送订阅信息

const blobs = require('./blobs-helper.js');
const STORE = 'cst-app-data';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: '方法不允许' }) };
    }

    const body = JSON.parse(event.body);
    const { deviceId, subscription } = body;

    if (!deviceId || !subscription) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少 deviceId 或 subscription' }) };
    }

    await blobs.setJSON(STORE, `push:${deviceId}`, {
      subscription,
      createdAt: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('推送订阅错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
