# 日志

## 概述

Zap PHP Framework 的日志系统基于 Monolog 构建，提供了灵活的日志通道配置和多级别日志记录能力。通过 `Log` 门面，您可以方便地记录应用运行过程中的各类信息。

## Log 门面

```php
use zap\Log;

// 基本用法
Log::info('用户登录成功', ['user_id' => 123]);
Log::error('支付失败', ['order_id' => 456, 'reason' => '余额不足']);
```

Log 门面内部自动管理 Monolog Logger 实例，根据 `config/log.php` 中的配置创建对应的处理器。

## 日志级别

Zap 支持 PSR-3 定义的所有日志级别（从低到高）：

| 级别 | 方法 | 说明 |
|------|------|------|
| DEBUG | `Log::debug()` | 调试信息，开发时使用 |
| INFO | `Log::info()` | 常规信息，如用户操作记录 |
| NOTICE | `Log::notice()` | 值得注意的事件 |
| WARNING | `Log::warning()` | 警告信息，非错误但需关注 |
| ERROR | `Log::error()` | 错误信息，需要处理 |
| CRITICAL | `Log::critical()` | 严重错误，需要立即处理 |
| ALERT | `Log::alert()` | 必须立即采取行动 |
| EMERGENCY | `Log::emergency()` | 系统不可用 |

### 使用示例

```php
use zap\Log;

// 调试信息
Log::debug('SQL 查询', [
    'sql'    => 'SELECT * FROM users WHERE id = ?',
    'params' => [5],
    'time'   => '2.3ms',
]);

// 常规信息
Log::info('用户注册', [
    'user_id' => 100,
    'email'   => 'newuser@example.com',
    'ip'      => req()->ip(),
]);

// 通知
Log::notice('磁盘空间不足', [
    'disk'     => '/dev/sda1',
    'usage'    => '92%',
    'free_gb'  => 8,
]);

// 警告
Log::warning('API 响应缓慢', [
    'endpoint' => '/api/users',
    'time_ms'  => 3500,
    'threshold'=> 2000,
]);

// 错误
Log::error('数据库连接失败', [
    'host'   => config('database.master.host'),
    'error'  => $e->getMessage(),
    'trace'  => $e->getTraceAsString(),
]);

// 严重错误
Log::critical('支付网关不可用', [
    'gateway' => 'alipay',
    'code'    => 503,
]);

// 警报
Log::alert('安全漏洞检测', [
    'type'     => 'SQL注入尝试',
    'ip'       => req()->ip(),
    'payload'  => req()->rawBody(),
]);

// 紧急
Log::emergency('应用无法启动', [
    'reason' => '配置文件缺失',
]);
```

## 配置日志处理器

在 `config/log.php` 中为每个通道配置 Monolog 处理器：

### 单文件日志

```php
<?php
return [
    'default' => 'app',

    'app' => [
        'handler' => \Monolog\Handler\StreamHandler::class,
        'params'  => [
            var_path('logs/app.log'),
            \Monolog\Logger::DEBUG,
        ],
    ],
];
```

### 按日期轮转日志

```php
'app' => [
    'handler' => \Monolog\Handler\RotatingFileHandler::class,
    'params'  => [
        var_path('logs/app.log'),
        30,                              // 保留 30 天
        \Monolog\Logger::DEBUG,
    ],
],
```

### 按日志级别分离

```php
'error' => [
    'handler' => \Monolog\Handler\StreamHandler::class,
    'params'  => [
        var_path('logs/error.log'),
        \Monolog\Logger::ERROR,          // 仅记录 ERROR 及以上级别
    ],
],
```

### 多通道配置

