# 文件上传

## 概述

Zap PHP Framework 内置了 `zap\fileupload\FileUpload` 文件上传组件，提供文件上传处理、验证和保存功能。支持单文件与多文件上传，内置类型检查、大小限制和自动重命名。

相比直接使用 `$_FILES` 或 `Request::file()`，FileUpload 组件提供了更完善的验证体系、链式配置接口和异常处理。

## 基本使用

### 单文件上传

```php
use zap\fileupload\FileUpload;
use zap\fileupload\FileUploadException;

$uploader = new FileUpload();

try {
    // 设置限制
    $uploader->setAllowedTypes(['jpg', 'png', 'gif', 'pdf']);
    $uploader->setMaxSize(5 * 1024 * 1024); // 5MB

    // 上传文件
    $file = $uploader->upload('avatar', '/path/to/uploads');

    // 获取信息
    echo $file->getSavedPath();          // /path/to/uploads/avatar_20260805_1a2b3c.jpg
    echo $file->getClientOriginalName(); // photo.jpg
    echo $file->getSize();               // 245760
    echo $file->getClientExtension();    // jpg

} catch (FileUploadException $e) {
    echo '上传失败: ' . $e->getMessage();
    echo '相关字段: ' . $e->getField();
}
```

HTML 表单示例：

```html
<form method="post" enctype="multipart/form-data">
    <input type="file" name="avatar">
    <button type="submit">上传</button>
</form>
```

### 多文件上传

```php
$uploader = new FileUpload();
$uploader->setAllowedTypes(['jpg', 'png']);
$uploader->setMaxSize(10 * 1024 * 1024); // 10MB

// 上传多个文件
$files = $uploader->uploadMultiple('photos', '/path/to/uploads');

foreach ($files as $file) {
    echo $file->getClientOriginalName() . ' → ' . $file->getSavedPath() . "\n";
}

// 获取所有保存的文件
$allFiles = $uploader->getFiles();
```

HTML 表单示例：

```html
<form method="post" enctype="multipart/form-data">
    <input type="file" name="photos[]" multiple>
    <button type="submit">上传</button>
</form>
```

## 文件验证

### 扩展名验证

```php
$uploader->setAllowedTypes(['jpg', 'jpeg', 'png', 'gif', 'webp']);
```

扩展名不区分大小写，通过 `pathinfo()` 从原始文件名中提取。

### MIME 类型验证

```php
// 仅通过服务器端检测的真实 MIME 类型验证
$uploader->setAllowedMimes([
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
]);
```

MIME 验证优先使用 `mime_content_type()` 检测服务器端文件，比浏览器提供的类型更可靠。

### 双重验证（建议）

```php
// 同时限制扩展名和 MIME 类型
$uploader
    ->setAllowedTypes(['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'])
    ->setAllowedMimes([
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
```

### 文件大小限制

```php
$uploader->setMaxSize(2 * 1024 * 1024);  // 2MB
$uploader->setMaxSize(10 * 1024 * 1024); // 10MB
$uploader->setMaxSize(0);                 // 不限制
```

## 文件名处理

### 自动重命名（默认）

默认启用，在文件名后添加时间戳和随机字符串，防止文件名冲突：

```php
// avatar.jpg → avatar_20260806_a1b2c3.jpg
$file = $uploader->upload('avatar', '/uploads');
```

### 禁用自动重命名

```php
$uploader->setAutoRename(false);
$file = $uploader->upload('avatar', '/uploads');
// 使用原始文件名，注意同名文件会被覆盖
```

### 自定义保存名称

```php
// 指定基础名称，扩展名自动保留
$file = $uploader->upload('avatar', '/uploads', 'user_123_avatar');
// 结果: user_123_avatar_20260806_a1b2c3.jpg

// 结合禁用自动重命名
$uploader->setAutoRename(false);
$file = $uploader->upload('avatar', '/uploads', 'user_123_avatar');
// 结果: user_123_avatar.jpg
```

### 自定义命名回调

