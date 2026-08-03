# 安装

## 环境要求

Zap PHP Framework 需要以下环境支持：

- **PHP 8.0+**（推荐 PHP 8.1 或更高版本）
- **Composer** 依赖管理工具
- **Web 服务器**：Nginx / Apache / IIS
- **PHP 扩展**：
  - `PDO` - 数据库访问（如使用数据库功能）
  - `mbstring` - 多字节字符串处理
  - `fileinfo` - 文件类型检测
  - `gd` 或 `imagick` - 图像处理（如使用 Image 类）
  - `redis` - Redis 缓存（可选，如使用 Redis）
  - `memcached` / `memcache` - Memcached 缓存（可选）
  - `openssl` - 加密与安全功能

## 通过 Composer 安装

### 创建新项目

```bash
composer create-project zap/zap my-project
cd my-project
```

### 在已有项目中手动引入

```bash
composer require zap/zap
```

## 目录结构概览

安装完成后，你的项目目录结构如下：

```
my-project/
├── app/               # 应用代码（控制器、模型、中间件等）
│   ├── Controllers/   # 控制器目录
│   ├── Models/        # 模型目录
│   └── views/         # 视图模板目录
├── assets/            # 静态资源（CSS、JS、图片等）
├── config/            # 配置文件目录
│   ├── config.php     # 主配置文件
│   ├── cache.php      # 缓存配置
│   ├── database.php   # 数据库配置
│   └── log.php        # 日志配置
├── resources/         # 前端源文件（Sass、未编译的 JS 等）
├── storage/           # 运行时存储（上传文件、生成的文件等）
├── themes/            # 主题目录
├── var/               # 变量与缓存目录
│   └── cache/         # 路由缓存、文件缓存输出目录
├── vendor/            # Composer 依赖包
├── public/            # Web 入口目录
│   ├── index.php      # 入口文件
│   └── .htaccess      # Apache 重写规则
└── composer.json
```

## Web 服务器配置

### Nginx 配置

在 Nginx 中，需要将所有请求重定向到 `public/index.php` 入口文件。以下是推荐的 Nginx 配置：

```nginx
server {
    listen 80;
    server_name example.com;
    root /path/to/my-project/public;
    index index.php;

    # 如果文件或目录存在则直接访问，否则重写到 index.php
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # 禁止访问敏感文件
    location ~ /\. {
        deny all;
    }

    location ~ /(config|var|storage) {
        deny all;
    }
}
```

### Apache 配置

在 `public/` 目录下创建 `.htaccess` 文件：

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # 如果请求的文件或目录存在，直接访问
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d

    # 所有其他请求重写到 index.php
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
```

确保 Apache 已启用 `mod_rewrite` 模块：

```bash
sudo a2enmod rewrite
sudo service apache2 restart
```

### PHP 内置服务器（开发环境）

对于本地开发，可以使用 PHP 内置的 Web 服务器：

```bash
cd my-project/public
php -S localhost:8080
```

## 快速开始

### 1. 创建入口文件

在 `public/` 目录下创建 `index.php`：

```php
<?php

/**
 * Zap PHP Framework - 入口文件
 */

// 引入 Composer 自动加载
require __DIR__ . '/../vendor/autoload.php';

// 创建应用实例
$app = new zap\App(realpath(__DIR__ . '/../'));

// 创建路由器
$router = $app->createRouter();

// 定义路由
$router->get('/', function() {
    return zap\http\Response::ok(['message' => 'Hello, Zap!']);
});

$router->get('/hello/{name}', function($name) {
    return response("Hello, {$name}!");
});

// 设置 404 处理器
$router->setNotFound(function() {
    return zap\http\Response::notFound('页面未找到');
});

// 运行应用
$app->run();
```

### 2. 第一个控制器

在 `app/Controllers/` 目录下创建 `HomeController.php`：

```php
<?php

namespace App\Controllers;

use zap\http\Controller;

class HomeController extends Controller
{
    public function index()
    {
        return $this->json(['message' => '欢迎使用 Zap PHP Framework']);
    }

    public function hello($name)
    {
        return $this->json(['greeting' => "你好, {$name}!"]);
    }
}
```

然后在路由中注册：

```php
$router->get('/', 'App\Controllers\HomeController@index');
$router->get('/hello/{name}', 'App\Controllers\HomeController@hello');
```

### 3. 访问应用

启动 Web 服务器后，在浏览器中访问：

- `http://localhost:8080/` - 首页
- `http://localhost:8080/hello/Zap` - 带参数的路由

### 4. 开发建议

- 开发时将 `config/config.php` 中的 `debug` 设为 `true`，可以获得详细的错误信息和堆栈跟踪
- 生产环境务必关闭 debug 模式并设置合理的错误报告级别
- 使用 `var/cache/` 目录缓存路由信息以提高性能

## 下一步

- 了解 [目录结构](./structure.md) 的详细说明
- 学习 [配置系统](./configuration.md) 的使用方法
- 掌握 [路由系统](./routing.md) 的完整功能
