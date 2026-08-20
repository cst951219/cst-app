// Netlify Function: 同步运动数据（苹果快捷指令调用）

const blobs = require('./blobs-helper.js');
const STORE = 'cst-app-data';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { deviceId, calories, steps, date } = body;

      if (!deviceId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少 deviceId' }) };
      }

      const todayStr = date || new Date().toISOString().split('T')[0];

      // 读取现有用户数据
      let userData = await blobs.getJSON(STORE, `user:${deviceId}`) || {};
      if (!userData.exercise) userData.exercise = {};

      // 更新运动数据
      userData.exercise[todayStr] = {
        calories: calories || 0,
        steps: steps || 0,
        source: 'apple_health',
        syncedAt: new Date().toISOString(),
      };
      userData.updatedAt = new Date().toISOString();

      // 保存
      await blobs.setJSON(STORE, `user:${deviceId}`, userData);

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
        body: JSON.stringify({
          success: true,
          date: todayStr,
          calories: calories || 0,
          steps: steps || 0,
        }),
      };
    }

    if (event.httpMethod === 'GET') {
      const deviceId = event.queryStringParameters?.deviceId;
      const date = event.queryStringParameters?.date || new Date().toISOString().split('T')[0];

      if (!deviceId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少 deviceId' }) };
      }

      const userData = await blobs.getJSON(STORE, `user:${deviceId}`) || {};
      const exercise = userData.exercise?.[date] || { calories: 0, steps: 0, source: null };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, date, exercise }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: '方法不允许' }) };
  } catch (error) {
    console.error('运动数据同步错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