```php
$uploader->setNameCallback(function (UploadedFile $file, string $suggestedName): string {
    // $suggestedName: 原始文件名（不含扩展名）或通过 upload() 指定的名称
    return 'img_' . date('Ymd') . '_' . bin2hex(random_bytes(4));
});

$file = $uploader->upload('photo', '/uploads');
// 结果: img_20260806_a1b2c3d4.jpg
```

## 异常处理

FileUpload 组件使用 `FileUploadException` 统一处理所有上传错误：

```php
use zap\fileupload\FileUpload;
use zap\fileupload\FileUploadException;

$uploader = new FileUpload();

try {
    $file = $uploader
        ->setAllowedTypes(['jpg', 'png'])
        ->setMaxSize(5 * 1024 * 1024)
        ->upload('avatar', '/uploads');

} catch (FileUploadException $e) {
    // $e->getMessage() — 可读的中文错误消息
    // $e->getField()   — 相关的表单字段名
    // $e->getCode()    — PHP 上传错误码

    return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'field'   => $e->getField(),
    ]);
}
```

### 常见异常场景

| 异常消息 | 原因 |
|----------|------|
| 上传字段 'xxx' 不存在 | 表单中没有该字段名 |
| 文件大小 XMB 超过了限制 XMB | 文件超过 setMaxSize 限制 |
| 不允许的文件类型 'xxx' | 扩展名不在允许列表中 |
| 不允许的 MIME 类型 'xxx' | MIME 类型不在允许列表中 |
| 文件大小超过了 php.ini 限制 | 超过 php.ini upload_max_filesize |
| 文件仅被部分上传 | 网络中断或其他原因 |
| 没有文件被上传 | 用户未选择文件 |

## UploadedFile 对象

上传成功后返回的 `UploadedFile` 对象封装了文件的所有信息：

```php
$file = $uploader->upload('file', '/uploads');

// 基本属性（魔术属性，只读）
$file->name;       // string   原始文件名
$file->tmpName;    // string   临时文件路径
$file->size;       // int      文件大小（字节）
$file->mimeType;   // string   浏览器提供的 MIME 类型
$file->error;      // int      上传错误码
$file->extension;  // string   扩展名（小写，不含点）

// 方法
$file->getClientOriginalName();  // 原始文件名
$file->getClientExtension();     // 扩展名（小写）
$file->getSize();                 // 文件大小
$file->getClientMimeType();      // 浏览器 MIME
$file->getMimeType();            // 服务器检测的真实 MIME
$file->getTmpName();             // 临时路径
$file->getError();               // 错误码
$file->isValid();                // 是否上传成功
$file->getErrorMessage();        // 可读错误消息
$file->getSavedPath();           // 最终保存路径
```

## 错误码说明

| 错误码 | 常量 | 说明 |
|--------|------|------|
| 0 | `UPLOAD_ERR_OK` | 上传成功 |
| 1 | `UPLOAD_ERR_INI_SIZE` | 超过 php.ini `upload_max_filesize` |
| 2 | `UPLOAD_ERR_FORM_SIZE` | 超过表单 `MAX_FILE_SIZE` |
| 3 | `UPLOAD_ERR_PARTIAL` | 文件仅部分上传 |
| 4 | `UPLOAD_ERR_NO_FILE` | 没有文件被上传 |
| 6 | `UPLOAD_ERR_NO_TMP_DIR` | 服务器缺少临时文件夹 |
| 7 | `UPLOAD_ERR_CANT_WRITE` | 文件写入磁盘失败 |
| 8 | `UPLOAD_ERR_EXTENSION` | 文件上传被 PHP 扩展停止 |

## 完整示例

### 用户头像上传

```php
use zap\fileupload\FileUpload;
use zap\fileupload\FileUploadException;
use zap\image\Image;

class AvatarController
{
    public function upload($userId)
    {
        $uploader = new FileUpload();

        try {
            // 1. 验证并保存原始文件
            $file = $uploader
                ->setAllowedTypes(['jpg', 'jpeg', 'png', 'gif', 'webp'])
                ->setMaxSize(10 * 1024 * 1024)
                ->setAutoRename(false)
                ->upload('avatar', '/public/uploads/avatars', "user_{$userId}");

            $savedPath = $file->getSavedPath();

            // 2. 使用 Image 组件处理图片
            $image = new Image($savedPath);
            $image->orient(); // 修正 EXIF 方向

            // 生成缩略图
            $image->copy()
                ->fit(200, 200)
                ->save('/public/uploads/avatars/thumb_' . basename($savedPath));

            $image->copy()
                ->fit(80, 80)
                ->save('/public/uploads/avatars/small_' . basename($savedPath));

            return [
                'success' => true,
                'path'    => $savedPath,
                'thumb'   => '/uploads/avatars/thumb_' . basename($savedPath),
            ];

        } catch (FileUploadException $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
```

