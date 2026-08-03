# 目录结构

## 概述

Zap PHP Framework 采用简洁清晰的目录结构，遵循约定优于配置的原则。

## 完整目录结构

```
project/
├── app/                   # 应用代码
│   ├── Controllers/       # 控制器类
│   ├── Models/            # 数据模型类
│   ├── Middleware/        # 中间件类
│   └── views/             # 视图模板文件
├── assets/                # 静态资源（可通过 asset() 访问）
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

应用程序的核心代码存放位置。

```
app/
├── Controllers/           # 控制器目录
│   ├── HomeController.php
│   ├── UserController.php
│   └── Api/
│       └── UserController.php
├── Models/                # 模型目录
│   ├── User.php
│   └── Post.php
├── Middleware/             # 中间件目录
│   ├── AuthMiddleware.php
│   └── CorsMiddleware.php
└── views/                 # 视图模板
    ├── home/
    │   └── index.html
    ├── user/
    │   ├── profile.html
    │   └── list.html
    └── layouts/
        └── main.html
```

### assets/ - 静态资源

存放可直接通过 URL 访问的静态文件。通过 `assets_path()` 获取路径。

### config/ - 配置文件

所有配置文件采用 PHP 数组返回格式，支持点分路径访问（`config('database.master.host')`）。

使用 `Config::set()` / `config_set()` 可在运行时修改配置；使用 `Config::forget()` / `config_forget()` 可删除配置项。使用 `config_all()` 获取全部已加载配置。

### resources/ - 前端源文件

存放前端构建前的源文件（SCSS、TypeScript 等）。通过 `resource_path()` 获取路径。

### storage/ - 运行时存储

存放运行时生成的文件和用户上传文件。通过 `storage_path()` 获取路径。

### themes/ - 主题目录

支持多主题系统。通过 `themes_path()` 和 `themes_url()` 访问。

### var/ - 变量与缓存

存放临时文件、缓存和日志。通过 `var_path()` 获取路径。此目录需有写入权限。

### public/ - Web 入口

Web 服务器的文档根目录，是唯一对外暴露的目录。通过 `public_path()` 获取路径。

### events/ - 事件处理器

存放事件处理器 PHP 文件。通过 `event_fire('order.created')` 触发时自动加载 `events/order.created.php`。

## 路径辅助函数

```php
base_path('config/database.php');    // /path/to/project/config/database.php
config_path('cache.php');            // /path/to/project/config/cache.php
storage_path('uploads/avatars/');    // /path/to/project/storage/uploads/avatars/
assets_path('css/app.css');          // /path/to/project/assets/css/app.css
resource_path('scss/app.scss');      // /path/to/project/resources/scss/app.scss
themes_path('default/views/');       // /path/to/project/themes/default/views/
var_path('cache/');                  // /path/to/project/var/cache/
public_path('index.php');            // /path/to/project/public/index.php
root_path();                         // Web 文档根路径
```

## 目录权限

需写入权限的目录：

| 目录 | 用途 | 权限建议 |
|------|------|----------|
| `var/cache/` | 文件缓存、路由缓存 | 755 / 可写 |
| `var/logs/` | 日志文件 | 755 / 可写 |
| `storage/` | 用户上传文件 | 755 / 可写 |

```bash
chmod -R 755 var storage
chown -R www-data:www-data var storage
```
