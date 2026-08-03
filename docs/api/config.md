# Config

`zap\Config` 配置管理类，基于 ZArray 底层存储，支持点分路径访问、懒加载和深度写入。

**源文件**: `src/Config.php`

## 类概览

```php
namespace zap;

class Config
```

所有方法均为静态方法，无需实例化。

## 方法

### `get(string $name, mixed $default = null): mixed`

读取配置值，支持点分路径。首次访问时自动懒加载对应配置文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | string | 点分键名，如 `database.master.host` |
| `$default` | mixed | 键不存在时的默认值 |

```php
$debug = Config::get('config.debug', false);
$host  = Config::get('database.master.host', '127.0.0.1');
```

### `has(string $name): bool`

检查配置键是否存在（触发懒加载）。

```php
if (Config::has('database.master.host')) {
    // ...
}
```

### `set(string $name, mixed $value): void`

运行时设置配置值，支持点分深度写入。

```php
Config::set('app.debug', false);
Config::set('cache.ttl', 3600);
Config::set('services.payment.gateway.api_key', 'sk_xxx');
```

### `forget(string $name): void`

删除配置项，支持点分路径深度删除。

```php
Config::forget('cache.temp');
Config::forget('database.master.password');
```

### `all(): ZArray`

获取全部已加载的配置（ZArray 实例）。

```php
$all = Config::all();
$dbHost = $all->get('database.master.host');
```

### `load(string $name, ?string $configPath = null): Config`

手动加载配置文件。返回 Config 实例支持链式调用。重复加载自动跳过（幂等）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | string | 配置文件名（不含 .php 后缀） |
| `$configPath` | string\|null | 自定义目录，默认使用 `config_path()` |

```php
// 手动加载
Config::load('database');

// 自定义路径
Config::load('app', BASE_PATH . 'config/');

// 链式调用
Config::load('app', BASE_PATH . 'config/')
      ->load('db', BASE_PATH . 'config/')
      ->load('cache', BASE_PATH . 'config/');
```

### `instance(): ZArray`

获取底层 ZArray 存储实例（通常不需要直接调用，内部用于懒加载和存储）。

### `clearCache(): void`

清空所有已缓存的配置。

### `fresh(): void`

`clearCache()` 的语义化别名。

```php
Config::fresh();
```

## 懒加载机制

首次通过 `get()` / `has()` 访问某个配置命名空间时，自动加载 `config/{name}.php`：

```php
// 首次访问 'database' → 自动加载 config/database.php 并缓存
$host = Config::get('database.master.host');

// 后续访问直接读缓存
$port = Config::get('database.master.port');
```

## 配置文件格式

```php
<?php // config/database.php
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

## 辅助函数对应关系

| 函数 | 等价方法 |
|------|----------|
| `config($key, $default)` | `Config::get($key, $default)` |
| `config_set($key, $value)` | `Config::set($key, $value)` |
| `config_has($key)` | `Config::has($key)` |
| `config_forget($key)` | `Config::forget($key)` |
| `config_all()` | `Config::all()` |
| `config_clear()` | `Config::clearCache()` |