### 文档上传

```php
$uploader = new FileUpload();

try {
    $file = $uploader
        ->setAllowedTypes(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])
        ->setAllowedMimes([
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ])
        ->setMaxSize(20 * 1024 * 1024) // 20MB
        ->upload('document', '/uploads/documents');

    echo '文档已保存: ' . $file->getSavedPath();
    echo '原始文件名: ' . $file->getClientOriginalName();
    echo '文件大小: ' . round($file->getSize() / 1024, 2) . ' KB';

} catch (FileUploadException $e) {
    echo '文档上传失败: ' . $e->getMessage();
}
```

### 批量图片上传（含缩略图生成）

```php
$uploader = new FileUpload();

try {
    $files = $uploader
        ->setAllowedTypes(['jpg', 'jpeg', 'png', 'gif', 'webp'])
        ->setAllowedMimes(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
        ->setMaxSize(10 * 1024 * 1024)
        ->uploadMultiple('photos', '/uploads/gallery');

    $results = [];
    foreach ($files as $file) {
        $savedPath = $file->getSavedPath();

        // 生成缩略图
        $image = new Image($savedPath);
        $thumbPath = dirname($savedPath) . '/thumb_' . basename($savedPath);
        $image->fit(300, 200)->save($thumbPath, 80);

        $results[] = [
            'original' => $file->getClientOriginalName(),
            'path'     => $savedPath,
            'thumb'    => $thumbPath,
            'size'     => $file->getSize(),
        ];
    }

    return ['success' => true, 'files' => $results];

} catch (FileUploadException $e) {
    return ['success' => false, 'message' => $e->getMessage()];
}
```

### 链式配置的最佳实践

```php
// 推荐：将配置封装为可复用的工厂方法
function createImageUploader(int $maxSizeMB = 10): FileUpload
{
    $maxSize = $maxSizeMB * 1024 * 1024;

    return (new FileUpload())
        ->setAllowedTypes(['jpg', 'jpeg', 'png', 'gif', 'webp'])
        ->setAllowedMimes(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
        ->setMaxSize($maxSize)
        ->setAutoRename(true);
}

// 使用
$uploader = createImageUploader(5);
$file = $uploader->upload('photo', '/uploads');
```

## 与原生方式对比

| 特性 | `$_FILES` 直接操作 | `FileUpload` 组件 |
|------|-------------------|------------------|
| 类型验证 | 手动实现 | `setAllowedTypes()` |
| MIME 验证 | 手动检测 | `setAllowedMimes()`，自动检测 |
| 大小验证 | 手动比较 | `setMaxSize()`，友好提示 |
| 文件名安全 | 手动清理 | 自动清理 + 自动重命名 |
| 错误处理 | 手动判断 errcode | 统一 `FileUploadException` |
| 多文件上传 | 手动循环 | `uploadMultiple()` 自动处理 |
| 中文错误消息 | 自行翻译 | 内置中文消息 |

## 最佳实践

1. **始终使用 try-catch**：上传操作可能因各种原因失败，务必用 `try-catch` 包裹
2. **双重验证**：同时使用 `setAllowedTypes()` 和 `setAllowedMimes()` 更安全
3. **保留原始文件名**：可在数据库中同时存储原始文件名和保存后的路径
4. **使用自动重命名**：避免文件名冲突，防止路径遍历攻击
5. **限制文件大小**：防止服务器资源耗尽
6. **目录权限**：确保目标目录对 PHP 进程可写
7. **配合 Image 组件**：上传图片后可自动生成缩略图、修正方向等
