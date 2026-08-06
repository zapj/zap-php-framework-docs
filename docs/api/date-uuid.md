# Date & UUID & ZArray

本页面包含日期时间工具、UUID 生成器和增强数组类的 API 文档。

---

## Date

**命名空间**: `zap\util\Date`

日期时间工具类，支持实例模式和静态方法两种调用方式。提供 DateTime 实例化、格式化、相对时间、差值计算、日期判断、日期边界和日期计算等常用操作，所有方法均支持时区参数。

### 格式常量

| 常量 | 值 | 说明 |
|------|------|------|
| `Date::FORMAT_DATETIME` | `Y-m-d H:i:s` | 日期时间 |
| `Date::FORMAT_DATE` | `Y-m-d` | 仅日期 |
| `Date::FORMAT_TIME` | `H:i:s` | 仅时间 |
| `Date::FORMAT_SHORT` | `Y-m-d H:i` | 短格式（无秒） |
| `Date::FORMAT_CHINESE` | `Y年m月d日 H:i:s` | 中文格式 |
| `Date::FORMAT_TIMESTAMP` | `YmdHis` | 紧凑时间戳格式 |

---

### 实例模式

```php
$date = (new Date())->setTimeZone('Asia/Shanghai');
$date->nowDate();                           // 当前时间
$date->format('Y-m-d', '2026-08-06');      // 指定格式
```

`setTimeZone()` 返回 `$this`，支持链式调用。实例模式适合需要统一时区处理的场景。

所有实例方法均支持通过 `Date::method()` 静态方式调用（`__callStatic` 自动代理），静态调用使用默认时区。

---

### 创建 DateTime 实例

#### `create(string $datetime, ?string $timezone = null): \DateTime`

```php
public function create(string $datetime, ?string $timezone = null): \DateTime
```

创建 DateTime 实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$datetime` | `string` | 日期时间字符串，如 `now`、`2026-08-06` |
| `$timezone` | `string\|null` | 时区，null 使用实例默认时区 |

**返回值**: `\DateTime`

**可能抛出**: `\Exception`

---

#### `now(?string $timezone = null): \DateTime`

```php
public function now(?string $timezone = null): \DateTime
```

获取当前时间的 DateTime 实例。

---

#### `make(string $datetime = 'now'): \DateTime`

```php
public static function make(string $datetime = 'now'): \DateTime
```

静态方法，快速创建 DateTime 实例（使用系统默认时区）。

```php
$dt = Date::make('2026-08-06 14:30:00');
$dt = Date::make();  // 等同于 new \DateTime()
```

---

#### `makeTz(string $datetime, string $timezone): \DateTime`

```php
public static function makeTz(string $datetime, string $timezone): \DateTime
```

静态方法，创建指定时区的 DateTime 实例。

```php
$dt = Date::makeTz('2026-08-06', 'Asia/Shanghai');
```

---

### 格式化

#### `format(string $format, string $datetime, ?string $timezone = null): string`

```php
public function format(string $format, string $datetime, ?string $timezone = null): string
```

格式化日期时间（带错误处理）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$format` | `string` | 日期格式 |
| `$datetime` | `string` | 日期时间字符串 |
| `$timezone` | `string\|null` | 时区 |

**返回值**: `string` — 失败返回空字符串

```php
Date::format('Y-m-d', '2026-08-06 15:30:00');     // '2026-08-06'
Date::format('d/m/Y H:i', '2026-08-06 15:30:00'); // '06/08/2026 15:30'
```

---

#### `nowDate(string $format = 'Y-m-d H:i:s', ?string $timezone = null): string`

```php
public function nowDate(string $format = 'Y-m-d H:i:s', ?string $timezone = null): string
```

获取当前时间字符串（通过 DateTime，遵循时区）。

```php
Date::nowDate();                             // '2026-08-06 14:30:00'
Date::nowDate(Date::FORMAT_DATE);            // '2026-08-06'
Date::nowDate(Date::FORMAT_CHINESE);         // '2026年08月06日 14:30:00'
```

---

#### `fromTimestamp(int $timestamp, string $format = 'Y-m-d H:i:s', ?string $timezone = null): string`

```php
public function fromTimestamp(int $timestamp, string $format = 'Y-m-d H:i:s', ?string $timezone = null): string
```

Unix 时间戳转日期字符串。

```php
Date::fromTimestamp(1722938400);             // '2026-08-06 14:00:00'
Date::fromTimestamp(time(), 'Y/m/d H:i');    // '2026/08/06 14:30'
```

---

### 相对时间

#### `ago($datetime): string`

```php
public function ago(string|int|\DateTimeInterface $datetime): string
```

