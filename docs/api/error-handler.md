# ErrorHandler

`zap\ErrorHandler` 错误与异常处理类，提供调试友好的错误页面。

**源文件**: `src/ErrorHandler.php`

## 类概览

```php
namespace zap;

class ErrorHandler
```

## 静态方法

### `register(): void`

注册错误处理器、异常处理器和关闭处理器。

```php
use zap\ErrorHandler;

ErrorHandler::register();
```

通常在 `index.php` 或 `App::__construct()` 中调用。

### `shutdownHandler(): void`

致命错误关闭处理器，自动注册在 `register()` 中。

### `errorHandler($errno, $errstr, $error_file, $error_line): void`

PHP 错误处理回调。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$errno` | int | 错误编号 |
| `$errstr` | string | 错误消息 |
| `$error_file` | string | 出错文件 |
| `$error_line` | int | 出错行号 |

### `exceptionHandler($exception): void`

未捕获异常处理回调。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$exception` | Exception | 异常对象 |

### `zapHighlightFile($filename, $line_no, $message = '', $title = '错误信息', $offset = 5): string`

生成带源代码高亮的 HTML 错误页面。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$filename` | string | — | 源文件路径 |
| `$line_no` | int | — | 出错行号 |
| `$message` | string | `''` | 错误消息 |
| `$title` | string | `'错误信息'` | 页面标题 |
| `$offset` | int | `5` | 上下文行数（前后各 N 行） |

返回值：HTML 字符串。

```php
echo ErrorHandler::zapHighlightFile(
    '/path/to/app.php',
    42,
    'Division by zero',
    '运行时错误',
    10
);
```

## Debug 模式行为

| 设置 | Debug 开启 | Debug 关闭 |
|------|-----------|-----------|
| 错误显示 | 详细堆栈 + 源码高亮 | 通用 500 页面 |
| 异常显示 | 完整追踪 | 友好提示 |
| 日志记录 | ✅ 始终 | ✅ 始终 |

## 使用示例

```php
// public/index.php
define('BASE_PATH', dirname(__DIR__));
require BASE_PATH . '/vendor/autoload.php';

// 注册错误处理
\zap\ErrorHandler::register();

$app = new \zap\App(BASE_PATH);
$app->run();
```
