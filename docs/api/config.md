# Config

`zap\Config` 配置文件管理类，支持点分路径访问和懒加载。

**源文件**: `src/Config.php`

## 类概览

```php
namespace zap;

class Config
```

## 方法

### `instance(): ZArray`

获取配置实例（`ZArray` 对象）。

```php
$config = Config::instance();
```

### `get(string $name, $default = null): mixed`

读取配置，支持点分路径。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | string | 配置键名（支持点分） |
| `$default` | mixed | 默认值 |

```php
$debug = Config::get('debug', false);
$host  = Config::get('database.master.host', '127.0.0.1');
$port  = Config::get('database.master.port', 3306);

// 便捷函数
$debug = config('debug', false);
```

### `set(string $name, $value): void`

运行时设置配置。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | string | 配置键名 |
| `$value` | mixed | 配置值 |

```php
Config::set('app.debug', true);
Config::set('cache.status', 'disabled');
```

### `load(string $name): void`

手动加载指定配置文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | string | 配置文件名（不含 .php 后缀） |

```php
Config::load('database');
Config::load('cache');
Config::load('log');
```

### `clearCache(): void`

清除已加载的配置缓存。

```php
Config::clearCache();
```

## 配置文件格式

```php
// config/database.php
return [
    'master' => [
        'driver'   => 'mysql',
        'host'     => '127.0.0.1',
        'port'     => 3306,
        'dbname'   => 'zap_demo',
        'username' => 'root',
        'password' => '',
        'charset'  => 'utf8mb4',
    ],
];
```

## 懒加载机制

首次访问某个配置命名空间时，自动加载对应的配置文件：

```php
// 首次访问 'database' → 自动加载 config/database.php
$dbHost = config('database.master.host');

// 后续访问直接读取缓存，无需重新加载
$dbName = config('database.master.dbname');
```