人性化相对时间，支持过去和未来。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$datetime` | `string\|int\|\DateTimeInterface` | 日期字符串、时间戳或 DateTime |

**返回值**: `string`

```php
Date::ago('-30 seconds');    // '刚刚'
Date::ago('-5 minutes');     // '5分钟前'
Date::ago('-3 hours');       // '3小时前'
Date::ago('-2 days');        // '2天前'
Date::ago('-2 months');      // '2个月前'
Date::ago('-1 year');        // '1年前'

// 未来时间
Date::ago('+30 seconds');    // '即将'
Date::ago('+10 minutes');    // '10分钟后'
Date::ago('+3 days');        // '3天后'
```

---

#### `relativeTime($datetime, string $dateFormat = 'Y-m-d', int $dayThreshold = 7): string`

```php
public function relativeTime(string|int|\DateTimeInterface $datetime, string $dateFormat = 'Y-m-d', int $dayThreshold = 7): string
```

精确相对时间，超过阈值自动切换为绝对日期格式。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$datetime` | `string\|int\|\DateTimeInterface` | 日期时间 |
| `$dateFormat` | `string` | 超过阈值后的日期格式 |
| `$dayThreshold` | `int` | 多少天后切换为绝对日期，默认 7 |

**返回值**: `string`

```php
Date::relativeTime('-1 day');              // '昨天'
Date::relativeTime('+1 day');              // '明天'
Date::relativeTime('-3 hours');            // '3小时前'
Date::relativeTime('-10 days', 'm-d');     // '07-27'（超过7天阈值）
```

---

### 差值计算

#### `diff(string $datetime1, string $datetime2): \DateInterval`

```php
public function diff(string $datetime1, string $datetime2): \DateInterval
```

计算两个日期的精确差值，返回 `DateInterval` 对象。

---

#### `diffInSeconds($datetime): int`

```php
public function diffInSeconds(string|int|\DateTimeInterface $datetime): int
```

从给定日期距今的秒数差。

---

#### `diffInMinutes($datetime): int`

从给定日期距今的分钟数差。

---

#### `diffInHours($datetime): int`

从给定日期距今的小时数差。

---

#### `diffInDays($datetime): int`

从给定日期距今的天数差。

```php
Date::diffInDays('2026-07-01');   // 36
Date::diffInHours('-1 day');       // 24
```

---

### 日期判断

#### `isToday($datetime, ?string $timezone = null): bool`

判断是否为今天。

---

#### `isYesterday($datetime, ?string $timezone = null): bool`

判断是否为昨天。

---

#### `isTomorrow($datetime, ?string $timezone = null): bool`

判断是否为明天。

---

#### `isThisWeek($datetime, ?string $timezone = null): bool`

判断是否在本周内。

---

#### `isThisMonth($datetime, ?string $timezone = null): bool`

判断是否在本月内。

---

#### `isThisYear($datetime, ?string $timezone = null): bool`

判断是否在本年内。

---

#### `isPast($datetime, ?string $timezone = null): bool`

判断是否为过去的日期。

---

#### `isFuture($datetime, ?string $timezone = null): bool`

判断是否为未来的日期。

---

#### `isWeekend($datetime, ?string $timezone = null): bool`

判断是否为周末（周六或周日）。

---

#### `isWeekday($datetime, ?string $timezone = null): bool`

判断是否为工作日（周一至周五）。

---

#### `between($datetime, $start, $end, ?string $timezone = null): bool`

```php
public function between(string|int|\DateTimeInterface $datetime, string|int|\DateTimeInterface $start, string|int|\DateTimeInterface $end, ?string $timezone = null): bool
```

判断给定日期是否在两个日期之间（包含边界）。

```php
Date::between('2026-08-06', '2026-08-01', '2026-08-31'); // true
```

```php
// 综合示例
Date::isToday('2026-08-06');              // true
Date::isYesterday('2026-08-05');          // true
Date::isWeekend('2026-08-08');            // true (周六)
Date::isWeekday('2026-08-06');            // true (周四)
Date::isPast('2025-01-01');               // true
Date::isFuture('2027-01-01');             // true
Date::isThisMonth('2026-08-15');          // true
```

---

### 日期边界

返回 `\DateTime` 对象，已设置到临界时间点。

| 方法 | 返回 |
|------|------|
| `startOfDay($datetime)` | 当天 00:00:00 |
| `endOfDay($datetime)` | 当天 23:59:59.999999 |
| `startOfWeek($datetime)` | 本周一 00:00:00 |
| `endOfWeek($datetime)` | 本周日 23:59:59.999999 |
| `startOfMonth($datetime)` | 本月第一天 00:00:00 |
| `endOfMonth($datetime)` | 本月最后一天 23:59:59.999999 |
| `startOfYear($datetime)` | 本年第一天 00:00:00 |
| `endOfYear($datetime)` | 本年最后一天 23:59:59.999999 |

