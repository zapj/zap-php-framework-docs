# 错误处理

## 概述

Zap PHP Framework 内置了完善的错误处理机制，包括异常捕获、调试模式、自定义错误页面、源码高亮、致命错误处理等功能。错误处理器在应用启动时自动注册。

## 注册错误处理器

在入口文件 `public/index.php` 中注册错误处理器：

```php
<?php

require __DIR__ . '/../vendor/autoload.php';

use zap\ErrorHandler;
use zap\App;

// 创建应用实例
$app = new App(realpath(__DIR__ . '/../'));

// 注册错误处理器（自动注册异常、错误和致命错误处理器）
ErrorHandler::register();

// 运行应用
$app->run();
```

`ErrorHandler::register()` 会注册以下三个处理器：

1. **异常处理器** - `set_exception_handler()`
2. **错误处理器** - `set_error_handler()`  
3. **关闭处理器** - `register_shutdown_function()` 用于捕获致命错误

## 调试模式

在 `config/config.php` 中控制调试模式：

```php
<?php
return [
    'debug' => true,  // 开发环境设为 true，生产环境设为 false
    // ...
];
```

### 调试模式开启时（debug = true）

当调试模式开启时，发生错误会显示详细的错误页面，包含：

- **错误类型与消息**
- **发生错误的文件路径和行号**
- **完整的调用堆栈（Stack Trace）**
- **相关源码高亮显示**（通过 `zapHighlightFile` 函数）

```
┌─────────────────────────────────────────────────┐
│  Exception: Call to undefined function test()   │
│                                                 │
│  File: app/Controllers/HomeController.php:15    │
│                                                 │
│  Stack Trace:                                   │
│  #0 app/Controllers/HomeController.php(15)      │
│  #1 src/http/Router.php(128)                    │
│  #2 src/App.php(45)                             │
│  #3 public/index.php(12)                        │
│                                                 │
│  Source Code (HomeController.php:10-20):        │
│  10  public function index()                    │
│  11  {                                          │
│  12      $data = ['name' => 'Zap'];             │
│  13                                              │
│  14      // 这里出错了                           │
│  15  →   test();                                │
│  16                                              │
│  17      return $this->json($data);             │
│  18  }                                          │
└─────────────────────────────────────────────────┘
```

### 调试模式关闭时（debug = false）

生产环境下应关闭调试模式。此时：

- 显示用户友好的通用错误页面，不暴露内部信息
- 异常和错误信息会通过日志系统记录
- 致命错误会被优雅地处理

## 自定义错误页面

### 在配置中设置自定义错误页面

```php
// config/config.php
return [
    'debug' => false,

    'error_pages' => [
        404 => 'errors.404',  // 使用视图 errors/404.html
        500 => 'errors.500',  // 使用视图 errors/500.html
        403 => 'errors.403',
    ],
];
```

### 创建自定义错误视图

```html
<!-- app/views/errors/404.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>页面未找到 - 404</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f7f8fa;
            color: #333;
        }
        .error-container {
            text-align: center;
            max-width: 500px;
        }
        .error-code {
            font-size: 120px;
            font-weight: bold;
            color: #e0e0e0;
            line-height: 1;
            margin-bottom: 20px;
        }
        .error-message {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .error-detail {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }
        .back-home {
            display: inline-block;
            padding: 12px 30px;
            background: #4a90d9;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">404</div>
        <div class="error-message">页面未找到</div>
        <div class="error-detail">您访问的页面不存在或已被移除。</div>
        <a href="/" class="back-home">返回首页</a>
    </div>
</body>
</html>
```

## 源码高亮

调试模式下的错误页面使用 `zapHighlightFile` 函数对源代码进行语法高亮。该函数：

- 读取指定文件的指定行范围
- 对 PHP 代码进行语法高亮
- 高亮标记出错的具体行
- 显示行号便于定位

```php
// 内部工作原理
// ErrorHandler 在渲染错误页面时调用:
$highlighted = zapHighlightFile($file, $errorLine, $contextLines);
```

## 异常日志记录

错误处理器会自动将异常信息记录到日志系统：

```php
// 自动记录的信息包括:
// - 异常类名和消息
// - 发生错误的文件和行号
// - 完整的调用堆栈
// - 请求 URL 和方法
// - 客户端 IP

// 也可以手动记录异常
try {
    // 业务逻辑
    processOrder($orderId);
} catch (\Exception $e) {
    // 记录到日志
    Log::error('订单处理异常', [
        'order_id'  => $orderId,
        'exception' => get_class($e),
        'message'   => $e->getMessage(),
        'file'      => $e->getFile(),
        'line'      => $e->getLine(),
        'trace'     => $e->getTraceAsString(),
    ]);

    // 向用户返回友好的错误信息
    return $this->json(['error' => '订单处理失败，请稍后重试'], 500);
}
```

