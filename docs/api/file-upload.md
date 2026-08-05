# FileUpload

**命名空间**: `zap\fileupload\FileUpload`

文件上传处理组件，提供文件验证、保存功能，支持单文件与多文件上传。

**相关类**: `zap\fileupload\UploadedFile` · `zap\fileupload\FileUploadException`

---

## 构造函数

### `__construct()`

```php
public function __construct()
```

创建 FileUpload 实例。

```php
$uploader = new FileUpload();
```

---

## 配置方法

### `setAllowedTypes(array $types): self`

```php
public function setAllowedTypes(array $types): self
```

设置允许的文件扩展名。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$types` | `string[]` | 扩展名数组，如 `['jpg', 'png', 'gif']`，不含点，大小写不敏感 |

**返回值**: `$this`

```php
$uploader->setAllowedTypes(['jpg', 'png', 'gif', 'pdf']);
```

---

### `getAllowedTypes(): array`

```php
public function getAllowedTypes(): array
```

获取当前允许的文件扩展名列表。

**返回值**: `string[]`

---

### `setAllowedMimes(array $mimes): self`

```php
public function setAllowedMimes(array $mimes): self
```

设置允许的 MIME 类型。可与 `setAllowedTypes` 同时使用，双重验证。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$mimes` | `string[]` | MIME 类型数组，如 `['image/jpeg', 'image/png']` |

**返回值**: `$this`

```php
$uploader->setAllowedMimes(['image/jpeg', 'image/png', 'application/pdf']);
```

---

### `getAllowedMimes(): array`

```php
public function getAllowedMimes(): array
```

获取当前允许的 MIME 类型列表。

**返回值**: `string[]`

---

### `setMaxSize(int $bytes): self`

```php
public function setMaxSize(int $bytes): self
```

设置最大文件大小。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$bytes` | `int` | 最大字节数，`0` 表示不限制 |

**返回值**: `$this`

```php
$uploader->setMaxSize(5 * 1024 * 1024); // 5MB
```

---

### `getMaxSize(): int`

```php
public function getMaxSize(): int
```

获取当前最大文件大小限制。

**返回值**: `int` — 字节数，`0` 表示不限制

---

### `setAutoRename(bool $autoRename): self`

```php
public function setAutoRename(bool $autoRename): self
```

设置是否自动重命名文件。启用后会在文件名后添加时间戳和随机字符串，避免覆盖。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$autoRename` | `bool` | 是否自动重命名，默认 `true` |

**返回值**: `$this`

```php
$uploader->setAutoRename(false); // 使用原始文件名
```

---

### `isAutoRename(): bool`

```php
public function isAutoRename(): bool
```

获取当前是否启用了自动重命名。

**返回值**: `bool`

---

### `setNameCallback(callable $callback): self`

```php
public function setNameCallback(callable $callback): self
```

设置文件名生成回调，用于自定义保存文件名（不含扩展名）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$callback` | `callable` | 签名 `function(UploadedFile $file, string $suggestedName): string` |

**返回值**: `$this`

```php
$uploader->setNameCallback(function ($file, $suggestedName) {
    return 'prefix_' . date('Ymd') . '_' . uniqid();
});
```

---

## 上传方法

### `upload(string $key, string $targetDir, ?string $name = null): UploadedFile`

```php
public function upload(string $key, string $targetDir, ?string $name = null): UploadedFile
```

上传单个文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 表单字段名 |
| `$targetDir` | `string` | 目标目录 |
| `$name` | `string\|null` | 保存的文件名（不含扩展名），`null` 使用原文件名 |

**返回值**: `UploadedFile`

**可能抛出**: `FileUploadException`

```php
$file = $uploader
    ->setAllowedTypes(['jpg', 'png'])
    ->upload('avatar', '/uploads');

$file = $uploader->upload('avatar', '/uploads', 'user_avatar');
```

---

### `uploadMultiple(string $key, string $targetDir, ?string $name = null): UploadedFile[]`

```php
public function uploadMultiple(string $key, string $targetDir, ?string $name = null): UploadedFile[]
```

上传多个文件。支持 `input name="files[]"` 形式的文件数组。自动跳过 `UPLOAD_ERR_NO_FILE` 的空条目。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 表单字段名 |
| `$targetDir` | `string` | 目标目录 |
| `$name` | `string\|null` | 保存的基础文件名（不含扩展名），每个文件会自动添加序号 |

**返回值**: `UploadedFile[]`

**可能抛出**: `FileUploadException`

```php
$files = $uploader
    ->setAllowedTypes(['jpg', 'png'])
    ->setMaxSize(10 * 1024 * 1024)
    ->uploadMultiple('photos', '/uploads');

foreach ($files as $file) {
    echo $file->getSavedPath();
}
```

---

## 结果获取

### `getFile(): ?UploadedFile`

```php
public function getFile(): ?UploadedFile
```

获取最近一次上传的第一个文件（单文件上传时使用）。

**返回值**: `UploadedFile|null`

---

### `getFiles(): UploadedFile[]`

```php
public function getFiles(): array
```

获取最近一次上传的所有文件。

**返回值**: `UploadedFile[]`

---

## 使用示例

### 基本上传

```php
use zap\fileupload\FileUpload;
use zap\fileupload\FileUploadException;

$uploader = new FileUpload();

try {
    $file = $uploader
        ->setAllowedTypes(['jpg', 'png', 'gif'])
        ->setMaxSize(5 * 1024 * 1024)
        ->upload('avatar', '/path/to/uploads');

    echo $file->getSavedPath();
} catch (FileUploadException $e) {
    echo '上传失败: ' . $e->getMessage();
}
```

### 多文件上传

```php
$files = $uploader->uploadMultiple('photos', '/path/to/uploads');

