# Session

`zap\http\Session` 会话管理类，支持静态代理调用、会话配置、点分路径、Flash 消息、CSRF Token、表单旧值、计数器等。

**源文件**: `src/http/Session.php`

## 类概览

```php
namespace zap\http;

class Session
```

## 静态代理

Session 支持 `__callStatic`，所有实例方法均可直接通过 `Session::methodName()` 静态调用：

```php
Session::get('key');
Session::set('key', 'value');
Session::flash('success', '消息');
```

## 单例管理

### `getInstance(): self`

获取 Session 单例。

```php
$session = Session::getInstance();
```

### `resetInstance(): void`

重置单例（主要用于单元测试）。

```php
Session::resetInstance();
```

## 配置与启动

### `configure(array $options = []): self`

在会话启动前设置配置项。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$options` | array | 键值对配置数组 |

```php
Session::configure([
    'name'            => 'MY_SESSION',
    'cookie_lifetime' => 86400,
    'cookie_secure'   => true,
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
    'gc_maxlifetime'  => 3600,
]);
```

### `getConfig(): array`

获取当前会话配置。

```php
$config = Session::getConfig();
```

### `start(array $options = []): self`

启动会话。可传入运行时配置选项。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$options` | array | 可选的运行时配置，会合并到默认配置 |

```php
Session::start(['cookie_lifetime' => 3600]);
```

### `isStarted(): bool`

检查会话是否已启动。

```php
if (Session::isStarted()) { /* ... */ }
```

## 基本读写

### `get(string $key, $default = null): mixed`

读取会话值，支持点分路径。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | string | 键名，支持 `user.name` 点号语法 |
| `$default` | mixed | 键不存在时的默认值 |

```php
$userId = Session::get('user_id');
$name   = Session::get('user.name', 'Guest');
$email  = Session::get('user.profile.email');
```

### `set(string $key, $value): self`

写入会话值，返回 `$this` 支持链式调用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | string | 键名，支持点分路径 |
| `$value` | mixed | 要存储的值 |

```php
Session::set('user_id', 42);
Session::set('user.name', 'John');
Session::set('user.roles', ['admin', 'editor']);
```

### `has(string $key): bool`

检查键是否存在（与值真假无关）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | string | 键名，支持点分路径 |

```php
if (Session::has('user_id')) {
    // 已登录
}
```

### `forget($keys): self`

删除指定键。接受字符串或数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$keys` | string\|array | 单个键名或键名数组 |

```php
Session::forget('temp_key');
Session::forget(['key1', 'key2']);
```

### `pull(string $key, $default = null): mixed`

取值后立即删除（pop 语义）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | string | 键名 |
| `$default` | mixed | 键不存在时的默认值 |

```php
$temp = Session::pull('one_time_key', '默认值');
```

## 批量操作

### `all(): array`

获取全部会话数据（含系统内部键）。

```php
$all = Session::all();
```

### `only(array $keys): array`

仅获取指定键。**不存在的键会被跳过**（与旧版不同，不会返回 `null` 值）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$keys` | array | 键名数组 |

```php
$data = Session::only(['user_id', 'user.name', 'nonexistent']);
// ['user_id' => 42, 'user.name' => 'John']  — nonexistent 被跳过
```

### `except(array $keys): array`

排除指定键，返回其余所有数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$keys` | array | 要排除的键名数组 |

```php
$data = Session::except(['__zap_flash__', '__zap_csrf__']);
```

### `count(): int`

用户数据条数（不含系统内部键 `__zap_flash__` / `__zap_csrf__` / 活动时间）。

```php
$itemCount = Session::count();
```

### `isEmpty(): bool`

用户数据是否为空。

```php
if (Session::isEmpty()) { /* 无用户数据 */ }
```

## 数组与计数器

### `push(string $key, $value): self`

向数组追加元素。如果目标值不是数组，会先初始化为空数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | string | 键名 |
| `$value` | mixed | 要追加的值 |

```php
Session::set('cart', ['item_1']);
Session::push('cart', 'item_2');
// ['item_1', 'item_2']
```

### `increment(string $key, int $amount = 1): self`

自增。如果键不存在则从 0 开始。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | string | 键名 |
| `$amount` | int | 增量，默认 1 |

```php
Session::set('views', 0);
Session::increment('views');      // 1
Session::increment('views', 10);  // 11
```

### `decrement(string $key, int $amount = 1): self`

自减。内部调用 `increment($key, -$amount)`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | string | 键名 |
| `$amount` | int | 减量，默认 1 |

```php
Session::decrement('views');     // 10
Session::decrement('views', 5);  // 5
```

## Session 标识与活动

### `getId(): string`

获取当前 Session ID。

```php
$sid = Session::getId();
```

### `setId(string $id): self`

设置自定义 Session ID。**必须在 `start()` 之前调用**，否则无效果。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | string | 自定义 Session ID |

```php
$customId = hash('sha256', $userId . $ip . 'salt');
Session::setId($customId);
Session::start();
```

### `regenerate(bool $deleteOld = false): self`

重新生成 Session ID，防止会话固定攻击。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$deleteOld` | bool | 是否删除旧 Session 文件，默认 `false` |