```php
<?php
return [
    'default' => 'app',

    // 应用日志通道
    'app' => [
        'handler' => \Monolog\Handler\RotatingFileHandler::class,
        'params'  => [
            var_path('logs/app.log'),
            30,
            \Monolog\Logger::DEBUG,
        ],
    ],

    // 错误日志通道
    'error' => [
        'handler' => \Monolog\Handler\StreamHandler::class,
        'params'  => [
            var_path('logs/error.log'),
            \Monolog\Logger::ERROR,
        ],
    ],

    // 数据库日志通道
    'database' => [
        'handler' => \Monolog\Handler\RotatingFileHandler::class,
        'params'  => [
            var_path('logs/database.log'),
            14,                            // 保留 14 天
            \Monolog\Logger::DEBUG,
        ],
    ],

    // API 请求日志
    'api' => [
        'handler' => \Monolog\Handler\StreamHandler::class,
        'params'  => [
            var_path('logs/api.log'),
            \Monolog\Logger::INFO,
        ],
    ],
];
```

## 通道切换

```php
use zap\Log;

// 使用默认通道（config 中的 default）
Log::info('默认通道消息');

// 切换到指定通道
Log::channel('database')->info('数据库查询', ['sql' => 'SELECT ...']);
Log::channel('error')->error('严重错误', ['message' => $e->getMessage()]);
Log::channel('api')->info('API 请求', [
    'method' => 'POST',
    'path'   => '/api/users',
    'status' => 201,
]);
```

## SimpleLogger 回退

当 Monolog 不可用或配置不完整时，Log 门面会自动回退到 `SimpleLogger`。SimpleLogger 提供基本的文件日志功能：

```php
// SimpleLogger 行为（当 Monolog 不可用时自动使用）
// 日志文件: var/logs/app.log
// 格式: [2024-01-15 10:30:00] INFO: 日志消息 {"key":"value"}
```

## 实际应用示例

### 请求日志中间件

```php
<?php

namespace App\Middleware;

use zap\Log;

class RequestLogMiddleware
{
    public function handle($request, $next)
    {
        $startTime = microtime(true);

        // 记录请求
        Log::channel('api')->info('请求开始', [
            'method' => $request->method(),
            'path'   => $request->path(),
            'ip'     => $request->ip(),
            'ua'     => $request->userAgent(),
        ]);

        // 处理请求
        $response = $next($request);

        // 记录响应
        $duration = round((microtime(true) - $startTime) * 1000, 2);

        Log::channel('api')->info('请求完成', [
            'method'   => $request->method(),
            'path'     => $request->path(),
            'status'   => $response->getStatusCode(),
            'duration' => $duration . 'ms',
        ]);

        return $response;
    }
}
```

### 数据库操作日志

```php
<?php

class QueryLogger
{
    public static function log($sql, $params, $time)
    {
        // 仅记录慢查询
        if ($time > 100) {
            Log::channel('database')->warning('慢查询检测', [
                'sql'    => $sql,
                'params' => $params,
                'time'   => $time . 'ms',
            ]);
        }

        // 记录所有查询（调试模式）
        if (config('config.debug')) {
            Log::channel('database')->debug('SQL 执行', [
                'sql'    => $sql,
                'params' => $params,
                'time'   => $time . 'ms',
            ]);
        }
    }
}
```

### 业务操作日志

```php
<?php

namespace App\Controllers;

use zap\http\Controller;
use zap\Log;

class OrderController extends Controller
{
    public function create()
    {
        $userId = Session::get('user.id');
        $data = $this->request()->json();

        try {
            $orderId = DB::transaction(function() use ($userId, $data) {
                // 创建订单...
                $orderId = DB::table('orders')->insert([
                    'user_id'    => $userId,
                    'total'      => $data['total'],
                    'status'     => 'pending',
                    'created_at' => date('Y-m-d H:i:s'),
                ]);

                // 创建订单项...
                foreach ($data['items'] as $item) {
                    DB::table('order_items')->insert([
                        'order_id'   => $orderId,
                        'product_id' => $item['product_id'],
                        'quantity'   => $item['quantity'],
                        'price'      => $item['price'],
                    ]);
                }

                return $orderId;
            });

            Log::info('订单创建成功', [
                'order_id' => $orderId,
                'user_id'  => $userId,
                'total'    => $data['total'],
                'items'    => count($data['items']),
            ]);

            return $this->json(['order_id' => $orderId], 201);

        } catch (\Exception $e) {
            Log::error('订单创建失败', [
                'user_id' => $userId,
                'data'    => $data,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->json(['error' => '订单创建失败，请稍后重试'], 500);
        }
    }

    public function pay($orderId)
    {
        $order = DB::table('orders')->find($orderId);

        if (!$order) {
            Log::warning('支付订单不存在', ['order_id' => $orderId]);
            return $this->json(['error' => '订单不存在'], 404);
        }

        if ($order['status'] !== 'pending') {
            Log::notice('重复支付尝试', [
                'order_id' => $orderId,
                'status'   => $order['status'],
            ]);
            return $this->json(['error' => '订单状态异常'], 400);
        }

        try {
            // 调用支付网关...
            $result = PaymentGateway::charge($order);

            DB::table('orders')->where('id', $orderId)->update([
                'status'     => 'paid',
                'paid_at'    => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);

            Log::info('支付成功', [
                'order_id'      => $orderId,
                'amount'        => $order['total'],
                'transaction_id'=> $result['transaction_id'],
            ]);

            return $this->json(['message' => '支付成功']);

        } catch (\Exception $e) {
            Log::error('支付失败', [
                'order_id' => $orderId,
                'amount'   => $order['total'],
                'error'    => $e->getMessage(),
            ]);

            return $this->json(['error' => '支付失败: ' . $e->getMessage()], 500);
        }
    }
}
```