## 致命错误处理

PHP 的致命错误（Fatal Error）无法被常规的异常处理器捕获。Zap 通过 `register_shutdown_function()` 注册了关闭处理器来捕获这类错误：

```php
// 可捕获的致命错误类型：
// - E_ERROR
// - E_PARSE
// - E_CORE_ERROR
// - E_COMPILE_ERROR
// - E_USER_ERROR

// 示例：内存耗尽错误
ini_set('memory_limit', '128M');
// 如果脚本内存超过 128M，关闭处理器会捕获并记录

// 示例：调用未定义的函数（在调试模式下会显示详细错误）
undefined_function(); // Fatal Error → 被关闭处理器捕获
```

关闭处理器会：

1. 检查最后一个错误是否为致命错误
2. 如果是，记录错误信息到日志
3. 在调试模式下显示错误页面
4. 在生产模式下显示通用错误页面

## 配置参考

```php
// config/config.php
return [
    // 调试模式
    'debug' => true,

    // 是否启用日志
    'log' => true,
    'log_enabled' => true,

    // 错误报告级别
    // 当 debug=true 时，建议使用 E_ALL
    // 当 debug=false 时，建议使用 E_ALL & ~E_DEPRECATED & ~E_STRICT
    'error_reporting' => E_ALL,

    // 自定义错误页面模板
    'error_pages' => [
        400 => 'errors.400',
        403 => 'errors.403',
        404 => 'errors.404',
        500 => 'errors.500',
        503 => 'errors.503',
    ],
];
```

## 完整示例：入口文件

```php
<?php
/**
 * public/index.php - Zap 框架入口文件
 */

// 定义应用路径常量
define('BASE_PATH', realpath(__DIR__ . '/..'));
define('APP_PATH', BASE_PATH . '/app');
define('CONFIG_PATH', BASE_PATH . '/config');
define('VAR_PATH', BASE_PATH . '/var');

// 引入 Composer 自动加载
require BASE_PATH . '/vendor/autoload.php';

use zap\ErrorHandler;
use zap\App;

// 设置时区
date_default_timezone_set('Asia/Shanghai');

// 注册错误处理器（必须在创建 App 之前或之后尽早注册）
ErrorHandler::register();

// 创建应用实例
$app = new App(BASE_PATH);

// 创建路由器并注册路由
$router = $app->createRouter();

// 引入路由配置
require APP_PATH . '/routes.php';

// 设置自定义 404 处理器
$router->setNotFound(function() {
    if (config('config.debug')) {
        return response()->json([
            'error' => '路由未找到',
            'path'  => req()->path(),
            'method'=> req()->method(),
        ], 404)->send();
    }
    return view('errors.404')->show();
});

// 运行应用
$app->run();
```

## 自定义异常类

创建应用特定的异常类，便于区分不同类型的错误：

```php
<?php

namespace App\Exceptions;

class BusinessException extends \Exception
{
    protected int $statusCode;

    public function __construct(string $message = '', int $code = 400, int $statusCode = 400)
    {
        parent::__construct($message, $code);
        $this->statusCode = $statusCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}

// 使用
throw new BusinessException('库存不足', 1001, 422);
throw new BusinessException('余额不足', 1002, 402);
throw new BusinessException('权限不足', 1003, 403);
```

全局捕获自定义异常：

```php
// 在 App 或中间件中注册
set_exception_handler(function($e) {
    if ($e instanceof \App\Exceptions\BusinessException) {
        return response()->json([
            'error'   => $e->getMessage(),
            'code'    => $e->getCode(),
        ], $e->getStatusCode())->send();
    }

    // 其他异常交给默认处理器
    throw $e;
});
```

## 最佳实践

1. **开发环境开启调试模式**：获得详细的错误信息，加速问题排查
2. **生产环境关闭调试模式**：避免暴露内部实现细节，提高安全性
3. **记录所有异常到日志**：即使生产环境不显示错误详情，也要记录完整的堆栈信息
4. **自定义错误页面**：提供用户友好的错误页面，保持品牌一致性
5. **使用自定义异常类**：为不同类型的业务错误创建专门的异常类
6. **监控错误率**：定期检查错误日志，及时发现和修复问题
7. **优雅降级**：当依赖服务不可用时，提供降级方案而非直接报错
