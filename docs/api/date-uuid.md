# Date & UUID & ZArray

本页面包含日期时间工具、UUID 生成器和增强数组类的 API 文档。

---

## Date

**命名空间**: `zap\util\Date`

日期时间工具类，提供日期格式化、解析、计算等静态方法。

### `now(string $format = 'Y-m-d H:i:s'): string`

```php
public static function now(string $format = 'Y-m-d H:i:s'): string
```

获取当前日期时间字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$format` | `string` | 日期格式，默认 `Y-m-d H:i:s` |

**返回值**: `string`

**示例**:
```php
Date::now();                  // '2024-01-15 14:30:00'
Date::now('Y-m-d');           // '2024-01-15'
Date::now('Y年m月d日 H:i');    // '2024年01月15日 14:30'
```

---

### `today(string $format = 'Y-m-d'): string`

```php
public static function today(string $format = 'Y-m-d'): string
```

获取今天的日期。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$format` | `string` | 日期格式 |

**返回值**: `string`

---

### `yesterday(string $format = 'Y-m-d'): string`

```php
public static function yesterday(string $format = 'Y-m-d'): string
```

获取昨天的日期。

---

### `tomorrow(string $format = 'Y-m-d'): string`

```php
public static function tomorrow(string $format = 'Y-m-d'): string
```

获取明天的日期。

---

### `format($date, string $format = 'Y-m-d H:i:s'): string`

```php
public static function format(string|int $date, string $format = 'Y-m-d H:i:s'): string
```

格式化日期时间。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$date` | `string\|int` | 日期字符串或时间戳 |
| `$format` | `string` | 目标格式 |

**返回值**: `string`

**示例**:
```php
Date::format('2024-01-15', 'd/m/Y');     // '15/01/2024'
Date::format(1705319400, 'Y-m-d H:i:s');  // '2024-01-15 14:30:00'
```

---

### `parse(string $date): int`

```php
public static function parse(string $date): int
```

将日期字符串解析为时间戳。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$date` | `string` | 日期字符串 |

**返回值**: `int` — Unix 时间戳

---

### `addDays(string $date, int $days, string $format = 'Y-m-d H:i:s'): string`

```php
public static function addDays(string $date, int $days, string $format = 'Y-m-d H:i:s'): string
```

在日期上增加指定天数。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$date` | `string` | 基准日期 |
| `$days` | `int` | 增加的天数 |
| `$format` | `string` | 返回格式 |

**返回值**: `string`

---

### `subDays(string $date, int $days, string $format = 'Y-m-d H:i:s'): string`

```php
public static function subDays(string $date, int $days, string $format = 'Y-m-d H:i:s'): string
```

在日期上减少指定天数。

---

### `addMonths(string $date, int $months, string $format = 'Y-m-d H:i:s'): string`

```php
public static function addMonths(string $date, int $months, string $format = 'Y-m-d H:i:s'): string
```

在日期上增加指定月数。

---

### `diffInDays(string $date1, string $date2): int`

```php
public static function diffInDays(string $date1, string $date2): int
```

计算两个日期相差的天数。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$date1` | `string` | 第一个日期 |
| `$date2` | `string` | 第二个日期 |

**返回值**: `int`

---

### `isWeekend(string $date): bool`

```php
public static function isWeekend(string $date): bool
```

检查日期是否为周末。

**返回值**: `bool`

---

### `isPast(string $date): bool`

```php
public static function isPast(string $date): bool
```

检查日期是否已过去。

**返回值**: `bool`

---

### `isFuture(string $date): bool`

```php
public static function isFuture(string $date): bool
```

检查日期是否在未来。

**返回值**: `bool`

---

### `age(string $birthday): int`

```php
public static function age(string $birthday): int
```

根据生日计算年龄。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$birthday` | `string` | 生日日期 |

**返回值**: `int`

---

## UUID

**命名空间**: `zap\util\UUID`

UUID 生成器，支持多种版本的 UUID 生成。

### `v4(): string`

```php
public static function v4(): string
```

生成 UUID v4（随机）。

**返回值**: `string` — 格式如 `550e8400-e29b-41d4-a716-446655440000`

**示例**:
```php
$uuid = UUID::v4();
// '7c9e6679-7425-40de-944b-e07fc1f90ae7'
```

---

### `v1(): string`

```php
public static function v1(): string
```

生成 UUID v1（基于时间戳和 MAC 地址）。

**返回值**: `string`

---

### `v3(string $namespace, string $name): string`

```php
public static function v3(string $namespace, string $name): string
```

生成 UUID v3（基于命名空间和名称的 MD5 哈希）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$namespace` | `string` | 命名空间 UUID |
| `$name` | `string` | 名称 |

