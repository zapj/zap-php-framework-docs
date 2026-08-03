# 缓存

## 概述

Zap PHP Framework 的缓存系统支持多种缓存后端：文件缓存（FileCache）、Redis 缓存（RedisCache）和 Memcached 缓存（MemcacheCache）。通过统一的 `CacheInterface` 接口，您可以无缝切换不同的缓存驱动。

## CacheInterface 接口

所有缓存驱动都实现了 `zap\cache\CacheInterface` 接口：

```php
interface CacheInterface
{
    public function get($key, $default = null);
    public function set($key, $value, $ttl = null);
    public function delete($key);
    public function clear();
    public function has($key);
    public function getMultiple($keys, $default = null);
    public function setMultiple($values, $ttl = null);
    public function deleteMultiple($keys);
    public function increment($key, $value = 1);
    public function decrement($key, $value = 1);
    public function pull($key, $default = null);
}
```

## Cache 门面

框架提供了 `Cache` 门面，会根据 `config/cache.php` 中的 `default` 配置自动创建对应的缓存驱动实例：

```php
use zap\facades\Cache;

// 无需手动创建实例，直接使用
Cache::set('key', 'value');
$value = Cache::get('key');
```

门面内部的工作流程：

1. 读取 `config('cache.default')` 获取默认驱动名（如 `file`、`redis`、`memcached`）
2. 从 `config('cache.驱动名')` 读取对应驱动的配置参数
3. 创建对应的驱动实例并缓存复用

## 文件缓存 (FileCache)

### 配置

```php
// config/cache.php
return [
    'default' => 'file',
    'status'  => 'enabled',

    'file' => [
        'path' => var_path('cache'), // 缓存文件存放目录
    ],
];
```

### 使用

```php
use zap\cache\FileCache;

// 手动创建实例
$cache = new FileCache(['path' => var_path('cache')]);

// 或使用门面（自动根据配置创建）
use zap\facades\Cache;

// 设置缓存（TTL 单位：秒）
Cache::set('user:1', ['name' => '张三', 'email' => 'zhang@example.com'], 3600);

// 读取缓存
$user = Cache::get('user:1');
// ['name' => '张三', 'email' => 'zhang@example.com']

// 带默认值
$user = Cache::get('user:999', ['name' => '未知用户']);

// 永久存储
Cache::set('app.config', $config);

// 检查是否存在
if (Cache::has('user:1')) {
    // 缓存存在
}

// 删除缓存
Cache::delete('user:1');

// 清空所有缓存
Cache::clear();
```

文件缓存将数据序列化后存储在 `var/cache/` 目录中，文件名经过哈希处理。

## Redis 缓存 (RedisCache)

### 配置

```php
// config/cache.php
return [
    'default' => 'redis',

    'redis' => [
        'host'     => '127.0.0.1',
        'port'     => 6379,
        'password' => null,       // Redis 密码（可选）
        'database' => 0,          // 数据库编号
        'prefix'   => 'zap_cache:', // 键前缀
    ],
];
```

### 使用（phpredis 扩展）

```php
use zap\cache\RedisCache;

// 手动创建实例
$cache = new RedisCache([
    'host'     => '127.0.0.1',
    'port'     => 6379,
    'password' => null,
    'database' => 0,
    'prefix'   => 'zap_cache:',
]);

// 基本操作
$cache->set('article:42', $articleData, 7200);  // 2 小时过期
$article = $cache->get('article:42');

// 使用门面
Cache::set('config:site', $siteConfig, 86400); // 24 小时过期
$config = Cache::get('config:site');
```

### 使用（Predis 客户端）

如果使用 Predis（纯 PHP 实现的 Redis 客户端），配置方式类似：

```php
$cache = new RedisCache([
    'client'  => 'predis',
    'scheme'  => 'tcp',
    'host'    => '127.0.0.1',
    'port'    => 6379,
    'password'=> null,
    'database'=> 0,
    'prefix'  => 'zap_cache:',
]);
```

RedisCache 支持 phpredis 扩展和 Predis 库两种方式，会自动检测可用的客户端。