foreach ($files as $file) {
    echo $file->getClientOriginalName() . ' → ' . $file->getSavedPath() . "\n";
}
```

### 链式配置

```php
$file = (new FileUpload())
    ->setAllowedTypes(['jpg', 'png', 'gif', 'webp'])
    ->setAllowedMimes(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
    ->setMaxSize(10 * 1024 * 1024)
    ->setAutoRename(true)
    ->upload('image', '/uploads');
```

---

# UploadedFile

**命名空间**: `zap\fileupload\UploadedFile`

单个上传文件的封装对象。

---

## 构造函数

### `__construct(array $file)`

```php
public function __construct(array $file)
```

从 `$_FILES` 数组项创建实例。通常不建议直接调用，由 `UploadedFile::normalize()` 或 `FileUpload` 内部使用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$file` | `array` | `$_FILES` 单个元素的关联数组 |

---

## 属性访问

支持魔术属性只读访问：

| 属性 | 类型 | 说明 |
|------|------|------|
| `$file->name` | `string` | 客户端原始文件名 |
| `$file->tmpName` | `string` | 临时文件路径 |
| `$file->size` | `int` | 文件大小（字节） |
| `$file->mimeType` | `string` | 浏览器提供的 MIME 类型 |
| `$file->error` | `int` | 上传错误码 |
| `$file->extension` | `string` | 文件扩展名（小写，不含点） |

---

## 方法

### `getClientOriginalName(): string`

```php
public function getClientOriginalName(): string
```

获取客户端原始文件名。

**返回值**: `string`

---

### `getClientExtension(): string`

```php
public function getClientExtension(): string
```

获取文件扩展名（小写，不含点）。

**返回值**: `string`

---

### `getSize(): int`

```php
public function getSize(): int
```

获取文件大小（字节）。

**返回值**: `int`

---

### `getClientMimeType(): string`

```php
public function getClientMimeType(): string
```

获取浏览器提供的 MIME 类型。注意：该值由浏览器提供，不可完全信任。

**返回值**: `string`

---

### `getMimeType(): string`

```php
public function getMimeType(): string
```

通过服务器端检测获取真实 MIME 类型。优先使用 `mime_content_type()`，其次 `finfo_open()`。

**返回值**: `string`

---

### `getTmpName(): string`

```php
public function getTmpName(): string
```

获取临时文件路径。

**返回值**: `string`

---

### `getError(): int`

```php
public function getError(): int
```

获取上传错误码。

**返回值**: `int`

---

### `isValid(): bool`

```php
public function isValid(): bool
```

判断上传是否成功（无错误且为合法的上传文件）。

**返回值**: `bool`

---

### `getSavedPath(): ?string`

```php
public function getSavedPath(): ?string
```

获取文件移动后的保存路径。在上传成功前返回 `null`。

**返回值**: `string|null`

---

### `move(string $targetPath): bool`

```php
public function move(string $targetPath): bool
```

将上传的临时文件移动到目标路径。目标目录不存在时自动创建。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetPath` | `string` | 目标绝对路径（含文件名） |

**返回值**: `bool`

---

### `getErrorMessage(): string`

```php
public function getErrorMessage(): string
```

获取可读的中文错误消息。

**返回值**: `string`

| 错误码 | 消息 |
|--------|------|
| `UPLOAD_ERR_OK` | 上传成功。 |
| `UPLOAD_ERR_INI_SIZE` | 文件大小超过了 php.ini 中 upload_max_filesize 的限制。 |
| `UPLOAD_ERR_FORM_SIZE` | 文件大小超过了表单 MAX_FILE_SIZE 的限制。 |
| `UPLOAD_ERR_PARTIAL` | 文件仅被部分上传。 |
| `UPLOAD_ERR_NO_FILE` | 没有文件被上传。 |
| `UPLOAD_ERR_NO_TMP_DIR` | 服务器缺少临时文件夹。 |
| `UPLOAD_ERR_CANT_WRITE` | 文件写入磁盘失败。 |
| `UPLOAD_ERR_EXTENSION` | 文件上传被 PHP 扩展停止。 |

---

### `normalize(array $fileData): static[]`

```php
public static function normalize(array $fileData): static[]
```

将 `$_FILES` 数组标准化为 `UploadedFile[]`。处理单文件和多文件两种情况的差异。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$fileData` | `array` | `$_FILES` 中某个 key 对应的值 |

**返回值**: `UploadedFile[]`

```php
$files = UploadedFile::normalize($_FILES['photos']);
foreach ($files as $file) {
    if ($file->isValid()) {
        $file->move('/uploads/' . $file->getClientOriginalName());
    }
}
```

---

# FileUploadException

**命名空间**: `zap\fileupload\FileUploadException`

**继承**: `\RuntimeException`

文件上传异常类。

---

## 构造函数

### `__construct(string $message = '', int $code = 0, ?string $field = null, ?\Throwable $previous = null)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `$message` | `string` | 错误消息 |
| `$code` | `int` | 错误码 |
| `$field` | `string\|null` | 相关表单字段名 |
| `$previous` | `\Throwable\|null` | 前置异常 |

---

## 方法

### `getField(): ?string`

```php
public function getField(): ?string
```

获取引发异常的表单字段名。

**返回值**: `string|null`

```php
try {
    $file = $uploader->upload('avatar', '/uploads');
} catch (FileUploadException $e) {
    echo '字段 ' . $e->getField() . ' 上传失败: ' . $e->getMessage();
}
```
