# MemcacheCache

`zap\cache\MemcacheCache` Memcache / Memcached 缓存驱动。

**源文件**: `src/cache/MemcacheCache.php`

## 构造方法

```php
public function __construct(array $options = [])
```

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `driver` | `'memcached'` | `'memcached'` 或 `'memcache'` |
| `servers` | `[[127.0.0.1, 11211]]` | 服务器列表 |
| `persistent_id` | `'zap_cache'` | Memcached 持久连接 ID |
| `persistent` | `true` | Memcache 长连接开关 |
| `options` | `[]` | Memcached 额外选项 |

### Memcached 扩展

```php
$m = new MemcacheCache([
    'driver'        => 'memcached',
    'persistent_id' => 'zap_cache',
    'servers'       => [
        ['host' => '127.0.0.1', 'port' => 11211, 'weight' => 1],
    ],
]);
```

### Memcache 扩展

```php
$m = new MemcacheCache([
    'driver'  => 'memcache',
    'servers' => [['host' => '127.0.0.1', 'port' => 11211]],
]);
```

## 实例方法

### `getConnection(): \Memcache|\Memcached`

获取原生连接实例。

```php
$conn = $m->getConnection();
// → Memcache 或 Memcached 实例
```

### `getDriver(): string`

获取驱动类型标识。

```php
echo $m->getDriver();  // 'memcached' 或 'memcache'
```

## CacheInterface 方法

```php
$m->set('key', $value, 3600);
$value = $m->get('key');
$m->delete('key');
$m->increment('counter');
$m->clear();
```