## Memcached 缓存 (MemcacheCache)

### 配置

```php
// config/cache.php
return [
    'default' => 'memcached',

    'memcached' => [
        // 驱动类型：'memcached'（使用 Memcached 扩展）或 'memcache'（使用 Memcache 扩展）
        'driver'  => 'memcached',

        'servers' => [
            ['host' => '127.0.0.1', 'port' => 11211, 'weight' => 100],
            ['host' => '192.168.1.10', 'port' => 11211, 'weight' => 50],
        ],

        'prefix' => 'zap_cache:',
    ],
];
```

### 使用

```php
use zap\cache\MemcacheCache;

// 手动创建实例
$cache = new MemcacheCache([
    'driver'  => 'memcached',
    'servers' => [
        ['host' => '127.0.0.1', 'port' => 11211],
    ],
    'prefix' => 'zap_cache:',
]);

// 基本操作
$cache->set('hot_posts', $posts, 300); // 5 分钟过期
$posts = $cache->get('hot_posts');
```

MemcacheCache 同时支持 `Memcache` 和 `Memcached` 两种 PHP 扩展，通过 `driver` 参数指定使用哪种。

## 缓存操作详解

### get() - 读取缓存

```php
// 读取
$value = Cache::get('key');

// 带默认值
$value = Cache::get('key', '默认值');

// 缓存不存在时执行回调
$value = Cache::get('key', function() {
    return DB::table('settings')->getAll();
});
```

### set() - 设置缓存

```php
// 设置缓存（TTL 单位：秒）
Cache::set('key', 'value', 3600);

// 永久存储（不传 TTL 或传 null）
Cache::set('app.config', $config);

// 设置带过期时间
Cache::set('session:abc123', $sessionData, 1800); // 30 分钟
Cache::set('daily_stats', $stats, 86400);          // 24 小时
```

### delete() - 删除缓存

```php
// 删除单个键
Cache::delete('user:1');
Cache::delete('session:abc123');
```

### clear() - 清空所有缓存

```php
// 清空当前驱动中的所有缓存
Cache::clear();

// 注意：对于 Redis，这会执行 FLUSHDB（仅清空当前数据库）
// 对于文件缓存，会删除缓存目录中的所有文件
```

### has() - 检查键是否存在

```php
if (Cache::has('user:1')) {
    $user = Cache::get('user:1');
} else {
    $user = DB::table('users')->find(1);
    Cache::set('user:1', $user, 3600);
}
```

### getMultiple() - 批量读取

```php
// 一次读取多个键
$values = Cache::getMultiple(['user:1', 'user:2', 'user:3']);

// 带默认值
$values = Cache::getMultiple(['user:1', 'user:2', 'user:999'], '未找到');
// ['user:1' => [...], 'user:2' => [...], 'user:999' => '未找到']
```

### setMultiple() - 批量设置

```php
// 一次设置多个键
Cache::setMultiple([
    'user:1' => ['name' => '张三'],
    'user:2' => ['name' => '李四'],
    'user:3' => ['name' => '王五'],
], 3600);

// 设置后验证
$users = Cache::getMultiple(['user:1', 'user:2', 'user:3']);
```

### deleteMultiple() - 批量删除

```php
// 一次删除多个键
Cache::deleteMultiple(['user:1', 'user:2', 'user:3']);

// 删除匹配模式的键（Redis 专属）
Cache::deleteMultiple(['session:*', 'temp:*']);
```

### increment() / decrement() - 原子增减

```php
// 自增
Cache::set('page_views', 0);
Cache::increment('page_views');     // 1
Cache::increment('page_views', 5);  // 6

// 自减
Cache::set('stock', 100);
Cache::decrement('stock');          // 99
Cache::decrement('stock', 10);      // 89

// 应用场景：API 速率限制
$key = 'rate_limit:' . req()->ip();
$count = Cache::increment($key);
if ($count === 1) {
    Cache::set($key, 1, 60); // 首次设置，60 秒过期
}
if ($count > 100) {
    return response()->json(['error' => '请求过于频繁'], 429)->send();
}
```

