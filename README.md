# CST APP — 个人工作与生活控制台

仅供个人使用的本地工作台应用，集中管理计划、便签、倒计时、桌面种花、电子木鱼、每日运势等功能。本地优先、无需登录、无需云数据库。

## 特性

### 📋 计划管理
- 工作/生活分类，支持截止日期与提前1-7天提醒
- 支持 Checklist 子任务
- 逾期计划红色加粗高亮，即将到期提醒
- 完成计划自动获得浇水奖励

### 📝 快速备忘
- 首页一句话自然语言输入，自动识别待办或便签
- 智能识别日期（今天/明天/后天/大后天/X月X日/月底）
- 智能识别分类（工作/生活关键词）
- 长描述文字自动判定为便签

### ⏳ 倒计时
- 好友生日倒计时（仅月/日，每年自动循环）
- 大事件倒计时（一次性/每年重复，支持 Emoji）
- 生日当天显示"今天生日"

### 🌱 桌面种花
- 6个成长阶段：种子→发芽→幼苗→成长→花苞→开花
- 每天免费浇水×1、施肥×1（不跨日累积）
- 完成计划、习惯打卡获得浇水/施肥奖励
- 奖励防重复机制，避免刷奖励
- 开花后收入图鉴，随机获得新种子
- 植物图鉴收集

### 💪 习惯打卡
- 健身打卡 → 浇水奖励
- 整理环境 → 施肥奖励
- 每天每项仅可打卡一次

### 🪵 电子木鱼
- 点击反馈，今日/累计计数
- 声音开关（Web Audio API 音效）
- 每日自动重置今日计数

### 🔮 每日运势
- 根据出生日期自动计算星座
- 每日星座运势（综合/工作/生活/幸运色）
- 当日缓存，避免重复请求
- 仅供娱乐参考

### 💾 数据管理
- 全部数据本地保存（localStorage + IndexedDB）
- 立即备份到本地文件夹
- 导出 JSON 格式数据文件
- 从备份恢复数据
- 清空全部数据（需输入 DELETE 确认）
- 自动备份（每7天，需开启并设置备份文件夹）

### ⚙️ 设置
- 个人资料（出生日期/时间/城市）
- 界面缩放（小/标准/大）
- 木鱼声音、游戏音效、每日运势开关
- 自动备份设置、备份文件夹

## 技术栈

- 后端：Python 3 标准库（http.server，端口 8765）
- 前端：原生 HTML5 + CSS3 + ES Modules（无构建工具）
- 数据存储：localStorage（结构化数据）+ IndexedDB（图片）
- 桌面启动：Windows .bat 脚本
- 测试：Node.js 原生 assert + 自定义 TestRunner

## 快速开始

### 方式一：双击启动（推荐）

双击 `start.bat`，自动检测端口、启动后端服务并在 Chrome 中打开。

### 方式二：命令行启动

```bash
python server.py
```

然后在浏览器中打开 `http://localhost:8765`

## 首次使用

1. 启动应用后，点击左侧导航「⚙️ 数据与设置」
2. 在「个人资料」中设置出生日期（用于星座运势）
3. 在「APP设置」中开启自动备份并设置备份文件夹（可选）
4. 返回首页开始使用

## 运行测试

```bash
# 运行全部纯逻辑测试（156个）
node tests/run_all.js

# 单独运行各模块测试
node tests/phase1_date.test.js
node tests/phase1_zodiac.test.js
node tests/phase1_parser.test.js
node tests/phase1_storage.test.js
node tests/phase2_ui.test.js
node tests/phase3_9_integration.test.js

# 后端测试（需先启动 server.py）
node tests/phase0_server.test.js
```

## 项目结构

```
├── server.py                  # Python 后端服务（静态文件+备份API+运势API）
├── start.bat                  # 桌面启动器
├── TECH_SPEC.md               # 技术规格文档
├── README.md                  # 本文件
├── package.json               # Node 配置
├── .gitignore
├── docs/
│   ├── PRD.md                 # 产品需求文档
│   └── DEVELOPMENT_PLAN.md    # 开发计划
├── src/
│   ├── index.html             # 入口 HTML
│   ├── css/style.css          # 全局样式（莫兰迪色系）
│   └── js/
│       ├── main.js            # 入口
│       ├── app.js             # 应用主体（路由/导航/每日重置/备份/奖励）
│       ├── storage/
│       │   ├── db.js          # 统一数据访问层（核心）
│       │   └── imageStore.js  # IndexedDB 图片存储
│       ├── components/        # UI 组件（Toast/Modal/Drawer/Tabs等）
│       ├── pages/             # 页面（首页/计划/倒计时/娱乐/设置）
│       └── utils/             # 工具函数（日期/星座/解析器）
└── tests/                     # 测试（164个用例全部通过）
    ├── mock.js                # 测试 Mock（增强版 DOM 模拟）
    ├── phase0_server.test.js  # 后端 API 测试
    ├── phase1_date.test.js    # 日期工具测试
    ├── phase1_zodiac.test.js  # 星座测试
    ├── phase1_parser.test.js  # 解析器测试
    ├── phase1_storage.test.js # 数据层测试
    ├── phase2_ui.test.js      # UI框架测试
    ├── phase3_9_integration.test.js # 集成测试
    └── run_all.js             # 统一测试运行器
```

## 系统要求

- Windows 10/11
- Python 3.8+
- Google Chrome（推荐）
- Node.js 18+（仅运行测试时需要）

## 数据安全

- 所有数据保存在本地浏览器中，不上传任何云端
- 建议定期手动备份或开启自动备份
- 备份文件保存在您指定的本地文件夹中
- 清空数据操作不可撤销，请谨慎操作

## 隐私说明

- 本应用无需登录、无需注册、不收集任何个人信息
- 运势功能使用本地模拟数据，不调用外部付费 API
- 所有数据仅存储在您的本地设备上