```php
$start = Date::startOfMonth('now');
$end   = Date::endOfMonth('now');

// 查询本月数据
$sql = "SELECT * FROM orders WHERE created_at BETWEEN ? AND ?";
$rows = DB::select($sql, [
    $start->format(Date::FORMAT_DATETIME),
    $end->format(Date::FORMAT_DATETIME),
]);
```

---

### 日期计算

返回 `\DateTime` 对象，支持链式操作。

| 方法 | 说明 |
|------|------|
| `addDays($datetime, int $days)` | 增加天数 |
| `subDays($datetime, int $days)` | 减少天数 |
| `addMonths($datetime, int $months)` | 增加月数 |
| `subMonths($datetime, int $months)` | 减少月数 |
| `addYears($datetime, int $years)` | 增加年数 |
| `subYears($datetime, int $years)` | 减少年数 |
| `daysInMonth($datetime)` | 获取当月天数 |

```php
$nextWeek   = Date::addDays('now', 7);            // 7天后
$lastMonth  = Date::subMonths('now', 1);          // 上个月
$daysInFeb  = Date::daysInMonth('2026-02-01');    // 28

// 链式
$date = Date::addDays('now', 30);
$end  = Date::endOfMonth($date);
```

---

### 本地化

#### `chineseWeekday($datetime, ?string $timezone = null): string`

```php
public function chineseWeekday(string|int|\DateTimeInterface $datetime, ?string $timezone = null): string
```

获取中文星期名称。

```php
Date::chineseWeekday('2026-08-03');   // '星期一'
Date::chineseWeekday('2026-08-07');   // '星期五'
Date::chineseWeekday('2026-08-09');   // '星期日'
```

---

#### `chineseMonth($datetime, ?string $timezone = null): string`

获取中文月份名称。

```php
Date::chineseMonth('2026-08-06');     // '八月'
Date::chineseMonth('2026-01-01');     // '一月'
```

---

#### `age($birthday, ?string $timezone = null): int`

```php
public function age(string|int|\DateTimeInterface $birthday, ?string $timezone = null): int
```

根据生日计算年龄（已处理今年生日是否已过的边界情况）。

```php
Date::age('1990-05-20');              // 36
Date::age('2000-01-01');              // 26
```

---

### 综合示例

```php
use zap\util\Date;

// ── 格式化
echo Date::nowDate(Date::FORMAT_CHINESE);     // 2026年08月06日 14:30:00
echo Date::fromTimestamp(time(), 'm-d H:i');  // 08-06 14:30

// ── 相对时间
echo Date::ago('-3 hours');                    // 3小时前
echo Date::relativeTime('-1 day');             // 昨天

// ── 条件判断
if (Date::isPast($order->expire_at)) {
    echo '订单已过期';
}
if (Date::isWeekend('now')) {
    echo '今天是休息日';
}

// ── 数据查询范围（本月）
$start = Date::startOfMonth('now');
$end   = Date::endOfMonth('now');
$orders = DB::select("SELECT * FROM orders WHERE created_at BETWEEN ? AND ?", [
    $start->format(Date::FORMAT_DATETIME),
    $end->format(Date::FORMAT_DATETIME),
]);

// ── 过期判断
$expiresAt = Date::addDays($order->created_at, 7);
if (Date::isPast($expiresAt)) {
    $order->cancel();
}

// ── 年龄与本地化
$user['age']     = Date::age($user['birthday']);                  // 36
$user['birthday_str'] = Date::chineseMonth($user['birthday']) . Date::format('d日', $user['birthday']); // 五月20日

// ── 实例模式（统一时区）
$date = (new Date())->setTimeZone('Asia/Shanghai');
echo $date->nowDate();                            // 北京时间
echo $date->format('Y-m-d H:i:s', '2026-01-01'); // 北京时间
```

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

echo Date::nowDate();                          // 2026-08-06 14:30:00
echo Date::nowDate(Date::FORMAT_DATE);         // 2026-08-06

echo Date::ago('-5 minutes');                  // 5分钟前
echo Date::relativeTime('-1 day');             // 昨天

$diff = Date::diffInDays('2026-07-01');        // 36

if (Date::isPast('2025-12-31')) {
    echo '已过期';
}

$age = Date::age('1990-05-20');                // 36

$monday = Date::startOfWeek('now');
$date   = Date::addDays('now', 7);
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
