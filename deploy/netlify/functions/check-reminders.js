// Netlify Function: 定时检查提醒并发送推送
// 由 cron-job.org 或 Netlify 定时触发器每天调用

const { getStore } = require('@netlify/blobs');
const webpush = require('web-push');

// 配置 VAPID（从环境变量读取）
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:cst-app@example.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const store = getStore('cst-app-data');

    // 获取所有设备列表
    let devices = [];
    try {
      const devicesData = await store.get('devices', { type: 'json' });
      devices = devicesData || [];
    } catch (e) {
      devices = [];
    }

    const today = new Date().toISOString().split('T')[0];
    const results = [];

    for (const deviceId of devices) {
      try {
        // 读取用户数据
        const userData = await store.get(`user:${deviceId}`, { type: 'json' });
        if (!userData) continue;

        // 读取推送订阅
        const pushData = await store.get(`push:${deviceId}`, { type: 'json' });
        if (!pushData?.subscription) continue;

        const reminders = [];

        // 检查计划（今天到期或逾期）
        if (userData.plans) {
          for (const plan of userData.plans) {
            if (plan.completed || !plan.dueDate) continue;
            const dueDate = plan.dueDate;
            const daysDiff = Math.ceil((new Date(dueDate) - new Date(today)) / (1000 * 60 * 60 * 24));

            // 今天到期或逾期1天内的发送提醒
            if (daysDiff === 0 || daysDiff === -1) {
              reminders.push({
                type: 'plan',
                title: daysDiff === 0 ? '今日待办' : '已逾期',
                body: plan.title,
              });
            }
            // 提前提醒（根据reminderDays）
            else if (plan.reminderDays && daysDiff > 0 && daysDiff <= plan.reminderDays) {
              reminders.push({
                type: 'plan',
                title: `即将到期（${daysDiff}天后）`,
                body: plan.title,
              });
            }
          }
        }

        // 检查大事件（今天或明天）
        if (userData.events) {
          for (const event of userData.events) {
            if (!event.date) continue;
            const eventDate = event.recurrence === 'yearly'
              ? getNextYearlyDate(event.date, today)
              : event.date;
            const daysDiff = Math.ceil((new Date(eventDate) - new Date(today)) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0 || daysDiff === 1) {
              reminders.push({
                type: 'event',
                title: daysDiff === 0 ? '今天' : '明天',
                body: `${event.emoji || '✨'} ${event.title}`,
              });
            }
          }
        }

        // 检查好友生日（今天或明天）
        if (userData.friends) {
          for (const friend of userData.friends) {
            if (!friend.birthMonth || !friend.birthDay) continue;
            const nextBirthday = getNextBirthday(friend.birthMonth, friend.birthDay, today);
            const daysDiff = Math.ceil((new Date(nextBirthday) - new Date(today)) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0 || daysDiff === 1) {
              reminders.push({
                type: 'birthday',
                title: daysDiff === 0 ? '今天生日' : '明天生日',
                body: `🎂 ${friend.name}`,
              });
            }
          }
        }

        // 发送推送
        for (const reminder of reminders) {
          try {
            await webpush.sendNotification(
              pushData.subscription,
              JSON.stringify({
                title: `CST APP · ${reminder.title}`,
                body: reminder.body,
                icon: '/icons/icon-192.png',
                url: '/',
              })
            );
            results.push({ deviceId, sent: reminder.title });
          } catch (pushError) {
            console.error(`推送发送失败 ${deviceId}:`, pushError.message);
            // 推送订阅失效，删除
            if (pushError.statusCode === 410) {
              await store.delete(`push:${deviceId}`);
            }
          }
        }
      } catch (userError) {
        console.error(`处理用户 ${deviceId} 失败:`, userError.message);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        checked: devices.length,
        sent: results.length,
        results,
      }),
    };
  } catch (error) {
    console.error('定时检查错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// 辅助函数：计算下一个年度事件日期
function getNextYearlyDate(dateStr, todayStr) {
  const [, month, day] = dateStr.split('-');
  const today = new Date(todayStr);
  const thisYear = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
  if (thisYear >= today) {
    return thisYear.toISOString().split('T')[0];
  }
  return new Date(today.getFullYear() + 1, parseInt(month) - 1, parseInt(day)).toISOString().split('T')[0];
}

// 辅助函数：计算下一个生日
function getNextBirthday(month, day, todayStr) {
  const today = new Date(todayStr);
  const thisYear = new Date(today.getFullYear(), month - 1, day);
  if (thisYear >= today) {
    return thisYear.toISOString().split('T')[0];
  }
  return new Date(today.getFullYear() + 1, month - 1, day).toISOString().split('T')[0];
}
