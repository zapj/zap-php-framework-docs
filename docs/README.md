---
home: true
title: Zap PHP Framework
heroImage: /logo.svg
heroText: Zap PHP Framework
tagline: 轻量级、高性能的 PHP 开发框架
actions:
  - text: 快速开始 →
    link: /guide/installation
    type: primary
  - text: API 参考
    link: /api/
    type: secondary
features:
  - title: 轻量极速
    details: 核心框架极简设计，最小化运行时开销，路由缓存支持 File/Redis/Memcache 多驱动
  - title: 优雅路由
    details: 支持 RESTful 风格、命名路由、URL 生成、资源路由、路由分组、中间件链
  - title: 双模板引擎
    details: 原生 PHP 渲染器和 Twig 模板引擎双支持，布局继承与块系统
  - title: 图像处理
    details: 内置 GD 图像处理，支持裁剪、缩放、14+ 滤镜、WebP、水印、TTF 文字
  - title: 多缓存驱动
    details: 统一接口支持 File、Redis、Memcache/Memcached 三种缓存后端
  - title: 现代化 HTTP
    details: PSR 风格的 Request/Response/Session/Middleware，兼容 PHP 8.0+
footer: MIT Licensed | Copyright © 2019-2025 Zap PHP Framework
---

## 快速预览

```php
// routes.php
use zap\http\Route;

Route::get('/', fn() => 'Hello Zap!');
Route::resource('users', 'UserController');
Route::get('/posts/{id:\d+}', 'PostController@show')->name('posts.show');

// 生成 URL
echo Router::url('posts.show', ['id' => 1]); // /posts/1
```

```php
// config/cache.php
return [
    'default' => 'redis',
    'redis'   => ['params' => ['127.0.0.1', 6379]],
];
```
