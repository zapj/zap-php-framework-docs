# Facades

本页面包含所有门面类的 API 文档。

---

## Facade（基类）

**命名空间**: `zap\facades\Facade`

门面模式的抽象基类，提供静态代理到实际服务实例的机制。所有门面类继承自此基类。

### `getFacadeAccessor(): string`

```php
protected static function getFacadeAccessor(): string
```

获取门面对应的服务容器绑定名称。子类必须实现此方法。

**返回值**: `string` — 服务容器中的键名

---

### `__callStatic(string $method, array $args): mixed`

```php
public static function __callStatic(string $method, array $args): mixed
```

魔术方法，将静态调用转发到实际服务实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$method` | `string` | 方法名 |
| `$args` | `array` | 参数数组 |

**返回值**: `mixed`

---

## Cache 门面

**命名空间**: `zap\facades\Cache`

缓存门面，提供静态方式访问缓存功能。

### `getFacadeAccessor(): string`

```php
protected static function getFacadeAccessor(): string
```

返回 `'cache'`。

---

### 静态方法

```php
Cache::get(string $key, mixed $default = null): mixed
Cache::set(string $key, mixed $value, ?int $ttl = null): bool
Cache::delete(string $key): bool
Cache::has(string $key): bool
Cache::clear(): bool
Cache::increment(string $key, int $value = 1): int|bool
Cache::decrement(string $key, int $value = 1): int|bool
Cache::pull(string $key, mixed $default = null): mixed
Cache::remember(string $key, ?int $ttl, callable $callback): mixed
Cache::getMultiple(iterable $keys, mixed $default = null): array
Cache::setMultiple(iterable $values, ?int $ttl = null): bool
Cache::deleteMultiple(iterable $keys): bool
```

**示例**:
```php
use zap\facades\Cache;

Cache::set('user:1', $user, 3600);
$user = Cache::get('user:1');

$value = Cache::remember('stats', 600, function() {
    return computeStats();
});
```

---

## Date 门面

**命名空间**: `zap\facades\Date`

日期门面，提供静态方式访问日期工具功能。

### `getFacadeAccessor(): string`

```php
protected static function getFacadeAccessor(): string
```

返回 `'date'`。

---

### 静态方法

```php
Date::now(string $format = 'Y-m-d H:i:s'): string
Date::today(string $format = 'Y-m-d'): string
Date::yesterday(string $format = 'Y-m-d'): string
Date::tomorrow(string $format = 'Y-m-d'): string
Date::format(string|int $date, string $format = 'Y-m-d H:i:s'): string
Date::parse(string $date): int
Date::addDays(string $date, int $days, string $format = 'Y-m-d H:i:s'): string
Date::subDays(string $date, int $days, string $format = 'Y-m-d H:i:s'): string
Date::diffInDays(string $date1, string $date2): int
Date::isWeekend(string $date): bool
Date::isPast(string $date): bool
Date::isFuture(string $date): bool
Date::age(string $birthday): int
```

**示例**:
```php
use zap\facades\Date;

echo Date::now();
echo Date::today();
$age = Date::age('1990-05-20');
```

---

## Url 门面

**命名空间**: `zap\facades\Url`

URL 门面，提供静态方式生成 URL。

### `getFacadeAccessor(): string`

```php
protected static function getFacadeAccessor(): string
```

返回 `'url'`。

---

### 静态方法

```php
Url::to(string $path = ''): string
Url::route(string $name, array $params = [], bool $absolute = false): string
Url::asset(string $path): string
Url::current(): string
Url::full(): string
Url::previous(): string
```

#### `to(string $path = ''): string`

生成应用程序 URL。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 路径 |

**返回值**: `string`

**示例**:
```php
Url::to('/user/profile');  // http://localhost/user/profile
Url::to('/about');         // http://localhost/about
```

---

#### `route(string $name, array $params = [], bool $absolute = false): string`

根据路由名称生成 URL。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 路由名称 |
| `$params` | `array` | 路由参数 |
| `$absolute` | `bool` | 是否绝对 URL |

**返回值**: `string`

**示例**:
```php
Url::route('user.show', ['id' => 5]);  // /user/5
Url::route('user.show', ['id' => 5], true); // http://localhost/user/5
```

---

#### `asset(string $path): string`

生成静态资源 URL。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 资源路径 |

**返回值**: `string`

**示例**:
```php
Url::asset('css/app.css');   // /assets/css/app.css
Url::asset('js/app.js');     // /assets/js/app.js
```

---

#### `current(): string`

获取当前请求的 URL（不含查询字符串）。

**返回值**: `string`

---

#### `full(): string`

获取当前请求的完整 URL（含查询字符串）。

**返回值**: `string`

---

#### `previous(): string`

获取上一个页面的 URL（Referer）。

**返回值**: `string`

---

## 使用示例

### Cache 门面

```php
use zap\facades\Cache;

// 基本缓存
Cache::set('settings', $settings, 3600);
$settings = Cache::get('settings', []);

// 缓存不存在时生成
$users = Cache::remember('users:active', 300, function() {
    return User::where('active', true)->get();
});

// 计数器
Cache::increment('visits:today');
$count = Cache::get('visits:today', 0);
```

### Date 门面

```php
use zap\facades\Date;

echo Date::now('Y年m月d日');  // 2024年01月15日
$isExpired = Date::isPast('2024-01-01');
$expiresAt = Date::addDays(Date::now(), 30);
```

### Url 门面

```php
use zap\facades\Url;

// 在模板中
<a href="<?= Url::to('/about') ?>">关于我们</a>
<a href="<?= Url::route('post.show', ['id' => $post['id']]) ?>">阅读更多</a>
<img src="<?= Url::asset('images/logo.png') ?>" alt="Logo">

// 重定向回上一页
header('Location: ' . Url::previous());
```
