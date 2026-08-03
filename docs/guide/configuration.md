# 配置

ZAP 框架使用 PHP 文件作为配置格式，基于 ZArray 存储，支持点分路径访问、懒加载和深度嵌套。

## 配置文件结构

```
project/
└── config/
    ├── config.php         # 应用基础配置
    ├── database.php       # 数据库连接配置
    ├── cache.php          # 缓存配置
    └── custom.php         # 自定义配置
```

## 读取配置

```php
// 自动懒加载 config/config.php
$debug = config('config.debug', false);

// 自动懒加载 config/database.php
$host = config('database.master.host', '127.0.0.1');
$port = config('database.master.port', 3306);
```

## 判断是否存在

```php
if (config_has('database.master.host')) {
    // 配置存在
}

if (Config::has('app.custom')) {
    // ...
}
```

## 运行时写入

```php
// 设置配置
config_set('app.debug', false);
Config::set('services.payment.api_key', 'sk_xxx');

// config() 函数也可写（第二个参数不为 null 时执行 set）
config('app.name', 'MyApp');
```

## 删除配置

```php
Config::forget('cache.temp');
config_forget('old.legacy.key');
```

## 获取全部

```php
$all = Config::all();
$all = config_all();  // 便捷函数
```

## 手动加载

```php
// 单文件加载
Config::load('database');

// 指定路径
Config::load('app', BASE_PATH . 'config/');

// 链式加载
Config::load('app', BASE_PATH . 'config/')
      ->load('db', BASE_PATH . 'config/')
      ->load('cache', BASE_PATH . 'config/');
```

## 缓存管理

```php
// 清空全部缓存
Config::clearCache();
Config::fresh();       // 语义别名
config_clear();        // 便捷函数
```

## 懒加载机制

配置采用懒加载：首次通过 `config()` 或 `Config::get()` / `Config::has()` 访问时，自动加载对应的 PHP 文件并缓存。

```php
// 首次访问 'database' → include config/database.php 并缓存
$host = config('database.master.host');

// 后续直接读缓存
$name = config('database.master.dbname');
```

## 配置文件示例

```php
<?php // config/config.php
return [
    'debug'    => true,
    'charset'  => 'UTF-8',
    'timezone' => 'Asia/Shanghai',
    'lang'     => 'zh_CN',
];
```

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
    'slave' => [
        'host' => '127.0.0.1',
        'port' => 3307,
    ],
];
```

## 多环境配置

推荐在 `config/env.php` 中根据服务器环境定义常量：

```php
<?php // config/env.php
switch ($_SERVER['HTTP_HOST'] ?? '') {
    case 'dev.example.com':
        define('ENVIRONMENT', 'development');
        break;
    case 'staging.example.com':
        define('ENVIRONMENT', 'staging');
        break;
    default:
        define('ENVIRONMENT', 'production');
}

// 根据环境动态设置
Config::set('config.debug', ENVIRONMENT !== 'production');
```

## 辅助函数速查

| 函数 | 等价方法 | 说明 |
|------|----------|------|
| `config($key, $default)` | `Config::get()` / `Config::set()` | 读/写 |
| `config_set($key, $value)` | `Config::set()` | 写入 |
| `config_has($key)` | `Config::has()` | 判断存在 |
| `config_forget($key)` | `Config::forget()` | 删除 |
| `config_all()` | `Config::all()` | 获取全部 |
| `config_clear()` | `Config::clearCache()` | 清空缓存 |