### 安全事件日志

```php
<?php

class SecurityLogger
{
    public static function loginFailed($email, $ip)
    {
        Log::warning('登录失败', [
            'email' => $email,
            'ip'    => $ip,
            'time'  => date('Y-m-d H:i:s'),
        ]);
    }

    public static function bruteForceDetected($ip, $attempts)
    {
        Log::alert('暴力破解检测', [
            'ip'       => $ip,
            'attempts' => $attempts,
            'duration' => '15 分钟内',
        ]);
    }

    public static function unauthorizedAccess($userId, $resource)
    {
        Log::warning('未授权访问', [
            'user_id'  => $userId,
            'resource' => $resource,
            'ip'       => req()->ip(),
        ]);
    }

    public static function suspiciousInput($field, $value, $reason)
    {
        Log::alert('可疑输入检测', [
            'field'  => $field,
            'value'  => substr($value, 0, 200), // 截断长输入
            'reason' => $reason,
            'ip'     => req()->ip(),
            'url'    => req()->fullUrl(),
        ]);
    }
}
```

## 生产环境日志配置建议

```php
<?php
// config/log.php - 生产环境
return [
    'default' => 'app',

    'app' => [
        'handler' => \Monolog\Handler\RotatingFileHandler::class,
        'params'  => [
            var_path('logs/app.log'),
            30,                              // 保留 30 天
            \Monolog\Logger::INFO,           // 仅记录 INFO 及以上
        ],
    ],

    'error' => [
        'handler' => \Monolog\Handler\RotatingFileHandler::class,
        'params'  => [
            var_path('logs/error.log'),
            90,                              // 错误日志保留 90 天
            \Monolog\Logger::ERROR,
        ],
    ],

    // 也可以配置 Syslog、Slack、邮件等处理器
    'critical' => [
        'handler' => \Monolog\Handler\NativeMailerHandler::class,
        'params'  => [
            'admin@example.com',             // 收件人
            '严重错误警报',                   // 邮件主题
            'admin@example.com',             // 发件人
            \Monolog\Logger::CRITICAL,        // 仅 CRITICAL 及以上
        ],
    ],
];
```

## 最佳实践

1. **选择合适的日志级别**：DEBUG 用于开发调试，INFO 用于常规记录，WARNING 用于异常但不影响运行的情况，ERROR 及以上用于需要人工介入的问题
2. **包含足够的上下文**：日志中应包含足够的上下文信息（用户 ID、请求 ID、相关数据等），便于排查问题
3. **避免记录敏感信息**：不要记录密码、Token、身份证号等敏感数据
4. **生产环境关闭 DEBUG**：生产环境将日志级别设为 INFO 或更高，避免产生大量无用日志
5. **日志轮转与清理**：使用 RotatingFileHandler 自动管理日志文件，定期清理过期日志
6. **结构化日志**：使用数组传递上下文数据，而非拼接字符串，便于日志分析工具解析
