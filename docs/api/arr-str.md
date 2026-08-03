# Arr & Str

本页面包含数组和字符串工具类的 API 文档。

---

## Arr

**命名空间**: `zap\util\Arr`

数组操作工具类，提供一系列静态方法处理数组。

### `get(array $array, string $key, $default = null): mixed`

```php
public static function get(array $array, string $key, mixed $default = null): mixed
```

使用点号语法从数组中获取值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 源数组 |
| `$key` | `string` | 键名（支持点号，如 `user.address.city`） |
| `$default` | `mixed` | 默认值 |

**返回值**: `mixed`

**示例**:
```php
$data = ['user' => ['name' => 'John', 'address' => ['city' => 'NYC']]];
Arr::get($data, 'user.name');           // 'John'
Arr::get($data, 'user.address.city');   // 'NYC'
Arr::get($data, 'user.age', 0);         // 0
```

---

### `set(array &$array, string $key, $value): void`

```php
public static function set(array &$array, string $key, mixed $value): void
```

使用点号语法设置数组值（引用传递）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 目标数组（引用） |
| `$key` | `string` | 键名（支持点号） |
| `$value` | `mixed` | 值 |

**返回值**: `void`

**示例**:
```php
$data = [];
Arr::set($data, 'user.name', 'John');
Arr::set($data, 'user.address.city', 'NYC');
// ['user' => ['name' => 'John', 'address' => ['city' => 'NYC']]]
```

---

### `has(array $array, string $key): bool`

```php
public static function has(array $array, string $key): bool
```

检查数组是否存在指定键（支持点号）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 源数组 |
| `$key` | `string` | 键名（支持点号） |

**返回值**: `bool`

---

### `forget(array &$array, string $key): void`

```php
public static function forget(array &$array, string $key): void
```

从数组中删除指定键（支持点号，引用传递）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 目标数组（引用） |
| `$key` | `string` | 键名（支持点号） |

**返回值**: `void`

---

### `only(array $array, array $keys): array`

```php
public static function only(array $array, array $keys): array
```

从数组中仅保留指定键。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 源数组 |
| `$keys` | `array` | 要保留的键名数组 |

**返回值**: `array`

**示例**:
```php
$data = ['name' => 'John', 'email' => 'john@example.com', 'password' => 'secret'];
Arr::only($data, ['name', 'email']);
// ['name' => 'John', 'email' => 'john@example.com']
```

---

### `except(array $array, array $keys): array`

```php
public static function except(array $array, array $keys): array
```

从数组中排除指定键。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 源数组 |
| `$keys` | `array` | 要排除的键名数组 |

**返回值**: `array`

**示例**:
```php
$data = ['name' => 'John', 'email' => 'john@example.com', 'password' => 'secret'];
Arr::except($data, ['password']);
// ['name' => 'John', 'email' => 'john@example.com']
```

---

### `pluck(array $array, string $value, string $key = null): array`

```php
public static function pluck(array $array, string $value, string $key = null): array
```

从数组列中提取指定字段的值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 源数组 |
| `$value` | `string` | 值字段名 |
| `$key` | `string` | 键字段名（可选） |

**返回值**: `array`

**示例**:
```php
$users = [
    ['id' => 1, 'name' => 'John'],
    ['id' => 2, 'name' => 'Jane'],
];
Arr::pluck($users, 'name');         // ['John', 'Jane']
Arr::pluck($users, 'name', 'id');   // [1 => 'John', 2 => 'Jane']
```

---

### `flatten(array $array, int $depth = INF): array`

```php
public static function flatten(array $array, int $depth = INF): array
```

将多维数组扁平化为一维数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 多维数组 |
| `$depth` | `int` | 扁平化深度，默认 `INF`（无限） |

**返回值**: `array`

---

### `collapse(array $array): array`

```php
public static function collapse(array $array): array
```

将嵌套的数组集合合并为一个数组。

**返回值**: `array`

