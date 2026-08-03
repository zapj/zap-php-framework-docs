# CacheInterface

`zap\cache\CacheInterface` 缓存统一接口，所有缓存驱动必须实现。

**源文件**: `src/cache/CacheInterface.php`

## 接口定义

```php
namespace zap\cache;

interface CacheInterface
{
    public function get($key, $default = null, $ttl = null);
    public function set($key, $value, $ttl = null): bool;
    public function delete($key): bool;
    public function clear(): bool;
    public function getMultiple($keys, $default = null, $ttl = null): array;
    public function setMultiple($values, $ttl = null): void;
    public function deleteMultiple($keys): bool;
    public function has($key): bool;
    public function increment($key, $initValue = null);
    public function decrement($key, $initValue = null);
    public function pull($key, $default = null);
}
```

## 方法说明

| 方法 | 返回 | 说明 |
|------|------|------|
| `get($key, $default, $ttl)` | mixed | 读取缓存，未命中返回 `$default`。若 `$default` 为 callable 则执行并将结果缓存 |
| `set($key, $value, $ttl)` | bool | 写入缓存，`$ttl` 为过期秒数 |
| `delete($key)` | bool | 删除键 |
| `clear()` | bool | 清空全部 |
| `getMultiple($keys, $default, $ttl)` | array | 批量读取 |
| `setMultiple($values, $ttl)` | void | 批量写入 |
| `deleteMultiple($keys)` | bool | 批量删除 |
| `has($key)` | bool | 检查是否存在 |
| `increment($key, $initValue)` | int\|float | 自增 |
| `decrement($key, $initValue)` | int\|float | 自减 |
| `pull($key, $default)` | mixed | 取值后删除 |

## 实现类

| 类 | 驱动 | 配置 |
|----|------|------|
| `FileCache` | 文件 | `config('cache.file')` |
| `RedisCache` | Redis (phpredis/Predis) | `config('cache.redis')` |
| `MemcacheCache` | Memcache / Memcached | `config('cache.memcached')` |

## 通过 Facade 使用

```php
use zap\facades\Cache;

Cache::set('key', 'value', 3600);
$value = Cache::get('key', 'default');
Cache::delete('key');
```
