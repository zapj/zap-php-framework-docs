# 图像处理

## 概述

Zap PHP Framework 内置了强大的图像处理类 `zap\image\Image`，支持图片的打开、编辑、滤镜、水印、文字渲染等操作。基于 GD 库实现，支持 JPEG、PNG、GIF 和 WebP 格式。

## 基本操作

### 打开图片

```php
use zap\image\Image;

// 从文件路径打开
$image = Image::open('/path/to/image.jpg');

// 从文件路径创建新实例
$image = new Image('/path/to/image.png');
```

### 保存图片

```php
$image = Image::open('photo.jpg');

// 保存到原路径（覆盖）
$image->save();

// 保存到新路径（可指定格式和质量）
$image->save('/path/to/output.jpg', 90);          // JPEG，质量 90
$image->save('/path/to/output.png', 9);            // PNG，压缩级别 9
$image->save('/path/to/output.webp', 80);          // WebP，质量 80
$image->save('/path/to/output.gif');               // GIF

// 保存并返回文件大小
$size = $image->save('/path/to/thumb.jpg', 85);
echo "文件大小: {$size} 字节";
```

### 获取图片信息

```php
$image = Image::open('photo.jpg');

// 宽度和高度
$width = $image->width();
$height = $image->height();

// 获取 MIME 类型
$mime = $image->mime();  // image/jpeg, image/png 等

// 获取原始图像资源（GD resource）
$resource = $image->getImageResource();
```

## 尺寸调整

### resize() - 缩放

```php
$image = Image::open('photo.jpg');

// 按宽度缩放（高度等比例）
$image->resize(800, null);

// 按高度缩放（宽度等比例）
$image->resize(null, 600);

// 按宽高缩放（可能拉伸）
$image->resize(800, 600);

// 保持比例缩放（不拉伸，缩放后适应指定尺寸）
$image->resize(800, 600, function($constraint) {
    $constraint->aspectRatio();     // 保持宽高比
    $constraint->upsize();          // 防止放大
});

// 保存
$image->save('resized.jpg', 85);
```

### crop() - 裁剪

```php
// 从 (x, y) 开始裁剪指定宽高
$image->crop(400, 300, 100, 50);
// 结果: 从 (100, 50) 开始，裁剪 400x300 的区域

// 居中裁剪
$width = $image->width();
$height = $image->height();
$size = min($width, $height);
$x = ($width - $size) / 2;
$y = ($height - $size) / 2;
$image->crop($size, $size, $x, $y); // 正方形居中裁剪

$image->save('cropped.jpg');
```

### fit() - 自适应裁剪

`fit()` 会缩放图片使其完全覆盖目标尺寸，然后居中裁剪多余部分：

```php
// 将图片调整为 400x300，自动缩放并居中裁剪
$image->fit(400, 300);

// 带位置参数
$image->fit(400, 300, function($constraint) {
    $constraint->upsize(); // 不放大
}, 'center'); // 居中

$image->save('fitted.jpg');
```

### fill() - 填充

```php
// 将图片放入指定画布，空白区域用颜色填充
$image->fill(800, 600, '#ffffff'); // 白色背景

// 透明背景（PNG）
$image->fill(800, 600, [255, 255, 255, 0]);

$image->save('filled.png');
```

### canvas() - 扩展画布

```php
// 扩展画布尺寸，原图居中，空白区域透明
$image->canvas(1000, 800);

// 指定背景色
$image->canvas(1000, 800, '#000000');

$image->save('canvas.jpg');
```

### thumb() - 缩略图

```php
// 生成 200x200 的缩略图
$image->thumb(200, 200);
$image->save('thumb.jpg');
```

### square() - 正方形裁剪

```php
// 从中心裁剪为正方形
$image->square(300);
// 等价于 fit(300, 300)

$image->save('square.jpg');
```

## 旋转与翻转

```php
$image = Image::open('photo.jpg');

// 旋转（顺时针角度）
$image->rotate(90);   // 顺时针 90 度
$image->rotate(180);  // 旋转 180 度
$image->rotate(270);  // 顺时针 270 度（等同于逆时针 90 度）
$image->rotate(-45);  // 逆时针 45 度

// 水平翻转（镜像）
$image->flip();

// 垂直翻转
$image->flop();

// 根据 EXIF 信息自动旋转
$image->orient();
// 读取照片的 EXIF Orientation 标签，自动纠正方向
// 适用于手机拍摄的照片

$image->save('rotated.jpg');
```

## 滤镜效果

Zap Image 类提供了 14 种内置滤镜：

### grayscale() - 灰度

```php
$image->grayscale();
```

### invert() - 反色

```php
$image->invert();
```

### blur() - 模糊

```php
// 高斯模糊，参数为模糊强度（1-100）
$image->blur(15);  // 轻度模糊
$image->blur(50);  // 中度模糊
$image->blur(100); // 高度模糊
```

### pixelate() - 像素化

```php
// 像素化效果，参数为像素块大小
$image->pixelate(10);  // 10px 像素块
$image->pixelate(20);  // 20px 像素块
```

