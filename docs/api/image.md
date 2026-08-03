# Image

**命名空间**: `zap\image\Image`

图片处理类，基于 GD 库提供图片的打开、编辑、裁剪、缩放、滤镜、水印、文字等功能。

---

## 构造函数 / 工厂

### `open(string $filename): Image`

```php
public static function open(string $filename): self
```

打开一个图片文件并创建 Image 实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filename` | `string` | 图片文件路径 |

**返回值**: `Image`

**示例**:
```php
$image = Image::open('/path/to/photo.jpg');
```

---

## 保存与输出

### `save(string $filename = null, int $quality = null): Image`

```php
public function save(string $filename = null, int $quality = null): self
```

保存图片到文件。如果未指定文件名，覆盖原文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filename` | `string` | 保存路径，默认覆盖原文件 |
| `$quality` | `int` | 图片质量（0-100），仅 JPEG |

**返回值**: `$this`

**示例**:
```php
$image->resize(800, 600)->save('/path/to/thumb.jpg', 85);
```

---

### `toBase64(string $format = 'png'): string`

```php
public function toBase64(string $format = 'png'): string
```

将图片输出为 Base64 编码字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$format` | `string` | 输出格式（`png`、`jpg`、`gif`） |

**返回值**: `string`

**示例**:
```php
$base64 = $image->toBase64('png');
echo '<img src="data:image/png;base64,' . $base64 . '">';
```

---

### `setOutputFormat(string $format): Image`

```php
public function setOutputFormat(string $format): self
```

设置输出格式。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$format` | `string` | 格式：`png`、`jpg`、`gif`、`webp` |

**返回值**: `$this`

---

### `setQuality(int $quality): Image`

```php
public function setQuality(int $quality): self
```

设置输出质量（JPEG/WebP）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$quality` | `int` | 质量 0-100 |

**返回值**: `$this`

---

## 尺寸调整

### `resize(int $width, int $height, bool $keepRatio = false): Image`

```php
public function resize(int $width, int $height, bool $keepRatio = false): self
```

调整图片尺寸。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$width` | `int` | 目标宽度（像素） |
| `$height` | `int` | 目标高度（像素） |
| `$keepRatio` | `bool` | 是否保持宽高比 |

**返回值**: `$this`

**示例**:
```php
// 缩放到固定尺寸
$image->resize(800, 600);

// 保持比例缩放到宽度 800
$image->resize(800, 600, true);
```

---

### `crop(int $width, int $height, int $x = 0, int $y = 0): Image`

```php
public function crop(int $width, int $height, int $x = 0, int $y = 0): self
```

裁剪图片。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$width` | `int` | 裁剪宽度 |
| `$height` | `int` | 裁剪高度 |
| `$x` | `int` | 裁剪起始 X 坐标 |
| `$y` | `int` | 裁剪起始 Y 坐标 |

**返回值**: `$this`

**示例**:
```php
// 从 (100, 50) 开始裁剪 400x300 区域
$image->crop(400, 300, 100, 50);
```

---

### `canvas(int $width, int $height, array $bgColor = [255, 255, 255]): Image`

```php
public function canvas(int $width, int $height, array $bgColor = [255, 255, 255]): self
```

创建指定尺寸的画布。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$width` | `int` | 画布宽度 |
| `$height` | `int` | 画布高度 |
| `$bgColor` | `array` | 背景色 `[R, G, B]` 或 `[R, G, B, A]` |

**返回值**: `$this`

---

### `fit(int $width, int $height, string $position = 'center'): Image`

```php
public function fit(int $width, int $height, string $position = 'center'): self
```

按目标尺寸裁剪并居中（先缩放再裁剪，确保填满指定尺寸）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$width` | `int` | 目标宽度 |
| `$height` | `int` | 目标高度 |
| `$position` | `string` | 裁剪位置：`center`、`top`、`bottom`、`left`、`right`、`top-left`、`top-right`、`bottom-left`、`bottom-right` |

**返回值**: `$this`

**示例**:
```php
// 生成 200x200 的缩略图
$image->fit(200, 200, 'center');
```

---

### `fill(int $width, int $height, array $bgColor = [255, 255, 255]): Image`

```php
public function fill(int $width, int $height, array $bgColor = [255, 255, 255]): self
```

将图片放入指定尺寸的容器中，空白处用背景色填充（保持比例）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$width` | `int` | 容器宽度 |
| `$height` | `int` | 容器高度 |
| `$bgColor` | `array` | 背景色 |

