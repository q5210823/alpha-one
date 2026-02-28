# 工作收入追踪 技术文档

## 1. 技术概览
- 技术栈: Chrome Extension Manifest V3 + 原生 HTML/CSS/JavaScript
- 运行方式: `chrome_url_overrides.newtab` 覆盖 Chrome 新标签页
- 存储: `chrome.storage.sync`
- 后端: 无

## 2. 目录与文件职责
- `manifest.json`: 扩展声明、权限、页面入口。
- `newtab.html`: 新标签页 UI 结构（卡片、设置弹窗、进度条）。
- `styles.css`: 新标签页样式。
- `newtab.js`: 核心业务逻辑（读取配置、收益计算、进度计算、定时刷新、设置保存）。
- `options.html`: 独立设置页（与新标签页设置同字段）。
- `core/config.py`: 默认配置镜像（当前主要用于文档/后续服务化预留）。

## 3. 配置数据模型

### 3.1 Settings（存储于 chrome.storage.sync）
```ts
type Settings = {
  monthlyIncome: number;   // 月薪（税后，RMB）
  workHoursPerDay: number; // 工作时长（小时）
  workStart: string;       // "HH:mm"
  lunchStart: string;      // "HH:mm"
  lunchEnd: string;        // "HH:mm"
  workEnd: string;         // "HH:mm"
}
```

### 3.2 默认值
```json
{
  "monthlyIncome": 15000,
  "workHoursPerDay": 8,
  "workStart": "09:00",
  "lunchStart": "12:00",
  "lunchEnd": "13:30",
  "workEnd": "18:00"
}
```

## 4. 核心计算逻辑

### 4.1 时间工具
- `parseMinutes("HH:mm") => number`
  - 将时间转为当天分钟数，用于区间比较。

### 4.2 今日有效工作秒数
- 函数: `getTodayWorkingSeconds(nowDate, cfg)`
- 处理规则:
  - 当前时间先封顶到 `workEnd`。
  - 上班前返回 `0`。
  - 午休前按线性增长。
  - 午休区间保持不变。
  - 午休后继续增长。
  - 最终结果再按 `min(workHoursPerDay, 排班净时长)` 限制上限。

### 4.3 今日进度百分比
- 函数: `getDayProgressPercent(nowDate, cfg)`
- 计算: `(now - workStart) / (workEnd - workStart)`
- 边界:
  - 上班前: `0%`
  - 下班后: `100%`

### 4.4 收益计算
- 日薪: `monthlyIncome / 21.75`
- 当前收益: `dayIncome * (workedHours / workHoursPerDay)`

## 5. 页面刷新机制
- 初始化:
  - `loadSettings()` 从 `chrome.storage.sync` 拉取配置。
  - `updateScreen()` 立即渲染。
- 实时刷新:
  - `setInterval(updateScreen, 1000)` 每秒更新一次金额/时长/进度条。

## 6. 数据流
1. 页面加载 -> 读配置。
2. 配置合并默认值 -> 回填表单。
3. 每秒按当前时间计算并渲染。
4. 用户提交设置 -> 写入 `chrome.storage.sync` -> 立即刷新 UI。

## 7. 关键交互与校验
- 表单字段为 `required`。
- `workHoursPerDay <= 0` 时阻止保存。
- 当前未做完整时序校验（例如午休开始晚于午休结束、下班早于上班）。

## 8. 已知技术风险
- 编码风险: `newtab.js` 中部分中文字符串可能出现乱码，需要统一文件编码和编辑器策略。
- 时间校验不足: 缺少对 `workStart/lunch/workEnd` 顺序合法性校验。
- 逻辑一致性风险:
  - 收益增长按“有效工作时长”；
  - 进度条按“上班到下班总时段”；
  - 两者口径不同，可能引发认知偏差。

## 9. 建议改造（迭代优先级）

### P0
- 统一编码为 UTF-8（无 BOM），修复乱码。
- 增加时间顺序校验与错误提示。
- 提供“恢复默认设置”能力。

### P1
- 抽离计算模块到 `src/domain/calc.ts`（或 `calc.js`），实现单元测试。
- 增加 `lastUpdatedAt` 与配置版本号，支持数据迁移。

### P2
- 引入构建工具（Vite + TypeScript）提升可维护性。
- 增加 UI 主题配置与 i18n。

## 10. 测试建议

### 10.1 手工测试用例
1. 初次安装显示默认值。
2. 修改设置后刷新页面，配置保持。
3. 上班前金额=0、进度=0。
4. 午休期间金额不增长。
5. 下班后金额停止增长、进度=100%。
6. 极端值（高收入、小数、短工时）不报错。

### 10.2 自动化测试（建议）
- 纯函数测试:
  - `parseMinutes`
  - `getTodayWorkingSeconds`
  - `getDayProgressPercent`
- 快照测试:
  - 不同时间点渲染数据快照。

## 11. 版本发布建议
- 版本策略: `major.minor.patch`
- 发布流程:
  1. 本地验证（手工 + 脚本）。
  2. 更新版本号与变更说明。
  3. 打包并在 Chrome 扩展后台提交审核。

## 12. 后续扩展接口建议
- 数据导出接口（CSV/JSON）。
- 历史统计存储接口（按天聚合）。
- 可插拔计算策略（标准工作制、弹性工作制、排班制）。