**示例**:
```php
Arr::collapse([[1, 2], [3, 4], [5]]);
// [1, 2, 3, 4, 5]
```

---

### `sort(array $array, string $key = null, string $direction = 'asc'): array`

```php
public static function sort(array $array, string $key = null, string $direction = 'asc'): array
```

对数组进行排序。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 要排序的数组 |
| `$key` | `string` | 排序键名（多维数组时使用） |
| `$direction` | `string` | 排序方向（`asc` 或 `desc`） |

**返回值**: `array`

---

### `keyBy(array $array, string $key): array`

```php
public static function keyBy(array $array, string $key): array
```

以指定字段的值作为键重新索引数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 源数组 |
| `$key` | `string` | 作为新键的字段名 |

**返回值**: `array`

---

### `groupBy(array $array, string $key): array`

```php
public static function groupBy(array $array, string $key): array
```

按指定字段对数组进行分组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 源数组 |
| `$key` | `string` | 分组字段名 |

**返回值**: `array`

---

### `random(array $array, int $number = 1): mixed`

```php
public static function random(array $array, int $number = 1): mixed
```

从数组中随机获取元素。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 源数组 |
| `$number` | `int` | 随机获取的数量 |

**返回值**: `mixed` — 单个元素或数组

---

### `first(array $array, callable $callback = null, $default = null): mixed`

```php
public static function first(array $array, callable $callback = null, mixed $default = null): mixed
```

获取数组的第一个元素（或满足条件的第一个元素）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 源数组 |
| `$callback` | `callable` | 过滤回调 |
| `$default` | `mixed` | 默认值 |

**返回值**: `mixed`

---

### `last(array $array, callable $callback = null, $default = null): mixed`

```php
public static function last(array $array, callable $callback = null, mixed $default = null): mixed
```

获取数组的最后一个元素（或满足条件的最后一个元素）。

---

### `where(array $array, callable $callback): array`

```php
public static function where(array $array, callable $callback): array
```

使用回调过滤数组。

**返回值**: `array`

---

### `wrap($value): array`

```php
public static function wrap(mixed $value): array
```

将值包装为数组（如果还不是数组）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `mixed` | 任意值 |

**返回值**: `array`

---

### `isAssoc(array $array): bool`

```php
public static function isAssoc(array $array): bool
```

检查数组是否为关联数组。

**返回值**: `bool`

---

## Str

**命名空间**: `zap\util\Str`

字符串操作工具类，提供一系列静态方法处理字符串。

### `contains(string $haystack, string|array $needles): bool`

```php
public static function contains(string $haystack, string|array $needles): bool
```

检查字符串是否包含指定子串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$haystack` | `string` | 源字符串 |
| `$needles` | `string\|array` | 要查找的子串或子串数组 |

**返回值**: `bool`

**示例**:
```php
Str::contains('Hello World', 'World');   // true
Str::contains('Hello World', ['Hi', 'Hello']); // true
```

---

### `startsWith(string $haystack, string|array $needles): bool`

```php
public static function startsWith(string $haystack, string|array $needles): bool
```

检查字符串是否以指定子串开头。

**返回值**: `bool`

---

### `endsWith(string $haystack, string|array $needles): bool`

```php
public static function endsWith(string $haystack, string|array $needles): bool
```

检查字符串是否以指定子串结尾。

**返回值**: `bool`

---

### `after(string $subject, string $search): string`

```php
public static function after(string $subject, string $search): string
```

返回指定子串之后的部分。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$subject` | `string` | 源字符串 |
| `$search` | `string` | 搜索的子串 |

**返回值**: `string`

**示例**:
```php
Str::after('Hello World', 'Hello ');  // 'World'
```

---

### `before(string $subject, string $search): string`

```php
public static function before(string $subject, string $search): string
```

返回指定子串之前的部分。

**示例**:
```php
Str::before('Hello World', ' World');  // 'Hello'
```

---

### `limit(string $value, int $limit = 100, string $end = '...'): string`

```php
public static function limit(string $value, int $limit = 100, string $end = '...'): string
```