**返回值**: `$this`

---

### `thumb(int $width, int $height = null): Image`

```php
public function thumb(int $width, int $height = null): self
```

生成缩略图（便捷方法）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$width` | `int` | 缩略图宽度 |
| `$height` | `int` | 缩略图高度（可选） |

**返回值**: `$this`

---

### `square(int $size): Image`

```php
public function square(int $size): self
```

将图片裁剪为正方形。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$size` | `int` | 正方形边长 |

**返回值**: `$this`

**示例**:
```php
$image->square(300)->save('/path/to/avatar.jpg');
```

---

## 旋转与翻转

### `rotate(float $angle, array $bgColor = [0, 0, 0]): Image`

```php
public function rotate(float $angle, array $bgColor = [0, 0, 0]): self
```

旋转图片。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$angle` | `float` | 旋转角度（逆时针） |
| `$bgColor` | `array` | 旋转后空白区域的背景色 |

**返回值**: `$this`

**示例**:
```php
$image->rotate(90);    // 逆时针旋转 90 度
$image->rotate(-45);   // 顺时针旋转 45 度
```

---

### `flip(string $mode = 'horizontal'): Image`

```php
public function flip(string $mode = 'horizontal'): self
```

翻转图片。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$mode` | `string` | `horizontal`（水平）或 `vertical`（垂直） |

**返回值**: `$this`

---

### `flop(): Image`

```php
public function flop(): self
```

水平翻转图片（等同于 `flip('horizontal')`）。

**返回值**: `$this`

---

### `orient(): Image`

```php
public function orient(): self
```

根据 EXIF 方向信息自动旋转图片（解决手机拍照方向问题）。

**返回值**: `$this`

**示例**:
```php
// 上传后自动修正方向
$image = Image::open($uploadedFile)->orient()->save($targetPath);
```

---

## 滤镜

Image 类提供 14 种图片滤镜效果：

### `brightness(int $level): Image`

```php
public function brightness(int $level): self
```

调整亮度。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$level` | `int` | 亮度值（-255 到 255，0 为原始） |

---

### `contrast(int $level): Image`

```php
public function contrast(int $level): self
```

调整对比度。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$level` | `int` | 对比度值（-100 到 100） |

---

### `gamma(float $correction): Image`

```php
public function gamma(float $correction): self
```

Gamma 校正。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$correction` | `float` | Gamma 值 |

---

### `colorize(int $red, int $green, int $blue): Image`

```php
public function colorize(int $red, int $green, int $blue): self
```

着色。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$red` | `int` | 红色分量 |
| `$green` | `int` | 绿色分量 |
| `$blue` | `int` | 蓝色分量 |

---

### `grayscale(): Image`

```php
public function grayscale(): self
```

转为灰度图。

---

### `greyscale(): Image`

```php
public function greyscale(): self
```

转为灰度图（同 `grayscale()`）。

---

### `invert(): Image`

```php
public function invert(): self
```

反色效果。

---

### `pixelate(int $blockSize = 10): Image`

```php
public function pixelate(int $blockSize = 10): self
```

像素化效果（马赛克）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$blockSize` | `int` | 块大小，越大越模糊 |

---

### `blur(int $type = IMG_FILTER_GAUSSIAN_BLUR): Image`

```php
public function blur(int $type = IMG_FILTER_GAUSSIAN_BLUR): self
```

模糊效果。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$type` | `int` | 模糊类型（`IMG_FILTER_GAUSSIAN_BLUR` 或 `IMG_FILTER_SELECTIVE_BLUR`） |

---

### `sharpen(int $level = 10): Image`

```php
public function sharpen(int $level = 10): self
```

锐化效果。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$level` | `int` | 锐化级别 |

---

### `edgeDetect(): Image`

```php
public function edgeDetect(): self
```

边缘检测。

---

### `emboss(): Image`

```php
public function emboss(): self
```

浮雕效果。

---

### `meanRemoval(): Image`

```php
public function meanRemoval(): self
```

均值移除（素描效果）。

---

### `smooth(int $level): Image`

```php
public function smooth(int $level): self
```

平滑效果。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$level` | `int` | 平滑级别 |

---

### `negate(): Image`

```php
public function negate(): self
```

反转颜色（同 `invert()`）。

---

## 水印与文字

### `watermark(string $watermarkPath, string $position = 'bottom-right', int $opacity = 50, int $margin = 10): Image`

