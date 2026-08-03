# 错误处理

## 概述

Zap PHP Framework 内置了完整的错误和异常处理系统，开箱即用：

- **全局注册** — `App` 构造时自动调用 `ErrorHandler::register()`，无需手动注册
- **多模式** — Debug/生产/CLI/API(JSON) 四种输出模式自动适配
- **回调注册** — `renderable()` / `reportable()` 按异常类型自定义渲染和报告
- **HTTP 异常** — `HttpException` 携带状态码，自动映射对应错误页面
- **安全** — 生产环境不泄露源码路径和堆栈信息
- **CLI 友好** — 命令行模式彩色错误输出到 STDERR

## 快速开始

### 基本注册

框架初始化时自动注册，无需手动操作。如需手动控制：

```php
use zap\ErrorHandler;

// 注册错误/异常/致命错误处理器
ErrorHandler::register();

// 标记不需要记录日志的异常类型
ErrorHandler::dontReport([
    \zap\exception\NotFoundException::class,
    \zap\exception\ValidationException::class,
]);
```

### Debug 模式

在 `config/config.php` 中设置：

```php
return [
    'debug' => true,  // 开发环境：显示详细错误信息和堆栈
];
```

- **`true`** — 展示完整的错误信息、源代码高亮、调用堆栈、请求上下文
- **`false`** — 显示简洁的 HTTP 状态码页面，敏感信息不泄露

## 抛出 HTTP 异常

使用 `abort()` 快速终止请求并返回 HTTP 错误：

```php
<?php

namespace App\Controllers;

use zap\http\Controller;

class ArticleController extends Controller
{
    public function show($id)
    {
        $article = DB::table('articles')->where('id', $id)->first();

        if (!$article) {
            abort(404, '文章不存在');
        }

        if (!$article['published']) {
            abort(403, '文章未发布');
        }

        return view('article.show', ['article' => $article]);
    }

    public function edit($id)
    {
        $user = Session::get('user');

        if (!$user) {
            abort(401, '请先登录');
        }

        $article = DB::table('articles')->where('id', $id)->first();

        if (!$article) {
            abort(404);
        }

        if ($article['user_id'] !== $user['id'] && $user['role'] !== 'admin') {
            abort(403);
        }

        return view('article.edit', ['article' => $article]);
    }
}
```

### 自定义异常

直接抛出 `HttpException` 或预定义的异常类：

```php
use zap\exception\NotFoundException;
use zap\exception\HttpException;

// 预定义异常
throw new NotFoundException('用户不存在');

// 自定义 HTTP 异常
throw new HttpException(422, '邮箱格式不正确');

// 带响应头
throw (new HttpException(429, '请求频率过高，请稍后'))
    ->withHeaders(['Retry-After' => '60']);
```

## 异常类层次

```
\Throwable
├── \Exception
│   └── \RuntimeException
│       ├── HttpException (zap\exception)
│       │   └── NotFoundException (404)
│       ├── ViewNotFoundException
│       ├── CurlException
│       └── NotSupportedException
```

| 异常类 | 父类 | HTTP 状态码 | 说明 |
|--------|------|-------------|------|
| `HttpException` | `\RuntimeException` | 可配 | HTTP 异常基类 |
| `NotFoundException` | `HttpException` | 404 | 资源未找到 |
| `ViewNotFoundException` | `\RuntimeException` | 500 | 视图文件缺失 |
| `CurlException` | `\RuntimeException` | 502 | cURL 请求失败 |
| `NotSupportedException` | `\RuntimeException` | 501 | 功能不支持 |

## 自定义渲染

通过 `renderable()` 注册指定异常类型的渲染回调：

```php
use zap\ErrorHandler;
use zap\exception\NotFoundException;

// 自定义 404 页面
ErrorHandler::renderable(NotFoundException::class, function ($e) {
    http_response_code(404);

    // 返回视图
    ZView::render('errors.custom_404', [
        'message' => $e->getMessage(),
        'url'     => request()->url(),
    ]);
    return '';  // 返回 null 走默认渲染，返回字符串直接输出
});

// 自定义 JSON API 异常
ErrorHandler::renderable(HttpException::class, function ($e) {
    if (request()->wantsJson()) {
        http_response_code($e->getStatusCode());
        header('Content-Type: application/json');
        echo json_encode([
            'error'   => true,
            'code'    => $e->getStatusCode(),
            'message' => $e->getMessage(),
        ]);
    }
    return null; // 非 JSON 请求走默认
});
```

## 自定义报告

通过 `reportable()` 控制哪些异常需要记录日志：