**返回值**: `string`

---

### `v5(string $namespace, string $name): string`

```php
public static function v5(string $namespace, string $name): string
```

生成 UUID v5（基于命名空间和名称的 SHA-1 哈希）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$namespace` | `string` | 命名空间 UUID |
| `$name` | `string` | 名称 |

**返回值**: `string`

---

### `isValid(string $uuid): bool`

```php
public static function isValid(string $uuid): bool
```

验证字符串是否为有效的 UUID。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$uuid` | `string` | UUID 字符串 |

**返回值**: `bool`

---

## ZArray

**命名空间**: `zap\util\ZArray`

增强的数组包装类，实现 `\ArrayAccess`、`\Iterator`、`\Countable` 接口。提供点号路径访问、配置合并等增强功能。

### 构造函数

```php
public function __construct(array $data = [])
```

创建 ZArray 实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `array` | 初始数据 |

---

### `get(string $key, $default = null): mixed`

```php
public function get(string $key, mixed $default = null): mixed
```

使用点号语法获取值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 键名（支持点号） |
| `$default` | `mixed` | 默认值 |

**返回值**: `mixed`

---

### `set(string $key, $value): void`

```php
public function set(string $key, mixed $value): void
```

使用点号语法设置值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 键名（支持点号） |
| `$value` | `mixed` | 值 |

**返回值**: `void`

---

### `has(string $key): bool`

```php
public function has(string $key): bool
```

检查键是否存在。

**返回值**: `bool`

---

### `forget(string $key): void`

```php
public function forget(string $key): void
```

删除指定键。

**返回值**: `void`

---

### `merge(array $data): self`

```php
public function merge(array $data): self
```

合并数组数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `array` | 要合并的数据 |

**返回值**: `$this`

---

### `all(): array`

```php
public function all(): array
```

获取所有数据的原生数组。

**返回值**: `array`

---

### `toArray(): array`

```php
public function toArray(): array
```

转换为原生数组（等同于 `all()`）。

**返回值**: `array`

---

### `count(): int`

```php
public function count(): int
```

获取元素数量。

**返回值**: `int`

---

### ArrayAccess 支持

ZArray 实现了 `\ArrayAccess` 接口，支持数组式访问：

```php
$config = new ZArray();
$config['app.debug'] = true;          // 设置
echo $config['app.debug'];            // 获取
if (isset($config['app.debug'])) {}   // 检查
unset($config['app.debug']);          // 删除
```

### Iterator 支持

ZArray 实现了 `\Iterator` 接口，可在 `foreach` 中使用：

```php
$config = new ZArray(['host' => 'localhost', 'port' => 3306]);
foreach ($config as $key => $value) {
    echo "$key: $value\n";
}
```

---

## 使用示例

### Date 示例

```php
use zap\util\Date;

echo Date::now();                      // 2024-01-15 14:30:00
echo Date::today();                    // 2024-01-15
echo Date::addDays('2024-01-15', 7);   // 2024-01-22 00:00:00

$diff = Date::diffInDays('2024-01-01', '2024-01-15'); // 14

if (Date::isPast('2023-12-31')) {
    echo '已过期';
}

$age = Date::age('1990-05-20');        // 33
```

### UUID 示例

```php
use zap\util\UUID;

$id = UUID::v4();  // 最常用
// 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

if (UUID::isValid($id)) {
    // 有效的 UUID
}

// 命名空间 UUID（适用于需要确定性 ID 的场景）
$ns = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS 命名空间
$urlId = UUID::v5($ns, 'https://example.com');
```

### ZArray 示例

```php
use zap\util\ZArray;

$config = new ZArray();
$config->set('database.mysql.host', 'localhost');
$config->set('database.mysql.port', 3306);

$host = $config->get('database.mysql.host');  // 'localhost'

// 数组式访问
$config['app.name'] = 'MyApp';
echo $config['app.name'];  // 'MyApp'

// 遍历
foreach ($config as $key => $value) {
    echo "$key => $value\n";
}

// 合并
$config->merge(['cache' => ['driver' => 'redis']]);
```
