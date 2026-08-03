# FileCache

`zap\cache\FileCache` 文件缓存驱动。

**源文件**: `src/cache/FileCache.php`

## 类概览

```php
namespace zap\cache;

class FileCache implements CacheInterface
```

## 构造方法

```php
public function __construct(array $options = [])
```

| 选项 | 说明 |
|------|------|
| `cacheDir` | 缓存目录路径 |
| `isCache` | 是否启用缓存（`'enabled'` / `'disabled'`） |

```php
$cache = new FileCache([
    'cacheDir' => VAR_PATH . '/cache',
    'isCache'  => 'enabled',
]);
```

## 方法

实现全部 `CacheInterface` 方法。数据以 PHP 序列化形式存储在文件系统中。

- `get($key, $default, $ttl)` — 读取并反序列化
- `set($key, $value, $ttl)` — 序列化并写入
- `delete($key)` — 删除缓存文件
- `clear()` — 清空缓存目录
- `has($key)` — 检查文件是否存在且未过期
- `increment($key, $initValue)` — 计数器自增
- `decrement($key, $initValue)` — 计数器自减
- `pull($key, $default)` — 取值后删除
- `getMultiple($keys, $default, $ttl)` — 批量读取
- `setMultiple($values, $ttl)` — 批量写入
- `deleteMultiple($keys)` — 批量删除

## 示例

```php
$cache = new FileCache(['cacheDir' => VAR_PATH . '/cache']);

$cache->set('user:42', ['name' => 'John'], 3600);
$data = $cache->get('user:42');

$cache->increment('counter');
$cache->clear();
```
