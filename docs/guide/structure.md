# 目录结构

## 概述

Zap PHP Framework 采用简洁清晰的目录结构，遵循约定优于配置的原则。以下是一个标准项目的完整目录结构及其说明。

## 完整目录结构

```
project/
├── app/                   # 应用代码
│   ├── Controllers/       # 控制器类
│   ├── Models/            # 数据模型类
│   ├── Middleware/        # 中间件类
│   └── views/             # 视图模板文件
├── assets/                # 静态资源（可通过 url() 访问）
│   ├── css/
│   ├── js/
│   └── images/
├── config/                # 配置文件目录
│   ├── config.php         # 主配置文件
│   ├── cache.php          # 缓存配置
│   ├── database.php       # 数据库配置
│   └── log.php            # 日志配置
├── resources/             # 前端源文件
│   ├── scss/
│   └── js/
├── storage/               # 运行时存储
│   ├── uploads/           # 用户上传文件
│   └── exports/           # 生成的文件
├── themes/                # 主题目录
│   └── default/           # 默认主题
│       └── views/         # 主题模板
├── var/                   # 变量与缓存
│   ├── cache/             # 文件缓存与路由缓存
│   └── logs/              # 日志文件
├── vendor/                # Composer 依赖包
├── public/                # Web 入口目录
│   ├── index.php          # 应用入口文件
│   └── .htaccess          # Apache 重写规则
└── composer.json          # Composer 依赖配置
```

## 各目录详解

### app/ - 应用代码

应用程序的核心代码存放位置，包含控制器、模型和视图。

```
app/
├── Controllers/           # 控制器目录
│   ├── HomeController.php # 首页控制器
│   ├── UserController.php # 用户控制器
│   └── Api/               # API 子目录（可选）
│       └── UserController.php
├── Models/                # 模型目录
│   ├── User.php           # 用户模型
│   └── Post.php           # 文章模型
├── Middleware/             # 中间件目录
│   ├── AuthMiddleware.php # 认证中间件
│   └── CorsMiddleware.php # 跨域中间件
└── views/                 # 视图模板
    ├── home/
    │   └── index.html     # 首页模板
    ├── user/
    │   ├── profile.html   # 用户资料页
    │   └── list.html      # 用户列表页
    └── layouts/
        └── main.html      # 主布局模板
```

**职责**：
- `Controllers/`：处理 HTTP 请求，调用业务逻辑，返回响应
- `Models/`：定义数据结构和数据库交互
- `Middleware/`：请求/响应拦截处理
- `views/`：PHP 或 Twig 视图模板

### assets/ - 静态资源

存放可直接通过 URL 访问的静态文件。

```
assets/
├── css/
│   ├── app.css
│   └── admin.css
├── js/
│   ├── app.js
│   └── vendor.js
└── images/
    └── logo.png
```

通过 `assets_path()` 获取路径，通过 `url()` 生成可访问的 URL。

### config/ - 配置文件

所有配置文件存放在此目录中。配置采用 PHP 数组返回格式，支持点分路径访问。

```
config/
├── config.php             # 主配置（debug、log、theme）
├── cache.php              # 缓存驱动与参数
├── database.php           # 数据库连接配置
└── log.php                # 日志处理器配置
```

使用 `config('文件名.键名')` 访问配置项。

### resources/ - 前端源文件

存放前端构建前的源文件，如 SCSS、TypeScript、未压缩的 JS 等。

```
resources/
├── scss/
│   ├── app.scss
│   └── _variables.scss
└── js/
    └── components/
```

通过 `resource_path()` 获取目录路径。

### storage/ - 运行时存储

存放运行时生成的文件和用户上传文件。

```
storage/
├── uploads/               # 用户上传文件
│   ├── avatars/
│   └── documents/
└── exports/               # 系统生成的导出文件
    └── reports/
```

通过 `storage_path()` 获取路径。

### themes/ - 主题目录

支持多主题系统。当配置中指定了主题时，框架会优先从主题目录加载模板。

```
themes/
└── default/               # 默认主题
    ├── views/             # 主题模板（结构与 app/views 相同）
    │   ├── home/
    │   └── layouts/
    ├── assets/            # 主题静态资源
    └── theme.json         # 主题元信息
```

通过 `themes_path()` 和 `themes_url()` 访问主题资源。

### var/ - 变量与缓存

存放临时文件、缓存和日志。

```
var/
├── cache/                 # 缓存文件
│   ├── zap_cache_*        # 文件缓存数据
│   └── routes_cache       # 路由缓存
└── logs/                  # 日志文件
    ├── app.log            # 应用日志
    └── error.log          # 错误日志
```

通过 `var_path()` 获取目录路径。此目录在部署时应具有写入权限。

### vendor/ - Composer 依赖

由 Composer 管理的第三方包目录，包含框架本身及其他依赖。

```
vendor/
├── autoload.php           # Composer 自动加载入口
├── zap/
│   └── zap-php-framework/ # Zap 框架核心
├── monolog/
│   └── monolog/           # Monolog 日志库
└── ...                    # 其他依赖
```

### public/ - Web 入口

Web 服务器的文档根目录，包含入口文件和静态资源链接。

```
public/
├── index.php              # 应用入口文件
├── .htaccess              # Apache URL 重写规则
└── assets/                # 静态资源符号链接（可选）
```

这是唯一对外暴露的目录，所有请求都通过 `index.php` 进入应用。

## 路径辅助函数

框架提供了便捷的路径辅助函数：

```php
// 获取各目录的绝对路径
base_path('config/database.php');    // /path/to/project/config/database.php
config_path('cache.php');            // /path/to/project/config/cache.php
storage_path('uploads/avatars/');    // /path/to/project/storage/uploads/avatars/
assets_path('css/app.css');          // /path/to/project/assets/css/app.css
resource_path('scss/app.scss');      // /path/to/project/resources/scss/app.scss
themes_path('default/views/');       // /path/to/project/themes/default/views/
var_path('cache/');                  // /path/to/project/var/cache/
public_path('index.php');            // /path/to/project/public/index.php
```

## 目录权限

为确保框架正常运行，以下目录需要 Web 服务器进程具有写入权限：

| 目录 | 用途 | 权限建议 |
|------|------|----------|
| `var/cache/` | 文件缓存、路由缓存 | 755 / 可写 |
| `var/logs/` | 日志文件 | 755 / 可写 |
| `storage/` | 用户上传文件 | 755 / 可写 |

在 Linux 系统上设置权限：

```bash
chmod -R 755 var storage
chown -R www-data:www-data var storage
```
