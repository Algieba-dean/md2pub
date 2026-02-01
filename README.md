<div align="center">

# md2pub

**Markdown to Publishing**

</div>

<h1 align="center">Markdown 编辑器</h1>

<div align="center">

[![node](https://img.shields.io/badge/node-%3E%3D22-42cc23?style=flat-square&labelColor=564341)](https://nodejs.org/en/about/previous-releases) [![pr](https://img.shields.io/badge/prs-welcome-42cc23?style=flat-square&labelColor=564341)](https://github.com/Algieba-dean/md2pub/pulls) [![stars](https://img.shields.io/github/stars/Algieba-dean/md2pub?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/Algieba-dean/md2pub/stargazers)

</div>

## 📝 项目介绍

**md2pub** 是一款功能强大的 Markdown 编辑器，专注于**多样化主题**和**本地博客管理**能力。支持将 Markdown 文档即时渲染为精美排版，适用于微信公众号、博客发布等多种场景。

> 本项目基于 [doocs/md](https://github.com/doocs/md) 二次开发，感谢原作者的杰出贡献！

## 🌟 特色功能

- **多样化主题**：提供丰富的主题和样式选择
- **本地博客管理**：支持草稿、分类、标签管理
- **TDD 开发模式**：测试驱动开发，确保代码质量

## 🤔 为何二次开发

我们希望在原项目基础上：
- 提供更多主题和样式变体
- 增强本地博客管理能力
- 采用 TDD 模式确保代码质量

欢迎各位朋友随时提交 PR！如果你有新的想法，也欢迎在 [💬 Discussions 讨论区](https://github.com/Algieba-dean/md2pub/discussions)反馈。

## ✨ 功能特性

### 🎨 核心功能

- ✅ **完整 Markdown 支持** - 支持所有基础语法、数学公式
- ✅ **图表渲染** - 支持 Mermaid 图表和 [GFM 警告块](https://github.com/orgs/community/discussions/16925)
- ✅ **PlantUML 支持** - 强大的 UML 图表渲染
- ✅ **Ruby 注音扩展** - 支持 `[文字]{注音}`、`[文字]^(注音)` 格式，支持多种分隔符

### 🎯 编辑体验

- ✅ **代码高亮** - 丰富的代码块高亮主题，提升代码可读性
- ✅ **自定义样式** - 允许自定义主题色和 CSS 样式，灵活定制展示效果
- ✅ **草稿保存** - 内置本地内容管理功能，支持草稿自动保存

### 🚀 高级功能

- ✅ **多图床支持** - 提供多种图床选择，便捷的图片上传功能
- ✅ **文件管理** - 便捷的文件导入、导出功能，提升工作效率
- ✅ **AI 集成** - 集成主流 AI 模型（DeepSeek、OpenAI、通义千问、腾讯混元、火山方舟、302.AI 等），智能辅助内容创作

## 🖼️ 支持的图床服务

| #   | 图床                                                   | 使用时是否需要配置                                                         | 备注                                                                                                                   |
| --- | ------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | 默认                                                   | 否                                                                         | -                                                                                                                      |
| 2   | [GitHub](https://github.com)                           | 配置 `Repo`、`Token` 参数                                                  | [如何获取 GitHub token？](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) |
| 3   | [阿里云](https://www.aliyun.com/product/oss)           | 配置 `AccessKey ID`、`AccessKey Secret`、`Bucket`、`Region` 参数           | [如何使用阿里云 OSS？](https://help.aliyun.com/document_detail/31883.html)                                             |
| 4   | [腾讯云](https://cloud.tencent.com/act/pro/cos)        | 配置 `SecretId`、`SecretKey`、`Bucket`、`Region` 参数                      | [如何使用腾讯云 COS？](https://cloud.tencent.com/document/product/436/38484)                                           |
| 5   | [七牛云](https://www.qiniu.com/products/kodo)          | 配置 `AccessKey`、`SecretKey`、`Bucket`、`Domain`、`Region` 参数           | [如何使用七牛云 Kodo？](https://developer.qiniu.com/kodo)                                                              |
| 6   | [MinIO](https://min.io/)                               | 配置 `Endpoint`、`Port`、`UseSSL`、`Bucket`、`AccessKey`、`SecretKey` 参数 | [如何使用 MinIO？](http://docs.minio.org.cn/docs/master/)                                                              |
| 7   | [S3 协议](https://aws.amazon.com/s3/)                  | 配置 `Endpoint`、`Region`、`Bucket`、`AccessKey`、`SecretKey` 参数         | 支持 AWS S3、Oracle、DigitalOcean 等兼容 S3 的存储服务                                                                 |
| 8   | [公众号](https://mp.weixin.qq.com/)                    | 配置 `appID`、`appsecret`、`代理域名` 参数                                 | [如何使用公众号图床？](https://md-pages.doocs.org/tutorial)                                                            |
| 9   | [Cloudflare R2](https://developers.cloudflare.com/r2/) | 配置 `AccountId`、`AccessKey`、`SecretKey`、`Bucket`、`Domain` 参数        | [如何使用 S3 API 操作 R2？](https://developers.cloudflare.com/r2/api/s3/api/)                                          |
| 10  | [又拍云](https://www.upyun.com/)                       | 配置 `Bucket`、`Operator`、`Password`、`Domain` 参数                       | [如何使用 又拍云？](https://help.upyun.com/)                                                                           |
| 11  | [Telegram](https://core.telegram.org/api)              | 配置 `Bot Token`、`Chat ID` 参数                                           | [如何使用 Telegram 图床？](https://github.com/doocs/md/blob/main/docs/telegram-usage.md)                               |
| 12  | [Cloudinary](https://cloudinary.com/)                  | 配置 `Cloud Name`、`API Key`、`API Secret` 参数                            | [如何使用 Cloudinary？](https://cloudinary.com/documentation/upload_images)                                            |
| 13  | 自定义上传                                             | 是                                                                         | [如何自定义上传？](/docs/custom-upload.md)                                                                             |

## 🎬 产品演示

<div align="center">

|                                      🎨 主题切换                                      |                                      🖼️ 图片上传                                      |
| :-----------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: |
| ![demo1](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo1.gif) | ![demo2](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo2.gif) |

|                                      📝 样式扩展                                      |                                      🤖 一键排版                                      |
| :-----------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: |
| ![demo3](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo3.gif) | ![demo4](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo4.gif) |

</div>

## 🛠️ 开发与部署

```sh
# 安装 node 版本
nvm i && nvm use

# 安装依赖
pnpm i

# 启动开发模式
pnpm web dev
# 访问 http://localhost:5173/md/

# 部署在 /md 目录
pnpm web build

# 部署在根目录
pnpm web build:h5-netlify

# Chrome 插件启动及调试
pnpm web ext:dev
# 访问 chrome://extensions/ 打开开发者模式，加载已解压的扩展程序，选择 apps/web/.output/chrome-mv3-dev 目录

# Chrome 插件打包
pnpm web ext:zip

# Firefox 扩展打包(how to build Firefox addon)
pnpm web firefox:zip # output zip file at in apps/web/.output/md-{version}-firefox.zip

# uTools 插件打包
pnpm utools:package # output zip file at apps/utools/release/md-utools-v{version}.zip

# cloudflare workers
pnpm web wrangler:dev # cloudflare workers dev 模式
pnpm web wrangler:deploy # cloudflare workers 部署命令
```

## 🚀 快速搭建私有服务

### 📦 方式 1. 使用 npm cli

通过我们的 npm cli 你可以轻易搭建属于自己的微信 Markdown 编辑器。

```sh
# 安装
npm i -g @doocs/md-cli

# 启动
md-cli

# 访问
open http://127.0.0.1:8800

# 启动并指定端口
md-cli port=8899

# 访问
open http://127.0.0.1:8899
```

md-cli 支持以下命令行参数：

- `port` 指定端口号，默认 8800，如果被占用会随机使用一个新端口。
- `spaceId` dcloud 服务空间配置
- `clientSecret` dcloud 服务空间配置

### 🐳 方式 2. 使用 Docker 镜像

如果你是 Docker 用户，也可以直接使用一条命令，启动**完全属于你的、私有化运行的实例**。

```sh
docker run -d -p 8080:80 doocs/md:latest
```

容器运行起来之后，打开浏览器，访问 http://localhost:8080 即可。

关于本项目 Docker 镜像的更多详细信息，可以关注 https://github.com/doocs/docker-md

## 🤝 贡献指南

我们欢迎任何形式的贡献！请查看 [📖 CONTRIBUTING.md](./CONTRIBUTING.md) 获取提交 PR、Issue 的流程与规范。

## 💬 反馈与交流

如果你在使用过程中遇到问题，或者有好的建议，欢迎在 [🐛 Issues](https://github.com/Algieba-dean/md2pub/issues) 中反馈。

## 🙏 致谢

本项目基于 [doocs/md](https://github.com/doocs/md) 二次开发，感谢原作者及所有贡献者的杰出工作！