```php
public function watermark(string $watermarkPath, string $position = 'bottom-right', int $opacity = 50, int $margin = 10): self
```

添加图片水印。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$watermarkPath` | `string` | 水印图片路径 |
| `$position` | `string` | 位置：`top-left`、`top-right`、`bottom-left`、`bottom-right`、`center` |
| `$opacity` | `int` | 透明度 0-100 |
| `$margin` | `int` | 边距（像素） |

**返回值**: `$this`

**示例**:
```php
$image->watermark('/path/to/logo.png', 'bottom-right', 30, 20);
```

---

### `ttfText(string $text, string $fontFile, int $size, string $color, int $x, int $y, int $angle = 0): Image`

```php
public function ttfText(string $text, string $fontFile, int $size, string $color, int $x, int $y, int $angle = 0): self
```

添加 TrueType 文字。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$text` | `string` | 文字内容 |
| `$fontFile` | `string` | TTF 字体文件路径 |
| `$size` | `int` | 字体大小 |
| `$color` | `string` | 颜色（十六进制，如 `#FF0000`） |
| `$x` | `int` | X 坐标 |
| `$y` | `int` | Y 坐标 |
| `$angle` | `int` | 旋转角度 |

**返回值**: `$this`

**示例**:
```php
$image->ttfText('Hello World', '/fonts/arial.ttf', 24, '#FFFFFF', 100, 50);
```

---

## 工具方法

### `width(): int`

```php
public function width(): int
```

获取图片宽度。

**返回值**: `int`

---

### `height(): int`

```php
public function height(): int
```

获取图片高度。

**返回值**: `int`

---

### `copy(): Image`

```php
public function copy(): self
```

创建当前图片的副本（深拷贝）。

**返回值**: `Image`

---

### `destroy(): void`

```php
public function destroy(): void
```

销毁图片资源，释放内存。

**返回值**: `void`

---

### `html2rgb(string $color): array`

```php
public static function html2rgb(string $color): array
```

将 HTML 颜色值（如 `#FF0000`、`rgb(255,0,0)`）转为 RGB 数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$color` | `string` | HTML 颜色字符串 |

**返回值**: `array` — `[R, G, B]`

**示例**:
```php
$rgb = Image::html2rgb('#FF6600');     // [255, 102, 0]
$rgb = Image::html2rgb('rgb(0,128,0)'); // [0, 128, 0]
```

---

## 使用示例

### 基本图片处理

```php
use zap\image\Image;

// 打开并缩放
$image = Image::open('photo.jpg');
$image->resize(800, 600, true)->save('photo_thumb.jpg', 90);

// 裁剪头像
Image::open('avatar.jpg')
    ->fit(200, 200, 'center')
    ->save('avatar_200.jpg');

// 正方形裁剪
Image::open('photo.jpg')
    ->square(300)
    ->save('square.jpg');
```

### 图片上传处理

```php
// 上传后自动处理
$image = Image::open($_FILES['photo']['tmp_name'])
    ->orient()                        // 修正 EXIF 方向
    ->resize(1200, 1200, true)        // 限制最大尺寸
    ->save('/uploads/photos/' . $id . '.jpg', 85);

// 生成多种缩略图
$image->copy()
    ->fit(100, 100)
    ->save('/uploads/photos/' . $id . '_thumb.jpg');

$image->copy()
    ->fit(400, 300)
    ->save('/uploads/photos/' . $id . '_medium.jpg');
```

### 滤镜效果

```php
Image::open('photo.jpg')
    ->grayscale()
    ->contrast(20)
    ->brightness(10)
    ->save('vintage.jpg');

Image::open('photo.jpg')
    ->blur()
    ->save('blurred.jpg');
```

### 水印与文字

```php
// 添加 Logo 水印
Image::open('photo.jpg')
    ->resize(1200, 800, true)
    ->watermark('/images/logo.png', 'bottom-right', 40, 20)
    ->save('watermarked.jpg', 90);

// 添加版权文字
Image::open('photo.jpg')
    ->ttfText('© 2024 My Company', '/fonts/roboto.ttf', 16, '#FFFFFF', 20, 580)
    ->save('copyrighted.jpg');
```

### 链式调用

```php
$base64 = Image::open('photo.jpg')
    ->orient()
    ->resize(600, 400, true)
    ->grayscale()
    ->contrast(15)
    ->brightness(5)
    ->watermark('/logo.png', 'top-right', 30, 15)
    ->toBase64('jpg');
```
