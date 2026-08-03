# 配置

## 概述

Zap PHP Framework 的配置系统基于 PHP 文件，所有配置文件存放在 `config/` 目录中。配置系统提供了简单易用的点分路径（dot notation）访问方式，支持自动加载和缓存清除。

## 配置文件

Zap 框架默认包含以下配置文件：

| 文件 | 用途 |
|------|------|
| `config.php` | 主配置（调试模式、日志开关、主题设置等） |
| `cache.php` | 缓存驱动配置 |
| `database.php` | 数据库连接配置 |
| `log.php` | 日志通道与 Monolog 处理器配置 |

## 读取配置

### Config::get() 与 config() 辅助函数

使用点分路径（dot notation）访问嵌套的配置项：

```php
// 读取 debug 模式
$debug = config('config.debug', false);

// 读取默认缓存驱动
$cacheDriver = config('cache.default', 'file');

// 读取数据库主库主机
$host = config('database.master.host');

// 读取 Redis 连接参数
$redisHost = config('cache.redis.host', '127.0.0.1');
$redisPort = config('cache.redis.port', 6379);

// 读取日志配置
$logHandler = config('log.app.handler');
```

第二个参数为默认值，当配置项不存在时返回该值。

### 使用 Config 静态类

```php
use zap\Config;

// 读取配置
$value = Config::get('database.master.dsn');

// 带默认值
$charset = Config::get('database.master.charset', 'utf8mb4');
```

## 设置配置

### Config::set() 方法

```php
use zap\Config;

// 设置单个配置值
Config::set('app.name', 'My Application');

// 设置嵌套配置
Config::set('cache.file.path', '/custom/cache/path');

// 批量设置
Config::set('database.connections.mysql_read', [
    'host' => '192.168.1.100',
    'port' => 3306,
    'dbname' => 'myapp',
]);
```

### config_set() 辅助函数

```php
// 运行时修改配置
config_set('config.debug', false);
config_set('cache.default', 'redis');
```

## 自动加载机制

Config 类采用懒加载机制。当你首次通过 `config()` 或 `Config::get()` 访问某个配置文件时，框架会自动加载对应的 PHP 配置文件：

```php
// 首次访问 cache 配置时，自动加载 config/cache.php
$driver = config('cache.default'); // 触发自动加载 config/cache.php

// 首次访问 database 配置时，自动加载 config/database.php
$dsn = config('database.master.dsn'); // 触发自动加载 config/database.php
```

自动加载的工作流程：

1. 调用 `config('database.master.host')`
2. 将点分路径拆分为 `['database', 'master', 'host']`
3. 检查第一个键 `database` 是否已加载
4. 若未加载，查找并加载 `config/database.php`
5. 从已加载的数据中读取 `master.host`

## 清除配置缓存

```php
use zap\Config;

// 清除所有已加载的配置缓存
Config::clearCache();
```

调用后，下次访问配置时将重新从文件加载。这在以下场景中很有用：

- 测试环境中切换配置
- 动态修改配置文件后需要重新加载
- 长时间运行的后台进程刷新配置

## 配置文件详解

### config.php - 主配置

```php
<?php
return [
    // 调试模式（生产环境请设为 false）
    'debug' => true,

    // 是否启用日志
    'log' => true,

    // 日志开关（与 log 配合使用）
    'log_enabled' => true,

    // 默认主题
    'theme' => false, // false 表示使用 app/views 目录

    // 应用名称
    'app_name' => 'Zap App',
];
```

### cache.php - 缓存配置

```php
<?php
return [
    // 默认缓存驱动：file / redis / memcached / memcache
    'default' => 'file',

    // 缓存状态：enabled / disabled
    'status' => 'enabled',

    // 文件缓存
    'file' => [
        'path' => VAR_PATH . '/cache',
    ],

    // Redis 缓存
    'redis' => [
        'host'     => '127.0.0.1',
        'port'     => 6379,
        'password' => null,
        'database' => 0,
        'prefix'   => 'zap_cache:',
    ],

    // Memcached 缓存
    'memcached' => [
        'driver'  => 'memcached', // memcached 或 memcache
        'servers' => [
            ['host' => '127.0.0.1', 'port' => 11211, 'weight' => 100],
        ],
    ],
];
```

### database.php - 数据库配置

```php
<?php
return [
    // 默认连接
    'default' => 'master',

    'connections' => [
        // 主库（读写）
        'master' => [
            'driver'   => 'mysql',
            'host'     => '127.0.0.1',
            'port'     => 3306,
            'dbname'   => 'zap_db',
            'username' => 'root',
            'password' => '',
            'charset'  => 'utf8mb4',
            'options'  => [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8mb4'",
            ],
        ],

        // 从库（只读）
        'slave' => [
            'driver'   => 'mysql',
            'host'     => '192.168.1.101',
            'port'     => 3306,
            'dbname'   => 'zap_db',
            'username' => 'readonly',
            'password' => 'readonly_pass',
            'charset'  => 'utf8mb4',
            'options'  => [],
        ],
    ],
];
```

### log.php - 日志配置

```php
<?php
return [
    // 默认日志通道
    'default' => 'app',

    'app' => [
        // Monolog 处理器类
        'handler' => \Monolog\Handler\StreamHandler::class,
        // 处理器构造参数
        'params' => [
            VAR_PATH . '/logs/app.log',
            \Monolog\Logger::DEBUG,
        ],
    ],

    'error' => [
        'handler' => \Monolog\Handler\StreamHandler::class,
        'params' => [
            VAR_PATH . '/logs/error.log',
            \Monolog\Logger::ERROR,
        ],
    ],

    // 支持多个通道，每个通道可配置不同的处理器
    'database' => [
        'handler' => \Monolog\Handler\RotatingFileHandler::class,
        'params' => [
            VAR_PATH . '/logs/database.log',
            30, // 保留 30 天
            \Monolog\Logger::DEBUG,
        ],
    ],
];
```

## 在控制器中使用配置

```php
<?php

namespace App\Controllers;

use zap\http\Controller;

class SettingController extends Controller
{
    public function index()
    {
        // 读取应用名称
        $appName = config('config.app_name', 'Zap App');

        // 检查是否开启调试模式
        $debug = config('config.debug', false);

        return $this->json([
            'app_name' => $appName,
            'debug'    => $debug,
        ]);
    }
}
```

## 最佳实践

1. **敏感信息不要提交到版本控制**：将数据库密码、API 密钥等放入 `.env` 文件或环境变量，在配置文件中引用
2. **按环境分离配置**：可以为开发、测试、生产环境创建不同的配置文件
3. **使用有意义的键名**：使用清晰、一致的键名，便于团队协作
4. **善用默认值**：调用 `config()` 时始终提供合理的默认值，增强代码健壮性