### sepia() - 复古

```php
$image->sepia();
```

### brightness() - 亮度

```php
// 正值增加亮度，负值降低亮度（范围 -100 到 100）
$image->brightness(30);   // 增加亮度
$image->brightness(-20);  // 降低亮度
```

### contrast() - 对比度

```php
// 正值增加对比度，负值降低对比度（范围 -100 到 100）
$image->contrast(20);    // 增加对比度
$image->contrast(-15);   // 降低对比度
```

### opacity() - 透明度

```php
// 设置透明度（0=完全透明，100=完全不透明）
$image->opacity(50);  // 半透明
$image->opacity(80);  // 20% 透明
```

### sharpen() - 锐化

```php
// 锐化效果
$image->sharpen();
// 可多次调用增强效果
$image->sharpen()->sharpen();
```

### edge() - 边缘检测

```php
$image->edge();
```

### emboss() - 浮雕

```php
$image->emboss();
```

### colorize() - 着色

```php
// 使用 RGB 颜色对图像着色
$image->colorize(255, 0, 0);     // 红色调
$image->colorize(0, 100, 200);   // 蓝色调
$image->colorize(100, 200, 50);  // 绿色调
```

### 滤镜链式调用

```php
$image = Image::open('photo.jpg');

// 组合多个滤镜
$image->grayscale()
    ->brightness(15)
    ->contrast(25)
    ->sharpen();

$image->save('processed.jpg');

// 复古风格
$image = Image::open('photo.jpg')
    ->sepia()
    ->contrast(10)
    ->brightness(-5);

$image->save('vintage.jpg');
```

## 水印

### 图片水印

```php
$image = Image::open('photo.jpg');
$watermark = Image::open('logo.png');

// 添加水印（指定位置和透明度）
$image->watermark($watermark, 'bottom-right', 50);  // 右下角，50% 透明度
$image->watermark($watermark, 'center', 30);         // 居中，30% 透明度
$image->watermark($watermark, 'top-left', 80);       // 左上角，80% 透明度

// 位置参数可选值：
// 'top-left', 'top', 'top-right'
// 'left', 'center', 'right'
// 'bottom-left', 'bottom', 'bottom-right'

// 自定义位置（像素偏移）
$image->watermark($watermark, [10, 10], 50);  // 距左上角 (10, 10)

$image->save('watermarked.jpg', 90);
```

### 文字水印

```php
$image = Image::open('photo.jpg');

// 添加文字（TTF 字体）
$image->text(
    'Copyright 2026',           // 文字内容
    14,                          // 字体大小
    '/path/to/font.ttf',         // TTF 字体文件路径
    '#ffffff',                   // 文字颜色
    'bottom-right',              // 位置
    10,                          // X 偏移（像素）
    10                           // Y 偏移（像素）
);

// 带透明度的文字
$image->text(
    'Watermark Text',
    20,
    '/path/to/font.ttf',
    [255, 255, 255, 0.3],       // RGBA 颜色
    'center',
    0,
    0
);

$image->save('text-watermark.jpg');
```

## WebP 格式

```php
// 转换为 WebP
$image = Image::open('photo.jpg');
$image->save('photo.webp', 80);  // 质量 80

// 从 WebP 打开
$image = Image::open('photo.webp');

// 批量转换为 WebP
$files = glob('uploads/*.{jpg,jpeg,png}', GLOB_BRACE);
foreach ($files as $file) {
    $image = Image::open($file);
    $webpPath = preg_replace('/\.(jpe?g|png)$/i', '.webp', $file);
    $image->save($webpPath, 80);
}
```

## Base64 输出

```php
$image = Image::open('photo.jpg');

// 输出为 Base64 编码（用于内联图片）
$base64 = $image->toBase64();
// data:image/jpeg;base64,/9j/4AAQSkZJRg...

// 可直接用于 HTML
echo '<img src="' . $base64 . '" alt="Photo">';

// 或用于 JSON API
return response()->json([
    'image' => $image->toBase64(),
]);
```

## EXIF 自动方向纠正

手机拍摄的照片可能包含 EXIF Orientation 信息，`orient()` 方法会自动根据 EXIF 数据旋转图片：

```php
// 上传手机照片后自动纠正方向
$image = Image::open($uploadedFile);
$image->orient();  // 读取 EXIF 并自动旋转
$image->resize(1200, null);  // 限制宽度
$image->save('corrected.jpg', 85);
```

## 完整示例

### 用户头像处理

