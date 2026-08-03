# Password & Random & FileUtils

本页面包含密码哈希、随机值生成和文件操作工具类的 API 文档。

---

## Password

**命名空间**: `zap\util\Password`

密码哈希工具类，使用 `password_hash()` 和 `password_verify()` 进行安全的密码处理。

### `hash(string $password, int $algo = PASSWORD_BCRYPT, array $options = []): string`

```php
public static function hash(string $password, int $algo = PASSWORD_BCRYPT, array $options = []): string
```

对密码进行哈希处理。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$password` | `string` | 明文密码 |
| `$algo` | `int` | 哈希算法，默认 `PASSWORD_BCRYPT` |
| `$options` | `array` | 算法选项（如 `['cost' => 12]`） |

**返回值**: `string` — 哈希后的密码字符串

**示例**:
```php
$hashed = Password::hash('my_password');
// '$2y$10$...'

// 指定 cost
$hashed = Password::hash('my_password', PASSWORD_BCRYPT, ['cost' => 12]);

// Argon2
$hashed = Password::hash('my_password', PASSWORD_ARGON2ID);
```

---

### `verify(string $password, string $hash): bool`

```php
public static function verify(string $password, string $hash): bool
```

验证密码与哈希是否匹配。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$password` | `string` | 明文密码 |
| `$hash` | `string` | 哈希值 |

**返回值**: `bool`

**示例**:
```php
$hashed = Password::hash('secret123');

if (Password::verify('secret123', $hashed)) {
    // 密码正确
}
```

---

### `needsRehash(string $hash, int $algo = PASSWORD_BCRYPT, array $options = []): bool`

```php
public static function needsRehash(string $hash, int $algo = PASSWORD_BCRYPT, array $options = []): bool
```

检查哈希是否需要重新生成（如算法或选项已变更）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$hash` | `string` | 现有哈希值 |
| `$algo` | `int` | 当前算法 |
| `$options` | `array` | 当前选项 |

**返回值**: `bool`

**示例**:
```php
if (Password::needsRehash($user->password, PASSWORD_BCRYPT, ['cost' => 14])) {
    $user->password = Password::hash($inputPassword, PASSWORD_BCRYPT, ['cost' => 14]);
    $user->save();
}
```

---

### `getInfo(string $hash): array`

```php
public static function getInfo(string $hash): array
```

获取哈希信息（算法、选项等）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$hash` | `string` | 哈希值 |

**返回值**: `array`

---

## Random

**命名空间**: `zap\util\Random`

安全随机值生成工具类，使用 `random_bytes()` 生成密码学安全的随机值。

### `string(int $length = 32): string`

```php
public static function string(int $length = 32): string
```

生成指定长度的随机字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 字符串长度，默认 32 |

**返回值**: `string` — 字母数字组合的随机字符串

**示例**:
```php
$token = Random::string(64);  // 随机 64 字符
$key = Random::string(16);    // 随机 16 字符
```

---

### `int(int $min, int $max): int`

```php
public static function int(int $min, int $max): int
```

生成指定范围内的安全随机整数。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$min` | `int` | 最小值（包含） |
| `$max` | `int` | 最大值（包含） |

**返回值**: `int`

**示例**:
```php
$code = Random::int(100000, 999999);  // 6 位验证码
$delay = Random::int(1, 10);          // 1-10 秒随机延迟
```

---

### `bytes(int $length = 16): string`

```php
public static function bytes(int $length = 16): string
```

生成指定长度的原始随机字节。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 字节长度 |

**返回值**: `string` — 原始二进制字符串

---

### `hex(int $length = 32): string`

```php
public static function hex(int $length = 32): string
```

生成指定长度的随机十六进制字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 字符串长度 |

**返回值**: `string`

**示例**:
```php
$secret = Random::hex(64);  // 128 位密钥的十六进制表示
```

---

### `alpha(int $length = 16): string`

```php
public static function alpha(int $length = 16): string
```

生成仅包含字母的随机字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 长度 |

**返回值**: `string`

---

### `alnum(int $length = 16): string`

```php
public static function alnum(int $length = 16): string
```

生成字母数字混合的随机字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 长度 |

**返回值**: `string`

---

### `shuffleArray(array $array): array`

```php
public static function shuffleArray(array $array): array
```

安全地随机打乱数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 原始数组 |

**返回值**: `array`

---

### `shuffleString(string $string): string`

```php
public static function shuffleString(string $string): string
```

安全地随机打乱字符串中的字符。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$string` | `string` | 原始字符串 |

**返回值**: `string`

---

## FileUtils

**命名空间**: `zap\util\FileUtils`

文件系统操作工具类，提供文件和目录的常用操作。

### `get(string $path): string`

```php
public static function get(string $path): string
```

读取文件内容。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 文件路径 |

**返回值**: `string`

---

### `put(string $path, string $contents, bool $lock = false): int|bool`

```php
public static function put(string $path, string $contents, bool $lock = false): int|bool
```

写入内容到文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 文件路径 |
| `$contents` | `string` | 文件内容 |
| `$lock` | `bool` | 是否加锁写入 |

**返回值**: `int\|bool` — 写入的字节数或 `false`

---

### `append(string $path, string $data): int|bool`

```php
public static function append(string $path, string $data): int|bool
```

追加内容到文件末尾。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 文件路径 |
| `$data` | `string` | 追加的内容 |

**返回值**: `int\|bool`

---

### `exists(string $path): bool`

```php
public static function exists(string $path): bool
```

检查文件或目录是否存在。

**返回值**: `bool`

---

### `delete(string|array $paths): bool`

