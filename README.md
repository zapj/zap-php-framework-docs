# Zap PHP Framework 文档站

基于 [VuePress 2](https://v2.vuepress.vuejs.org/zh/) 构建的 Zap PHP Framework 文档站点。

## 目录结构

```
zap-php-framework-docs/
├── README.md              # 本文档
├── package.json           # Node 依赖与脚本
├── docs/                  # 文档源文件
│   ├── .vuepress/         # VuePress 配置与构建产物
│   │   ├── config.js      # 站点配置（导航栏、侧边栏等）
│   │   ├── public/        # 静态资源（logo 等）
│   │   ├── styles/        # 自定义样式
│   │   └── dist/          # 构建输出（用于部署）
│   ├── README.md          # 首页（hero 页面）
│   ├── guide/             # 指南文档（17 篇）
│   └── api/               # API 参考文档（25 篇）
└── node_modules/          # 依赖（npm install 后生成）
```

## 环境准备

- **Node.js** >= 18
- **npm** 包管理器

```bash
# 安装依赖
npm install
```

## 本地开发

```bash
# 启动开发服务器（支持热更新）
npm run docs:dev

# 如果缓存异常，可使用 clean 模式
npm run docs:dev-clean
```

默认访问地址：`http://localhost:8080`

## 文档操作指南

### 增加文档

#### 添加指南文档

1. 在 `docs/guide/` 目录下新建 `.md` 文件，例如 `new-feature.md`：

   ```bash
   touch docs/guide/new-feature.md
   ```

2. 编辑文档内容，Markdown 格式即可，支持 Vue 组件和代码高亮。

3. 在 `docs/.vuepress/config.js` 的侧边栏配置中添加新条目：

   ```js
   // 找到 /guide/ 对应的 sidebar 配置
   '/guide/': [
     // ... 已有分组 ...
     {
       text: '新分组名',
       collapsible: false,
       children: [
         { text: '新功能', link: '/guide/new-feature' },
       ],
     },
   ],
   ```

#### 添加 API 文档

1. 在 `docs/api/` 目录下新建 `.md` 文件，例如 `my-class.md`：

   ```bash
   touch docs/api/my-class.md
   ```

2. 在 `docs/api/README.md` 的命名空间表格中添加新行：

   ```markdown
   | `zap\new` | [MyClass](/api/my-class) |
   ```

3. 在 `docs/.vuepress/config.js` 的 API 侧边栏中添加新条目：

   ```js
   '/api/': [
     // ... 已有分组 ...
     {
       text: '新模块',
       collapsible: false,
       children: [
         { text: 'MyClass', link: '/api/my-class' },
       ],
     },
   ],
   ```

### 更新文档

1. 直接编辑 `docs/guide/` 或 `docs/api/` 下对应的 `.md` 文件。
2. 开发服务器 (`npm run docs:dev`) 默认支持热更新，保存后浏览器自动刷新。
3. 更新完成后，重新构建并发布（见下方发布章节）。

### 删除文档

1. 删除 `docs/guide/` 或 `docs/api/` 下对应的 `.md` 文件。
2. 从 `docs/.vuepress/config.js` 的侧边栏配置中移除对应的条目。
3. 如果是 API 文档，同步从 `docs/api/README.md` 的命名空间表格中移除对应行。
4. 检查其他文档中是否包含指向已删除文档的链接，一并清理。

## 发布部署

### 构建生产包

```bash
npm run docs:build
```

构建产物位于 `docs/.vuepress/dist/` 目录。

### 部署方式

#### 方式一：本地预览（验证构建结果）

```bash
npm run docs:preview
```

#### 方式二：部署至静态服务器（Nginx / Apache）

将 `docs/.vuepress/dist/` 目录下的所有文件复制到 Web 服务器的文档根目录即可。

```bash
# 示例：部署到 Nginx 的 /var/www/docs 目录
cp -r docs/.vuepress/dist/* /var/www/docs/
```

Nginx 配置示例：

```nginx
server {
    listen       80;
    server_name  docs.zap-php.local;
    root         /var/www/docs;
    index        index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 方式三：部署至 GitHub Pages / Gitee Pages

提交 `docs/.vuepress/dist/` 到 `gh-pages` 分支即可自动部署。

### 版本号更新

发布新版本时，同步更新以下位置的版本号：

1. `package.json` → `version` 字段
2. `docs/.vuepress/config.js` → `navbar` 中的版本下拉菜单

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `npm install` | 安装/更新依赖 |
| `npm run docs:dev` | 启动本地开发服务器 |
| `npm run docs:dev-clean` | 清除缓存后启动 |
| `npm run docs:build` | 构建生产版本 |
| `npm run docs:preview` | 本地预览构建结果 |

## 文档编写规范

- **文件名**：使用小写字母 + 连字符，如 `error-handling.md`
- **API 文档**：方法签名、参数表、返回值类型、使用示例缺一不可
- **指南文档**：从概念到实践，逐步深入，每个章节配可运行代码示例
- **链接**：使用绝对路径 `/guide/xxx` 或 `/api/xxx` 进行文档间跳转
- **标题层级**：`#` 仅用于页面标题，正文从 `##` 开始
