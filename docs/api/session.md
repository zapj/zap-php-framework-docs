# Session

`zap\http\Session` 会话管理类，支持点分路径、Flash 消息和计数器操作。

**源文件**: `src/http/Session.php`

## 类概览

```php
namespace zap\http;

class Session
```

## 基本读写

### `get(string $key, $default = null): mixed`

读取会话值，支持点分路径。

```php
$session = new Session();

$userId = $session->get('user_id');
$name   = $session->get('user.name', 'Guest');
$email  = $session->get('user.email');
```

### `set(string $key, $value): void`

写入会话值。

```php
$session->set('user_id', 42);
$session->set('user.name', 'John');
$session->set('user.roles', ['admin', 'editor']);
```

### `has(string $key): bool`

检查键是否存在。

```php
if ($session->has('user_id')) {
    // 已登录
}
```

### `forget(string ...$keys): void`

删除指定键。

```php
$session->forget('temp_key');
$session->forget('a', 'b', 'c');
```

### `pull(string $key, $default = null): mixed`

取值后立即删除。

```php
$temp = $session->pull('one_time_key');
```

## 数组与计数器

### `push(string $key, $value): void`

向数组追加元素。

```php
$session->set('cart', ['item_1']);
$session->push('cart', 'item_2');
// ['item_1', 'item_2']
```

### `increment(string $key, int $amount = 1): int`

自增。

```php
$session->set('views', 0);
$session->increment('views');      // 1
$session->increment('views', 10);  // 11
```

### `decrement(string $key, int $amount = 1): int`

自减。

```php
$session->decrement('views');      // 10
$session->decrement('views', 5);   // 5
```

## 批量操作

### `all(): array`

获取全部会话数据。

### `only(array $keys): array`

仅获取指定键。

```php
$userData = $session->only(['user_id', 'user.name']);
```

## Flash 消息

### `flash(string $key, $value = null): void`

设置 Flash 消息，下一次请求后自动删除。

```php
$session->flash('success', '操作成功！');
$session->flash('error', '请检查输入');
```

### `hasFlash(string $key, string $type = 'new'): bool`

检查 Flash 消息是否存在。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | string | 键名 |
| `$type` | string | 类型：`'new'` / `'old'` |

### `clearFlash(?string $type = null): Session`

清除 Flash 消息。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$type` | string\|null | `'new'`, `'old'`, 或 `null` 清除全部 |

## 安全

### `regenerate(): bool`

重新生成 Session ID（登录后调用防会话固定）。

```php
$session->set('user_id', $user->id);
$session->regenerate();
```

### `destroy(): bool`

销毁会话（清空 `$_SESSION` + 删除 cookie）。