```php
public static function delete(string|array $paths): bool
```

删除文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$paths` | `string\|array` | 文件路径或路径数组 |

**返回值**: `bool`

---

### `makeDirectory(string $path, int $mode = 0755, bool $recursive = false): bool`

```php
public static function makeDirectory(string $path, int $mode = 0755, bool $recursive = false): bool
```

创建目录。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 目录路径 |
| `$mode` | `int` | 权限模式 |
| `$recursive` | `bool` | 是否递归创建 |

**返回值**: `bool`

---

### `deleteDirectory(string $directory): bool`

```php
public static function deleteDirectory(string $directory): bool
```

递归删除目录。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$directory` | `string` | 目录路径 |

**返回值**: `bool`

---

### `copy(string $source, string $dest): bool`

```php
public static function copy(string $source, string $dest): bool
```

复制文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$source` | `string` | 源文件路径 |
| `$dest` | `string` | 目标文件路径 |

**返回值**: `bool`

---

### `move(string $source, string $dest): bool`

```php
public static function move(string $source, string $dest): bool
```

移动文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$source` | `string` | 源文件路径 |
| `$dest` | `string` | 目标文件路径 |

**返回值**: `bool`

---

### `extension(string $path): string`

```php
public static function extension(string $path): string
```

获取文件扩展名。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 文件路径 |

**返回值**: `string`

**示例**:
```php
FileUtils::extension('photo.jpg');   // 'jpg'
FileUtils::extension('archive.tar.gz'); // 'gz'
```

---

### `name(string $path): string`

```php
public static function name(string $path): string
```

获取文件名（不含扩展名）。

**示例**:
```php
FileUtils::name('/path/to/photo.jpg');  // 'photo'
```

---

### `basename(string $path): string`

```php
public static function basename(string $path): string
```

获取路径中的文件名（含扩展名）。

**示例**:
```php
FileUtils::basename('/path/to/photo.jpg'); // 'photo.jpg'
```

---

### `dirname(string $path): string`

```php
public static function dirname(string $path): string
```

获取路径中的目录部分。

**示例**:
```php
FileUtils::dirname('/path/to/photo.jpg'); // '/path/to'
```

---

### `size(string $path): int`

```php
public static function size(string $path): int
```

获取文件大小（字节）。

**返回值**: `int`

---

### `mimeType(string $path): string`

```php
public static function mimeType(string $path): string
```

获取文件的 MIME 类型。

**返回值**: `string`

---

### `lastModified(string $path): int`

```php
public static function lastModified(string $path): int
```

获取文件的最后修改时间戳。

**返回值**: `int`

---

### `isDirectory(string $path): bool`

```php
public static function isDirectory(string $path): bool
```

检查路径是否为目录。

**返回值**: `bool`

---

### `isFile(string $path): bool`

```php
public static function isFile(string $path): bool
```

检查路径是否为文件。

**返回值**: `bool`

---

### `isWritable(string $path): bool`

```php
public static function isWritable(string $path): bool
```

检查路径是否可写。

**返回值**: `bool`

---

### `isReadable(string $path): bool`

```php
public static function isReadable(string $path): bool
```

检查路径是否可读。

**返回值**: `bool`

---

### `files(string $directory, bool $recursive = false): array`

```php
public static function files(string $directory, bool $recursive = false): array
```

获取目录中的文件列表。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$directory` | `string` | 目录路径 |
| `$recursive` | `bool` | 是否递归获取 |

**返回值**: `array`

---

### `directories(string $directory): array`

```php
public static function directories(string $directory): array
```

获取目录中的子目录列表。

**返回值**: `array`

---

### `glob(string $pattern, int $flags = 0): array`

```php
public static function glob(string $pattern, int $flags = 0): array
```

使用 glob 模式查找文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$pattern` | `string` | Glob 模式 |
| `$flags` | `int` | Glob 标志 |

**返回值**: `array`

---

## 使用示例

### Password 示例

```php
use zap\util\Password;

// 注册时哈希密码
$user->password = Password::hash($request->input('password'));

// 登录时验证
if (Password::verify($inputPassword, $user->password)) {
    // 登录成功
    // 可选：检查是否需要更新哈希算法
    if (Password::needsRehash($user->password)) {
        $user->password = Password::hash($inputPassword);
        $user->save();
    }
}
```

### Random 示例

```php
use zap\util\Random;

// API 令牌
$apiToken = Random::string(64);

// 验证码
$verificationCode = Random::int(100000, 999999);

// 加密密钥
$encryptionKey = Random::hex(32);

// 随机排序
$winners = Random::shuffleArray($participants);
```

### FileUtils 示例

```php
use zap\util\FileUtils;

// 读取文件
$content = FileUtils::get('/path/to/file.txt');

// 写入文件
FileUtils::put('/path/to/file.txt', 'Hello World');

// 追加内容
FileUtils::append('/path/to/log.txt', "[2024-01-15] User logged in\n");

// 创建目录
FileUtils::makeDirectory('/path/to/uploads/2024', 0755, true);

// 复制文件
FileUtils::copy('/tmp/upload.jpg', '/storage/images/photo.jpg');

// 获取文件信息
$size = FileUtils::size('/path/to/file.pdf');
$mime = FileUtils::mimeType('/path/to/image.png'); // 'image/png'
$ext = FileUtils::extension('/path/to/script.php'); // 'php'

// 列出目录文件
$logFiles = FileUtils::files('/path/to/logs');
$subDirs = FileUtils::directories('/path/to/project');

// Glob 查找
$phpFiles = FileUtils::glob('/path/to/src/**/*.php');
```
