# ErrorHandler

`zap\ErrorHandler` 错误和异常处理器，负责全局注册、日志记录和多种模式的错误渲染。

**源文件**: `src/ErrorHandler.php`

## 类概览

```php
namespace zap;

use zap\traits\SingletonTrait;

class ErrorHandler
{
    use SingletonTrait;
}
```

## 注册与配置

### `register(): void`

注册错误、异常和致命错误处理器（同时注册 `set_error_handler`、`set_exception_handler`、`register_shutdown_function`）。框架在 `App` 构造时自动调用。

```php
ErrorHandler::register();
```

### `dontReport(array $exceptions): void`

设置不报告（不写入日志）的异常类型列表。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$exceptions` | array | 异常类名数组，如 `[NotFoundException::class]` |

```php
ErrorHandler::dontReport([
    \zap\exception\NotFoundException::class,
    \zap\exception\ValidationException::class,
]);
```

### `renderable(string $exceptionClass, callable $callback): void`

注册异常渲染回调，按异常类型自定义输出。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$exceptionClass` | string | 异常类名（支持子类匹配） |
| `$callback` | callable | 回调函数，签名 `function(Throwable $e)`，返回 `string|null` |

```php
ErrorHandler::renderable(NotFoundException::class, function ($e) {
    // 返回字符串：直接输出该字符串
    // 返回 null：走默认渲染逻辑
    http_response_code(404);
    return '<h1>404 - ' . $e->getMessage() . '</h1>';
});
```

### `reportable(string $exceptionClass, callable $callback): void`

注册异常报告回调，按异常类型自定义日志记录行为。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$exceptionClass` | string | 异常类名 |
| `$callback` | callable | 回调函数，签名 `function(Throwable $e)`，返回 `true` 阻止默认日志 |

```php
ErrorHandler::reportable(HttpException::class, function ($e) {
    Log::warning("HTTP {$e->getStatusCode()}: {$e->getMessage()}");
    return true; // 阻止默认 emergency 日志
});
```

### `setErrorViews(array $views): void`

注册 HTTP 状态码对应的自定义视图模板。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$views` | array | `[404 => 'errors.404', 500 => 'errors.500', ...]` |

```php
ErrorHandler::setErrorViews([
    404 => 'errors.404',
    403 => 'errors.403',
    500 => 'errors.500',
    503 => 'errors.maintenance',
]);
```

### `forceJson(bool $force = true): void`

强制 JSON 响应模式。所有错误和异常均以 JSON 格式输出，适用于 API 专用应用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$force` | bool | 是否强制 |

```php
// API 路由组内
ErrorHandler::forceJson(true);
```

### `setProductionView(string $viewPath): void`

设置生产环境通用错误视图路径。（Debug 关闭时的默认页面）

| 参数 | 类型 | 说明 |
|------|------|------|
| `$viewPath` | string | 视图名称，如 `'errors.generic'` |

```php
ErrorHandler::setProductionView('errors.oops');
```

## 核心处理器

### `errorHandler(int $errno, string $errstr, string $error_file, int $error_line): bool`

PHP 错误到异常的转换器。处理所有 `error_reporting` 级别的错误。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$errno` | int | 错误级别 |
| `$errstr` | string | 错误消息 |
| `$error_file` | string | 出错文件 |
| `$error_line` | int | 出错行号 |

支持的错误级别：

| 级别 | 处理方式 |
|------|----------|
| `E_ERROR`, `E_CORE_ERROR`, `E_COMPILE_ERROR`, `E_USER_ERROR`, `E_RECOVERABLE_ERROR`, `E_PARSE` | 致命错误，终止脚本 |
| `E_WARNING`, `E_USER_WARNING`, `E_NOTICE`, `E_USER_NOTICE`, `E_DEPRECATED`, `E_USER_DEPRECATED`, `E_STRICT` | 非致命，记录日志后继续 |
| 被 `@` 抑制的错误 | 跳过（`error_reporting() & $errno === 0`） |

```php
// 通常不需要手动调用，由 PHP 自动触发
set_error_handler([ErrorHandler::instance(), 'errorHandler']);
```

### `exceptionHandler(Throwable $exception): void`

捕获所有未处理的异常，执行报告 + 渲染流程。

```php
// 通常不需要手动调用，由 PHP 自动触发
set_exception_handler([ErrorHandler::instance(), 'exceptionHandler']);
```

### `shutdownHandler(): void`

捕获致命错误（`E_ERROR` 等无法被 `set_error_handler` 捕获的错误）。

```php
// 通常不需要手动调用，由 PHP 自动触发
register_shutdown_function([ErrorHandler::instance(), 'shutdownHandler']);
```

## 公开工具方法

### `report(Throwable $e): void`

报告异常（记录日志），不终止执行。用于可恢复的异常场景。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$e` | Throwable | 要报告的异常 |

```php
try {
    sendNotification($user);
} catch (\Throwable $e) {
    ErrorHandler::instance()->report($e);
    // 继续执行…
}
```

### `render(Throwable $e): void`

渲染异常页面并输出。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$e` | Throwable | 要渲染的异常 |

### `zapHighlightFile(string $filename, int $lineNo, string $message = '', string $title = '错误信息', int $offset = 5): string`

生成带语法高亮的源代码片段 HTML。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filename` | string | 源文件路径 |
| `$lineNo` | int | 错误行号 |
| `$message` | string | 错误消息（可选） |
| `$title` | string | 标题（可选） |
| `$offset` | int | 前后上下文行数，默认 5 |

```php
$html = ErrorHandler::instance()->zapHighlightFile(
    'app/Controllers/UserController.php',
    42,
    '未定义的变量 $user',
    '运行时错误'
);
```

### `abort(int $statusCode = 500, string $message = '', array $headers = []): void`

静态方法，抛出 `HttpException` 并终止请求。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$statusCode` | int | HTTP 状态码 |
| `$message` | string | 错误消息（默认使用状态码对应消息） |
| `$headers` | array | 额外响应头 |

```php
ErrorHandler::abort(404, '资源不存在');
ErrorHandler::abort(403);
ErrorHandler::abort(429, '请求频繁', ['Retry-After' => '60']);
```

## 响应模式

### Debug 模式（`config.debug = true`）

- 源码高亮 + 错误消息 + 调用栈（过滤框架内部）
- HTTP 状态码响应
- JSON 请求返回完整错误 JSON（含 trace）

### 生产模式（`config.debug = false`）

- 简洁的 HTML 状态码页面
- JSON 请求仅返回 `{error, code, message}`
- 文件路径、堆栈等敏感信息全部隐藏

### CLI 模式

- ANSI 彩色输出到 STDERR
- 无 HTML，直接文本格式

## 辅助函数

| 函数 | 等价调用 |
|------|----------|
| `abort(404)` | `ErrorHandler::abort(404)` 抛出 `HttpException` |
| `abort(403, '消息')` | `ErrorHandler::abort(403, '消息')` |
| `report($e)` | `ErrorHandler::instance()->report($e)` |
