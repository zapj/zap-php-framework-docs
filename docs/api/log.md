# Log

**命名空间**: `zap\Log`

日志门面类，提供静态方式记录日志。通过 `__callStatic` 支持所有 PSR-3 日志级别。默认使用 `SimpleLogger`，也可以集成 Monolog。

---

## 日志级别常量

```php
const DEBUG = 100;
const INFO = 200;
const NOTICE = 250;
const WARNING = 300;
const ERROR = 400;
const CRITICAL = 500;
const ALERT = 550;
const EMERGENCY = 600;
```

| 常量 | 值 | 说明 |
|------|-----|------|
| `DEBUG` | 100 | 调试信息 |
| `INFO` | 200 | 一般信息 |
| `NOTICE` | 250 | 提示信息 |
| `WARNING` | 300 | 警告 |
| `ERROR` | 400 | 错误 |
| `CRITICAL` | 500 | 严重错误 |
| `ALERT` | 550 | 警报 |
| `EMERGENCY` | 600 | 紧急 |

---

## `__callStatic` 静态方法

Log 类通过 `__callStatic` 魔术方法提供静态日志记录方法，对应所有 PSR-3 日志级别。

### `debug(string $message, array $context = []): void`

```php
public static function debug(string $message, array $context = []): void
```

记录 DEBUG 级别日志。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$message` | `string` | 日志消息 |
| `$context` | `array` | 上下文数据 |

**返回值**: `void`

---

### `info(string $message, array $context = []): void`

```php
public static function info(string $message, array $context = []): void
```

记录 INFO 级别日志。

---

### `notice(string $message, array $context = []): void`

```php
public static function notice(string $message, array $context = []): void
```

记录 NOTICE 级别日志。

---

### `warning(string $message, array $context = []): void`

```php
public static function warning(string $message, array $context = []): void
```

记录 WARNING 级别日志。

---

### `error(string $message, array $context = []): void`

```php
public static function error(string $message, array $context = []): void
```

记录 ERROR 级别日志。

---

### `critical(string $message, array $context = []): void`

```php
public static function critical(string $message, array $context = []): void
```

记录 CRITICAL 级别日志。

---

### `alert(string $message, array $context = []): void`

```php
public static function alert(string $message, array $context = []): void
```

记录 ALERT 级别日志。

---

### `emergency(string $message, array $context = []): void`

```php
public static function emergency(string $message, array $context = []): void
```

记录 EMERGENCY 级别日志。

---

## SimpleLogger

**命名空间**: `zap\log\SimpleLogger`

框架内置的轻量级日志实现，将日志写入文件。支持日志轮转（按日期）和日志级别过滤。

### 构造函数

```php
public function __construct(string $name, string $logPath, int $level = Log::DEBUG)
```

创建 SimpleLogger 实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 日志通道名称 |
| `$logPath` | `string` | 日志文件存储路径 |
| `$level` | `int` | 最低记录级别（低于此级别的日志将被忽略） |

---

### `log(int $level, string $message, array $context = []): void`

```php
public function log(int $level, string $message, array $context = []): void
```

记录一条日志。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$level` | `int` | 日志级别常量 |
| `$message` | `string` | 日志消息 |
| `$context` | `array` | 上下文数据 |

**返回值**: `void`

**日志文件命名规则**:
```
{logPath}/{name}-{Y-m-d}.log
```

**日志格式**:
```
[2024-01-15 14:30:00] [INFO] User logged in {"user_id":1,"ip":"127.0.0.1"}
```

---

## 配置

在配置文件中设置日志路径和级别：

```php
// config/app.php
return [
    'log_path' => var_path('logs'),
    'log_level' => \zap\Log::DEBUG, // 开发环境
    // 'log_level' => \zap\Log::ERROR, // 生产环境
];
```

---

## 使用示例

### 基本日志记录

```php
use zap\Log;

// 不同级别的日志
Log::debug('调试信息', ['user_id' => 1]);
Log::info('用户登录成功', ['user_id' => 1, 'ip' => '127.0.0.1']);
Log::notice('磁盘使用率达到 80%');
Log::warning('API 响应时间超过 3 秒', ['endpoint' => '/api/users', 'time' => 3.5]);
Log::error('数据库连接失败', ['host' => 'localhost', 'error' => 'Connection refused']);
Log::critical('支付服务不可用', ['service' => 'payment', 'time' => '2024-01-15 14:30:00']);
Log::alert('系统内存不足', ['memory_usage' => '95%']);
Log::emergency('应用程序无法启动', ['error' => 'Fatal error']);
```

### 控制器中使用

```php
class UserController extends \zap\http\Controller
{
    public function login()
    {
        $username = $this->request()->input('username');

        try {
            $user = auth()->attempt($username, $password);
            Log::info('用户登录成功', [
                'user_id' => $user->id,
                'username' => $username,
                'ip' => $_SERVER['REMOTE_ADDR'],
            ]);
            return $this->json(['token' => $token]);

        } catch (\Exception $e) {
            Log::warning('登录失败', [
                'username' => $username,
                'reason' => $e->getMessage(),
            ]);
            return $this->json(['error' => '登录失败'], 401);
        }
    }
}
```

### 上下文数据

```php
// 记录带上下文的日志
Log::error('订单创建失败', [
    'order_id' => $orderId,
    'user_id' => $userId,
    'amount' => $amount,
    'trace' => $exception->getTraceAsString(),
]);

// 记录请求详情
Log::info('API 请求', [
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'user_agent' => $_SERVER['HTTP_USER_AGENT'],
    'duration_ms' => round((microtime(true) - $start) * 1000, 2),
]);
```

### 日志文件

日志文件存储在 `var_path('logs')` 目录下，按日期自动分割：

```
var/logs/
    app-2024-01-15.log
    app-2024-01-14.log
    app-2024-01-13.log
```