```php
// 登录成功后
Session::regenerate(true);
```

### `lastActivity(): ?int`

获取最后活动时间（Unix 时间戳）。会话未启动或未启用追踪时返回 `null`。

```php
$lastSeen = Session::lastActivity();
echo date('Y-m-d H:i:s', $lastSeen);
```

### `age(): ?int`

获取会话存活时长（秒）。

```php
$seconds = Session::age();
$minutes = round($seconds / 60);
```

## CSRF Token

### `token(): string`

获取当前 CSRF Token。若 Token 不存在，自动生成。

```php
$csrf = Session::token();
// 在表单中: <input type="hidden" name="_token" value="<?= esc($csrf) ?>">
```

### `regenerateToken(bool $force = false): string`

重新生成 CSRF Token。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$force` | bool | 是否强制再生。`false` 时仅在 Token 不存在时生成，默认 `false` |

```php
// 登录后强制再生
Session::regenerateToken(true);

// 每次渲染表单时确保 Token 存在
$csrf = Session::regenerateToken();
```

### `validateToken(string $token): bool`

验证 CSRF Token 是否有效。使用 `hash_equals()` 防止时序攻击。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$token` | string | 用户提交的 Token |

返回值：`true` 有效，`false` 无效或未初始化。

```php
if (!Session::validateToken($request->input('_token', ''))) {
    Session::flash('error', '安全验证失败，请刷新重试');
    return response()->redirect('/');
}
```

## Flash 消息

### `flash(string $type, string $message): self`

写入 Flash 消息（一次性，读取后自动清除）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$type` | string | 消息类型，如 `success` / `error` / `warning` / `info` |
| `$message` | string | 消息文本 |

```php
Session::flash('success', '操作成功！');
Session::flash('error', '参数验证失败');
```

### `hasFlash(?string $type = null): bool`

检查是否有 Flash 消息。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$type` | string\|null | 指定类型检查，`null`=检查是否有任意消息 |

```php
if (Session::hasFlash()) {
    // 有待显示的 Flash 消息
}
if (Session::hasFlash('error')) {
    // 有错误消息
}
```

### `getFlash($types = null): array`

读取并清除 Flash 消息（原始格式，含时间戳）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$types` | string\|array\|null | 消息类型，`null`=所有类型 |

返回值格式：

```php
[
    'success' => [
        ['message' => '操作成功！', 'timestamp' => 1690000000],
    ],
    'error'   => [
        ['message' => '验证失败', 'timestamp' => 1690000001],
    ],
]
```

```php
$flash = Session::getFlash();
$flash = Session::getFlash('success');           // 仅取 success
$flash = Session::getFlash(['success', 'info']); // 取多种
```

### `getFlashMessages($types = null): array`

读取并清除 Flash 消息（纯文本格式，仅返回 `message` 字符串）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$types` | string\|array\|null | 消息类型 |

返回值格式：

```php
[
    'success' => ['操作成功！', '欢迎邮件已发送'],
    'error'   => ['验证失败'],
]
```

```php
$messages = Session::getFlashMessages();
foreach ($messages['success'] ?? [] as $msg) {
    echo "<div class='alert alert-success'>$msg</div>";
}
```

### `clearFlash($types = null): self`

手动清除 Flash 消息。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$types` | string\|array\|null | `null`=清除全部，字符串=指定类型，数组=多种类型 |

```php
Session::clearFlash();                // 清除全部
Session::clearFlash('error');         // 清除 error
Session::clearFlash(['error', 'info']);
```

## 表单旧值

### `flashInput(?array $data = null): self`

保存输入数据到 Flash，供下一个请求读取。通常在验证失败的重定向前调用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | array\|null | 输入数据；为 `null` 时自动读取 `$_POST` |

```php
// 手动指定
Session::flashInput($request->only(['name', 'email']));

// 保存整个 $_POST
Session::flashInput();
```

### `old(?string $key = null, $default = null): mixed`

读取上一次请求的旧输入值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | string\|null | 字段名；`null`=返回全部旧值 |
| `$default` | mixed | 字段不存在时的默认值 |

```php
// 视图模板中
<input value="<?= esc(Session::old('name', '')) ?>">
<input value="<?= esc(Session::old('email', '')) ?>">

// 获取全部旧值
$all = Session::old();
```

## 销毁

### `destroy(): void`

完全销毁会话（清空 `$_SESSION` + 调用 `session_destroy()`）。

```php
Session::destroy();  // 登出时使用
```

## 系统常量

| 常量 | 值 | 说明 |
|------|-----|------|
| `FLASH_MESSAGE_KEY` | `__zap_flash__` | Flash 消息在 `$_SESSION` 中的键名 |
| `CSRF_TOKEN_KEY` | `__zap_csrf__` | CSRF Token 在 `$_SESSION` 中的键名 |
