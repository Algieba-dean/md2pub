# md2pub 开发日志

> 基于 doocs/md 的二次开发项目，专注于更多样化的主题样式和本地博客管理能力。

## 项目目标

- **主题多样化**：提供更丰富的主题和样式选择
- **博客本地管理**：支持本地草稿、分类、标签管理
- **TDD 开发模式**：测试驱动开发，确保代码质量

---

## v0.1.0 - 项目初始化 (2026-02-02)

### 🎯 本版本目标

- [x] 品牌重塑：项目名更名为 md2pub
- [x] 移除赞赏功能
- [x] 清理品牌相关内容（赞助商、微信群二维码等）
- [x] 更新项目链接到 https://github.com/Algieba-dean/md2pub
- [ ] 建立 TDD 测试框架
- [ ] 主题系统增强设计
- [ ] 博客本地管理功能设计

### 📝 变更记录

#### 2026-02-02

**品牌重塑**
- 项目名从 `doocs/md` 更改为 `md2pub`
- 更新 GitHub 仓库链接到 `https://github.com/Algieba-dean/md2pub`
- 移除原项目品牌相关内容
- 更新 `package.json` 中的项目信息

**功能移除**
- 移除赞赏功能 (`FundDialog` 组件)
- 移除 `HelpDropdown` 中的赞赏菜单项
- 移除赞助商展示区域
- 移除微信群/个人微信二维码

**文档更新**
- 重写 `README.md`，添加项目特色说明
- 清理 `CONTRIBUTING.md` 中的品牌引用
- 更新 `CHANGELOG.md` 为新项目格式

**TDD 测试框架**
- 添加 `vitest.config.ts` 配置文件
- 添加 Vitest、jsdom 等测试依赖
- 创建示例测试文件 `packages/core/src/__tests__/theme.test.ts`
- 添加测试脚本命令：`pnpm test`、`pnpm test:run`、`pnpm test:coverage`

**主题系统增强**
- 新增 `minimal` 主题（极简风格）
- 新增 `tech` 主题（技术博客风格）
- 更新主题配置文件，注册新主题
- 主题选项增加到 5 个：经典、优雅、简洁、极简、技术

**博客本地管理（基础架构）**
- 创建博客类型定义 `packages/shared/src/types/blog.ts`
- 创建博客管理 Store `apps/web/src/stores/blog.ts`
- 支持功能：文章 CRUD、分类管理、标签管理、筛选搜索、数据导入导出

---

## v0.2.0 - 多平台渲染引擎 (2026-02-02)

### 🎯 本版本目标

将 Markdown 转换工具从"微信公众号排版工具"升级为"全平台发布助手"。

### ✨ 新增功能

**多平台渲染引擎**
- 核心类型定义 `packages/shared/src/types/platform.ts`
- 平台预设配置 `packages/core/src/platform/presets.ts`
- 平台渲染器 `packages/core/src/platform/renderer.ts`

**支持的平台预设**
| 平台 | CSS 策略 | 脚注处理 | 代码块样式 |
|------|----------|----------|------------|
| 微信公众号 | inline-heavy | 文末文本 | Mac 窗口 |
| 知乎 | inline-heavy | 文末文本 | 纯净 |
| 邮件订阅 | inline-minimal | 文末文本 | 纯净 |
| 通用博客 | class-based | 锚点跳转 | 最小 |
| Medium/掘金 | inline-minimal | 锚点跳转 | 纯净 |
| Dev.to/GitHub | class-based | 锚点跳转 | 最小 |

**三维度差异化处理**

1. **样式注入策略 (CSS Injection Strategy)**
   - `inline-heavy`: 强内联模式（微信/知乎）
   - `inline-minimal`: 最小内联模式（邮件/Medium）
   - `class-based`: 纯净类名模式（通用博客）
   - `table-layout`: 表格布局模式（邮件兼容）

2. **DOM 结构差异化 (Structural Adaptation)**
   - 脚注处理：文末文本 / 锚点跳转 / 悬浮提示 / 边注
   - 代码块：Mac 窗口 / 纯净 / 带行号 / 最小
   - 图片容器：figure / simple / responsive

3. **排版微调 (Typography Logic)**
   - 中西文间距（Pangu.js 逻辑）
   - 行高字号配置
   - 首行缩进 / 两端对齐

**前端 UI**
- 平台选择下拉菜单 `PlatformDropdown.vue`
- 平台状态管理 Store `stores/platform.ts`

**测试**
- 单元测试 `packages/core/src/__tests__/platform.test.ts`
- E2E 测试 `apps/web/e2e/platform.spec.ts`
- Playwright 配置 `playwright.config.ts`

### 📁 新增文件

```
packages/shared/src/types/platform.ts      # 平台类型定义
packages/core/src/platform/
├── index.ts                               # 模块导出
├── presets.ts                             # 平台预设配置
├── renderer.ts                            # 平台渲染器
└── transformers/
    ├── index.ts                           # 转换器导出
    ├── style-injector.ts                  # 样式注入器
    ├── typography.ts                      # 排版处理器
    └── dom-adapter.ts                     # DOM 适配器
apps/web/src/components/editor/editor-header/
└── PlatformDropdown.vue                   # 平台选择组件
apps/web/src/stores/platform.ts            # 平台状态管理
apps/web/e2e/platform.spec.ts              # E2E 测试
playwright.config.ts                       # Playwright 配置
```

### 🧪 测试命令

```bash
# 单元测试
pnpm test:run

# E2E 测试（需先启动开发服务器）
pnpm test:e2e

# E2E 测试（UI 模式）
pnpm test:e2e:ui
```

---

## 开发路线图

### Phase 1: 基础重构 ✅
- 品牌重塑
- 移除不需要的功能
- 文档清理

### Phase 2: TDD 基础设施 (计划中)
- 配置 Vitest 测试框架
- 编写核心模块单元测试
- 建立 CI/CD 测试流程

### Phase 3: 主题系统增强 (计划中)
- 设计主题架构
- 新增主题变体：
  - `minimal` - 极简风格
  - `tech` - 技术博客风格
  - `magazine` - 杂志风格
  - `academic` - 学术论文风格
  - `colorful` - 多彩活泼风格
- 主题预览功能
- 主题导入/导出

### Phase 4: 博客本地管理 (计划中)
- 文章分类管理
- 标签系统
- 草稿箱增强
- 发布历史记录
- 本地搜索功能

---

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite 7
- **包管理**: pnpm (Monorepo)
- **UI 组件**: shadcn/ui + Tailwind CSS
- **编辑器**: CodeMirror 6
- **测试框架**: Vitest (计划)

## 项目结构

```
md2pub/
├── apps/
│   ├── web/          # Web 应用 & 浏览器插件
│   ├── vscode/       # VSCode 插件
│   └── utools/       # uTools 插件
├── packages/
│   ├── core/         # 核心 Markdown 渲染器
│   ├── shared/       # 共享配置和工具
│   ├── md-cli/       # CLI 工具
│   └── example/      # 示例代码
└── docs/             # 文档
```