截断字符串到指定长度。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `string` | 源字符串 |
| `$limit` | `int` | 最大长度 |
| `$end` | `string` | 截断后缀 |

**返回值**: `string`

---

### `random(int $length = 16): string`

```php
public static function random(int $length = 16): string
```

生成指定长度的随机字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 长度，默认 16 |

**返回值**: `string`

---

### `slug(string $title, string $separator = '-'): string`

```php
public static function slug(string $title, string $separator = '-'): string
```

将字符串转换为 URL 友好的 slug 格式。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$title` | `string` | 原始字符串 |
| `$separator` | `string` | 分隔符 |

**返回值**: `string`

**示例**:
```php
Str::slug('Hello World!');      // 'hello-world'
Str::slug('你好 世界');          // 'ni-hao-shi-jie'
```

---

### `camel(string $value): string`

```php
public static function camel(string $value): string
```

将字符串转换为驼峰命名（camelCase）。

**示例**:
```php
Str::camel('hello_world');      // 'helloWorld'
Str::camel('hello-world');      // 'helloWorld'
```

---

### `studly(string $value): string`

```php
public static function studly(string $value): string
```

将字符串转换为帕斯卡命名（StudlyCase/PascalCase）。

**示例**:
```php
Str::studly('hello_world');     // 'HelloWorld'
Str::studly('hello-world');     // 'HelloWorld'
```

---

### `snake(string $value, string $delimiter = '_'): string`

```php
public static function snake(string $value, string $delimiter = '_'): string
```

将字符串转换为蛇形命名（snake_case）。

**示例**:
```php
Str::snake('HelloWorld');       // 'hello_world'
Str::snake('helloWorld');       // 'hello_world'
```

---

### `kebab(string $value): string`

```php
public static function kebab(string $value): string
```

将字符串转换为短横线命名（kebab-case）。

**示例**:
```php
Str::kebab('HelloWorld');       // 'hello-world'
```

---

### `lower(string $value): string`

```php
public static function lower(string $value): string
```

将字符串转为小写（支持多字节）。

**返回值**: `string`

---

### `upper(string $value): string`

```php
public static function upper(string $value): string
```

将字符串转为大写（支持多字节）。

**返回值**: `string`

---

### `length(string $value): int`

```php
public static function length(string $value): int
```

获取字符串长度（支持多字节）。

**返回值**: `int`

---

### `substr(string $string, int $start, int $length = null): string`

```php
public static function substr(string $string, int $start, int $length = null): string
```

截取子字符串（支持多字节）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$string` | `string` | 源字符串 |
| `$start` | `int` | 起始位置 |
| `$length` | `int` | 截取长度 |

**返回值**: `string`

---

### `replaceFirst(string $search, string $replace, string $subject): string`

```php
public static function replaceFirst(string $search, string $replace, string $subject): string
```

替换第一个匹配项。

**返回值**: `string`

---

### `replaceLast(string $search, string $replace, string $subject): string`

```php
public static function replaceLast(string $search, string $replace, string $subject): string
```

替换最后一个匹配项。

**返回值**: `string`

---

## 使用示例

```php
use zap\util\Arr;
use zap\util\Str;

// Arr 示例
$config = [];
Arr::set($config, 'app.debug', true);
Arr::set($config, 'app.name', 'MyApp');
$debug = Arr::get($config, 'app.debug', false);

$input = ['name' => 'John', 'email' => 'john@example.com', '_token' => 'abc123'];
$safeInput = Arr::only($input, ['name', 'email']);

// Str 示例
$slug = Str::slug('My First Blog Post');        // 'my-first-blog-post'
$className = Str::studly('user_controller');     // 'UserController'
$methodName = Str::camel('get_user_name');       // 'getUserName'
$tableName = Str::snake('UserProfile');          // 'user_profile'

$excerpt = Str::limit($longText, 200);           // 截断到 200 字符
$key = Str::random(32);                          // 随机 32 字符
```