```php
use zap\ErrorHandler;

// 完全阻止某类异常的日志记录
ErrorHandler::reportable(NotFoundException::class, function ($e) {
    return true;  // 返回 true 阻止默认日志
});

// 自定义日志格式
ErrorHandler::reportable(HttpException::class, function ($e) {
    Log::warning("HTTP {$e->getStatusCode()}: {$e->getMessage()}", [
        'url'  => request()->url(),
        'ip'   => request()->ip(),
    ]);
    return true;
});

// 批量不报告
ErrorHandler::dontReport([
    NotFoundException::class,
    NotSupportedException::class,
]);
```

## 自定义错误页面

### 按 HTTP 状态码

```php
use zap\ErrorHandler;

ErrorHandler::setErrorViews([
    404 => 'errors.404',
    500 => 'errors.500',
    403 => 'errors.403',
    503 => 'errors.503',
]);
```

然后创建对应的视图文件，如 `views/errors/404.html`：

```html
<h1><?= $status ?? 404 ?></h1>
<p>您访问的页面走丢了~</p>
```

视图可用的变量：

| 变量 | 类型 | 说明 |
|------|------|------|
| `$status` | int | HTTP 状态码 |
| `$file` | string | 出错文件路径 |
| `$line` | int | 出错行号 |
| `$message` | string | 错误消息 |
| `$type` | string | 错误类型 |
| `$exception` | Throwable | 异常对象（Debug 模式） |
| `$html` | string | 预渲染的高亮 HTML（Debug 模式） |

### 生产环境统一页面

```php
ErrorHandler::setProductionView('errors.generic');
```

## JSON / API 模式

框架自动检测 JSON 请求并返回 JSON 响应，无需额外配置：

**触发条件**（任一满足）：
- `Accept: application/json` 请求头
- `X-Requested-With: XMLHttpRequest` 请求头（AJAX）
- 调用 `ErrorHandler::forceJson(true)`

```php
// 强制 JSON 模式
ErrorHandler::forceJson(true);
```

JSON 响应格式（Debug 模式）：

```json
{
    "error": true,
    "code": 404,
    "message": "资源未找到",
    "exception": "zap\\exception\\NotFoundException",
    "file": "app/Controllers/UserController.php",
    "line": 25,
    "trace": ["#0 ...", "#1 ..."]
}
```

生产模式 JSON 响应：

```json
{
    "error": true,
    "code": 500,
    "message": "服务器内部错误"
}
```

## 命令行错误处理

CLI 模式下自动输出 ANSI 彩色错误到 STDERR，无 HTML 输出：

```
[Fatal Error] Class "App\Models\Missing" not found
  at app/Controllers/UserController.php:42
```

## 日志记录

异常默认记录到 `Log::emergency()` 等级，包含请求上下文：

```php
// 手动报告异常（不终止执行）
try {
    thirdPartyOperation();
} catch (\Throwable $e) {
    report($e);  // 记录日志后继续执行

    Session::flash('warning', '同步操作失败，已记录');
    return response()->redirect('/dashboard');
}
```

日志中包含的请求上下文：

```
url     → 完整请求 URL
method  → GET / POST / PUT ...
ip      → 客户端 IP
ua      → User-Agent
referer → 引用地址
```

## 完整示例

```php
<?php
// public/index.php

use zap\App;
use zap\ErrorHandler;

require __DIR__ . '/../vendor/autoload.php';

$app = new App(realpath(__DIR__ . '/..'));

// 配置错误处理（可选：框架已在 App 构造中自动注册）
ErrorHandler::register();

// 不报告 404 异常
ErrorHandler::dontReport([
    \zap\exception\NotFoundException::class,
]);

// 自定义 404 渲染
ErrorHandler::renderable(
    \zap\exception\NotFoundException::class,
    function ($e) {
        ZView::render('errors.404', ['message' => $e->getMessage()]);
    }
);

// 注册 HTTP 状态码对应视图
ErrorHandler::setErrorViews([
    404 => 'errors.404',
    500 => 'errors.500',
    503 => 'errors.maintenance',
]);

// 启动路由
$app->run();
```

## 助手函数

| 函数 | 说明 |
|------|------|
| `abort(404)` | 抛出 HTTP 异常，终止请求 |
| `abort(403, '无权访问')` | 带自定义消息 |
| `abort(429, '请求过多', ['Retry-After' => '60'])` | 带响应头 |
| `report($e)` | 记录异常日志，不终止执行 |

## 最佳实践

1. **Debug 模式严格跟随环境** — 开发环境 `true`，生产环境 `false`
2. **`dontReport` 过滤 404 / 422 等常规异常** — 避免日志被业务无关错误淹没
3. **API 路由使用 JSON 响应** — 配合 `forceJson()` 或 `Accept` 头，前端友好
4. **生产环境不泄露路径** — 关闭 Debug，使用 `setErrorViews()` 配置友好页面
5. **`report()` 用于可恢复错误** — 主流程不中断，但记录异常信息
6. **自定义异常携带上下文** — 异常构造时传入有意义的 message 和 code
