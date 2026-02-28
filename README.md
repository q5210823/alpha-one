# 工作收入追踪（Chrome New Tab Extension）

一个基于 Chrome 新标签页的效率插件：输入税后月收入（RMB），实时显示“今天已经赚到多少钱”、工作时长和今日进度百分比。

## 功能特性
- 覆盖 Chrome 新标签页展示收益卡片
- 实时累计今日收益（每秒刷新）
- 展示今日工作时长（时/分/秒）
- 展示今日进度条（按上班到下班时间）
- 支持设置并持久化（`chrome.storage.sync`）

## 当前默认配置
- 月薪（税后）: `15000`
- 工作时长（小时）: `8`
- 上班开始时间: `09:00`
- 午休开始时间: `12:00`
- 午休结束时间: `13:30`
- 下班时间: `18:00`

## 计算规则
- 日薪: `月薪 / 21.75`
- 今日收益: `日薪 * (今日有效工作小时 / 工作时长小时)`
- 今日有效工作时长:
  - 上班前不累计
  - 午休区间不累计
  - 下班后不再增长
- 今日进度:
  - 基于 `上班开始时间 -> 下班时间` 线性计算
  - 上班前 `0%`，下班后 `100%`

## 安装与使用
1. 打开 `chrome://extensions/`
2. 打开“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择项目目录 `d:\VScodeWorkSpace\Scam`
5. 新开标签页查看效果，点击“设置”修改参数

## 项目结构
```text
Scam/
├─ manifest.json
├─ newtab.html
├─ newtab.js
├─ styles.css
├─ options.html
├─ core/
│  └─ config.py
└─ docs/
   ├─ PRD.md
   ├─ TECH_SPEC.md
   ├─ CHANGELOG.md
   └─ ITERATION_ISSUES.md
```

## 文档
- 产品需求: `docs/PRD.md`
- 技术设计: `docs/TECH_SPEC.md`
- 变更记录: `docs/CHANGELOG.md`
- 迭代任务拆解: `docs/ITERATION_ISSUES.md`

## 迭代计划（摘要）
- P0: 中文编码修复、时间合法性校验、恢复默认设置
- P1: 计算逻辑模块化、单元测试、设置入口统一
- P2: 历史统计、多币种与本地化

## License
当前仓库未声明许可证，默认保留所有权利。建议后续补充 LICENSE 文件。