```php
<?php

namespace App\Services;

use zap\image\Image;

class AvatarService
{
    /**
     * 处理用户上传的头像
     */
    public function process($uploadedFile, $userId)
    {
        $image = Image::open($uploadedFile);

        // 1. 根据 EXIF 自动纠正方向
        $image->orient();

        // 2. 裁剪为正方形（取中心）
        $size = min($image->width(), $image->height());
        $image->fit($size, $size);

        // 3. 生成不同尺寸
        $basePath = storage_path("avatars/{$userId}");

        // 原始尺寸（最大 800px）
        $image->resize(800, 800, function($c) { $c->upsize(); });
        $image->save("{$basePath}/original.jpg", 90);

        // 中等尺寸 200x200
        $image->fit(200, 200);
        $image->save("{$basePath}/medium.jpg", 85);

        // 小尺寸 64x64
        $image->fit(64, 64);
        $image->save("{$basePath}/small.jpg", 80);

        return [
            'original' => url("storage/avatars/{$userId}/original.jpg"),
            'medium'   => url("storage/avatars/{$userId}/medium.jpg"),
            'small'    => url("storage/avatars/{$userId}/small.jpg"),
        ];
    }
}
```

### 商品图片处理（加水印 + 多尺寸）

```php
class ProductImageService
{
    public function process($uploadedFile, $productId)
    {
        $image = Image::open($uploadedFile);
        $image->orient();

        $basePath = storage_path("products/{$productId}");
        if (!is_dir($basePath)) {
            mkdir($basePath, 0755, true);
        }

        // 主图（1200px 宽）
        $mainImage = clone $image;
        $mainImage->resize(1200, null);
        $mainImage->save("{$basePath}/main.jpg", 90);

        // 带水印的主图
        $watermark = Image::open(assets_path('images/watermark.png'));
        $mainImage->watermark($watermark, 'bottom-right', 40);
        $mainImage->save("{$basePath}/main_watermarked.jpg", 90);

        // 缩略图 400x400
        $thumb = clone $image;
        $thumb->fit(400, 400);
        $thumb->save("{$basePath}/thumb.jpg", 85);

        // WebP 版本
        $thumb->save("{$basePath}/thumb.webp", 80);

        return [
            'main'       => url("storage/products/{$productId}/main.jpg"),
            'thumb'      => url("storage/products/{$productId}/thumb.jpg"),
            'thumb_webp' => url("storage/products/{$productId}/thumb.webp"),
        ];
    }
}
```

### 批量添加滤镜

```php
public function applyFilter($imagePath, $filter, $params = [])
{
    $image = Image::open($imagePath);

    switch ($filter) {
        case 'grayscale':
            $image->grayscale();
            break;
        case 'sepia':
            $image->sepia();
            break;
        case 'vintage':
            $image->sepia()->contrast(15)->brightness(-10);
            break;
        case 'blur':
            $image->blur($params['amount'] ?? 30);
            break;
        case 'pixelate':
            $image->pixelate($params['size'] ?? 10);
            break;
        case 'sharpen':
            $image->sharpen();
            break;
        case 'dramatic':
            $image->contrast(30)->brightness(-5)->sharpen();
            break;
    }

    $outputPath = dirname($imagePath) . '/filtered_' . basename($imagePath);
    $image->save($outputPath, 90);

    return $outputPath;
}
```

### 图片验证与压缩

```php
public function validateAndCompress($file, $maxWidth = 1920, $quality = 85)
{
    // 验证文件类型
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $mime = mime_content_type($file);

    if (!in_array($mime, $allowedTypes)) {
        throw new \Exception('不支持的图片格式');
    }

    // 验证文件大小（10MB 限制）
    if (filesize($file) > 10 * 1024 * 1024) {
        throw new \Exception('图片大小不能超过 10MB');
    }

    // 压缩处理
    $image = Image::open($file);
    $image->orient();

    // 限制最大宽度
    if ($image->width() > $maxWidth) {
        $image->resize($maxWidth, null);
    }

    // 保存压缩后的图片
    $image->save($file, $quality);

    return [
        'width'  => $image->width(),
        'height' => $image->height(),
        'size'   => filesize($file),
        'mime'   => $mime,
    ];
}
```

## 滤镜效果速查

| 滤镜 | 方法 | 参数 |
|------|------|------|
| 灰度 | `grayscale()` | 无 |
| 反色 | `invert()` | 无 |
| 模糊 | `blur($amount)` | 强度 1-100 |
| 像素化 | `pixelate($size)` | 像素块大小 |
| 复古 | `sepia()` | 无 |
| 亮度 | `brightness($level)` | -100 到 100 |
| 对比度 | `contrast($level)` | -100 到 100 |
| 透明度 | `opacity($level)` | 0 到 100 |
| 锐化 | `sharpen()` | 无 |
| 边缘检测 | `edge()` | 无 |
| 浮雕 | `emboss()` | 无 |
| 着色 | `colorize($r, $g, $b)` | RGB 值 |

## 最佳实践

1. **使用 WebP 格式**：相比 JPEG/PNG，WebP 在同等质量下文件更小
2. **限制图片尺寸**：上传时限制最大宽度（如 1920px），避免存储超大图片
3. **生成多尺寸**：根据使用场景生成不同尺寸的版本
4. **使用 CDN**：将处理后的图片托管到 CDN 加速访问
5. **处理 EXIF 方向**：上传照片时始终调用 `orient()` 纠正方向
6. **添加水印**：对公开显示的图片添加水印保护版权
7. **异步处理**：对于大量图片的处理，建议使用队列异步执行