### pull() - 获取并删除

```php
// 读取并删除缓存（一次性操作）
$value = Cache::pull('processing_job');

// 带默认值
$value = Cache::pull('processing_job', '默认值');

// 典型用途：处理一次性任务
$task = Cache::pull('queue:task');
if ($task) {
    processTask($task);
}
```

## 缓存策略实践

### 缓存穿透保护（Cache-Aside 模式）

```php
function getUser($id)
{
    $cacheKey = "user:{$id}";

    // 1. 先查缓存
    $user = Cache::get($cacheKey);

    if ($user !== null) {
        return $user;
    }

    // 2. 缓存未命中，查数据库
    $user = DB::table('users')->find($id);

    // 3. 写入缓存（即使是 null 也缓存较短时间，防止缓存穿透）
    if ($user) {
        Cache::set($cacheKey, $user, 3600);
    } else {
        Cache::set($cacheKey, '__NULL__', 60); // 缓存空值
    }

    return $user;
}
```

### 热门数据预热

```php
// 定时任务中预热热门数据
function warmupCache()
{
    // 热门文章列表
    $hotPosts = DB::table('posts')
        ->where('status', 'published')
        ->orderBy('views', 'DESC')
        ->limit(50)
        ->getAll();

    Cache::set('hot_posts', $hotPosts, 600); // 10 分钟

    // 网站配置
    $settings = DB::table('settings')->getAll();
    $config = [];
    foreach ($settings as $row) {
        $config[$row['key']] = $row['value'];
    }
    Cache::set('site_config', $config, 3600);

    // 分类列表
    $categories = DB::table('categories')
        ->where('status', 'active')
        ->orderBy('sort', 'ASC')
        ->getAll();

    Cache::set('categories', $categories, 1800);
}
```

### 缓存标签模式（通过前缀模拟）

```php
// 使用前缀模拟标签
function clearUserCache($userId)
{
    Cache::delete("user:{$userId}");
    Cache::delete("user:{$userId}:posts");
    Cache::delete("user:{$userId}:profile");
    Cache::delete("user:{$userId}:stats");
}

// 更新用户时清除相关缓存
function updateUser($id, $data)
{
    DB::table('users')->where('id', $id)->update($data);
    clearUserCache($id);
}
```

### 页面级缓存

```php
public function home()
{
    $cacheKey = 'page:home:' . md5(req()->fullUrl());

    // 尝试从缓存获取页面内容
    $html = Cache::get($cacheKey);

    if ($html) {
        return response($html)->html()->send();
    }

    // 生成页面
    $html = View::render('home.index', [
        'posts'      => getLatestPosts(),
        'categories' => getCategories(),
    ], true);

    // 缓存 5 分钟
    Cache::set($cacheKey, $html, 300);

    return response($html)->html()->send();
}
```

## 缓存驱动对比

| 特性 | 文件缓存 | Redis 缓存 | Memcached 缓存 |
|------|----------|------------|----------------|
| 速度 | 较慢 | 极快 | 很快 |
| 持久化 | 是 | 可配置 | 否（重启丢失） |
| 分布式 | 否 | 是 | 是 |
| 数据类型 | 字符串 | 丰富 | 简单 |
| 安装复杂度 | 无需额外扩展 | 需 Redis 服务 + phpredis | 需 Memcached 服务 |
| 适用场景 | 开发环境、小型应用 | 生产环境、高并发 | 简单键值缓存 |

## 最佳实践

1. **设置合理的 TTL**：避免缓存永不过期导致内存/磁盘占满
2. **键名规范化**：使用统一的命名规范，如 `资源类型:标识符:子资源`
3. **防止缓存雪崩**：为不同的缓存键设置随机偏移的过期时间
4. **防止缓存穿透**：对不存在的值也进行短暂缓存
5. **监控缓存命中率**：定期检查缓存效果，优化缓存策略
6. **生产环境推荐 Redis**：性能优异，功能丰富，支持持久化和集群
