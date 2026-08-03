# RedisCache

`zap\cache\RedisCache` Redis 缓存驱动，支持 phpredis 和 Predis 客户端。

**源文件**: `src/cache/RedisCache.php`

## 构造方法

```php
public function __construct(array $options = [])
```

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `params` | `[127.0.0.1, 6379]` | Redis 连接参数 |
| `client` | `'phpredis'` | 客户端：`'phpredis'` 或 `'predis'` |

```php
// phpredis 扩展
$redis = new RedisCache([
    'params' => ['127.0.0.1', 6379, 2.5, '', 0, 'tcp://'],
]);

// Predis
$redis = new RedisCache([
    'params' => ['127.0.0.1', 6379],
    'client' => 'predis',
]);
```

## 方法

实现全部 `CacheInterface` 方法：

```php
$redis->set('key', 'value', 3600);
$value = $redis->get('key');
$redis->delete('key');
$redis->increment('counter', 5);
$redis->clear();
```
