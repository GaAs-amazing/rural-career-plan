# 数字乡建工作者 · 个人网站

面向 **AI + 3D 数字孪生乡村建设** 的个人知识库与作品集站点。纯静态页面，无构建步骤、无外部依赖。

## 页面

| 页面 | 内容 |
| --- | --- |
| `index.html` | 首页：个人定位、五步工作链路、知识库入口、项目与实践、成长路线 |
| `knowledge.html` | 知识库：5 大模块、22 条知识卡片，**支持关键词搜索**（Ctrl + K）、按模块筛选 |
| `projects.html` | 项目与实践：康养产业项目建设方案、岔房子村与瑶塘新村村落档案 |
| `about.html` | 成长规划：能力自评、差距清单、短期 / 中期 / 长期路径、职业价值 |
| `kangyang.html` | 项目模块：京津冀高端医养结合康养产业项目建设方案（十四章图文版） |

## 知识库搜索

- 输入即搜，支持**多关键词**（空格分隔，全部命中才返回），中文按子串匹配
- 排序：标题命中 > 标签命中 > 正文命中，并叠加出现次数
- 结果列表显示模块、标题与上下文片段，点击直接跳到对应卡片并高亮
- 快捷键：`Ctrl + K` 唤起，`↑ ↓` 选择，`Enter` 打开，`Esc` 关闭
- 顶部标签可按模块筛选，与搜索叠加生效

搜索索引在页面加载时从 DOM 自动构建，新增卡片只需复制一段 `<article class="kb-card" data-module data-title data-tags>` 结构，**无需改 JS**。

## 目录结构

```
.
├─ index.html / knowledge.html / projects.html / about.html / kangyang.html
├─ .nojekyll                 GitHub Pages 关闭 Jekyll
└─ assets/
   ├─ css/site.css           全站样式（设计变量、组件、响应式、打印）
   ├─ css/style.css          康养报告页专用样式
   ├─ js/site.js             导航、滚动进度、入场动画、知识库搜索、技能条
   └─ img/                   21 幅康养项目配图（英文文件名，1100px 宽）
```

## 本地预览

```powershell
python -m http.server 8080
# http://localhost:8080
```

## 部署到 GitHub Pages

- 仓库：`GaAs-amazing/rural-career-plan`（沿用已有仓库，不新建）
- 访问地址：**https://gaas-amazing.github.io/rural-career-plan/**

这个仓库原来放的是旧的康养单页，现在整站替换成这个个人网站，所以第一次推送要加 `-Replace` 强制覆盖：

```powershell
.\deploy-github-pages.ps1 -User GaAs-amazing -Replace
```

之后每次更新：改完文件跑同一条命令即可（会自动提交并推送）。

> 康养规划站是另一个仓库 `kangyang-site`，地址 `https://gaas-amazing.github.io/kangyang-site/`，两者互不影响。

## 维护

- **改文案**：直接编辑对应 `.html`
- **加知识卡片**：在 `knowledge.html` 对应模块里复制一条 `<article class="kb-card">`，填好 `data-module`、`data-title`、`data-tags` 即可被搜索收录
- **换配色**：`assets/css/site.css` 顶部 `:root`（`--forest` 深绿 / `--gold` 暖金 / `--cream` 米白）
- **打印 / 导出 PDF**：浏览器 Ctrl + P，已内置打印样式
