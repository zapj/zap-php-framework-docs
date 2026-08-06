# FileUtils

> **注意**：密码哈希和随机数生成功能已迁移至新的 `zap\crypto` 命名空间。
> - 密码哈希 → 请使用 [`zap\crypto\Hash`](/api/crypto#hash)
> - 随机数生成 → 请使用 [`zap\crypto\Random`](/api/crypto#random)
>
> 旧的 `zap\util\Password` 和 `zap\util\Random` 类仍然可用，但推荐迁移到新 API。

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
