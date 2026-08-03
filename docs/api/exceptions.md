# Exceptions 异常类

Zap PHP Framework 内置的异常类。

**源文件**: `src/exception/`

## HttpException

`zap\exception\HttpException` HTTP 异常基类，携带 HTTP 状态码。

```php
namespace zap\exception;

class HttpException extends \RuntimeException
```

### 构造器

```php
new HttpException(
    int $statusCode = 500,
    string $message = '',
    int $code = 0,
    \Throwable $previous = null
)
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$statusCode` | int | 500 | HTTP 状态码 |
| `$message` | string | `''` | 错误消息（默认使用状态码对应中文消息） |
| `$code` | int | 0 | 内部错误码 |
| `$previous` | Throwable\|null | null | 前一个异常 |

### `getStatusCode(): int`

获取 HTTP 状态码。

```php
try {
    abort(422, '邮箱格式不正确');
} catch (HttpException $e) {
    $e->getStatusCode();  // 422
    $e->getMessage();     // '邮箱格式不正确'
}
```

### `getHeaders(): array`

获取响应头。

```php
$e = new HttpException(429, '请求频繁');
$e->withHeaders(['Retry-After' => '60']);
$e->getHeaders();  // ['Retry-After' => '60']
```

### `withHeaders(array $headers): self`

设置响应头，返回 `$this` 支持链式。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$headers` | array | 键值对响应头数组 |

```php
throw (new HttpException(301))
    ->withHeaders(['Location' => '/new-url']);
```

### 状态码默认消息

| 状态码 | 默认消息 |
|--------|----------|
| 400 | 错误的请求 |
| 401 | 未授权，请先登录 |
| 403 | 禁止访问 |
| 404 | 请求的资源未找到 |
| 405 | 请求方法不允许 |
| 408 | 请求超时 |
| 419 | 页面已过期 |
| 422 | 数据验证失败 |
| 429 | 请求过于频繁，请稍后重试 |
| 500 | 服务器内部错误 |
| 502 | 网关错误 |
| 503 | 服务暂不可用 |
| 504 | 网关超时 |

---

## NotFoundException

`zap\exception\NotFoundException` 资源未找到异常（404）。

```php
namespace zap\exception;

class NotFoundException extends HttpException
```

继承自 `HttpException`，默认 HTTP 状态码为 **404**。

```php
throw new NotFoundException('用户不存在');

// $e->getStatusCode() => 404
// $e->getMessage()     => '用户不存在'
```

---

## ViewNotFoundException

`zap\exception\ViewNotFoundException` 视图文件缺失异常。

```php
namespace zap\exception;

class ViewNotFoundException extends \RuntimeException
```

### 构造器

```php
new ViewNotFoundException(
    string $viewName = '',
    string $message = '',
    int $code = 0,
    \Throwable $previous = null
)
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$viewName` | string | `''` | 缺失的视图名称 |
| `$message` | string | `''` | 错误消息（默认自动生成） |
| `$code` | int | 0 | 内部错误码 |
| `$previous` | Throwable\|null | null | 前一个异常 |

### `getViewName(): string`

获取缺失的视图名称。

```php
try {
    ZView::render('nonexistent.view');
} catch (ViewNotFoundException $e) {
    echo '缺失的视图: ' . $e->getViewName();
}
```

---

## CurlException

`zap\exception\CurlException` cURL 请求异常。

```php
namespace zap\exception;

class CurlException extends \RuntimeException
```

### 构造器

```php
new CurlException(
    string $message = '',
    int $curlErrno = 0,
    int $code = 0,
    \Throwable $previous = null
)
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$message` | string | `''` | 错误消息（默认使用 `curl_strerror`） |
| `$curlErrno` | int | 0 | cURL 错误码 |
| `$code` | int | 0 | 内部错误码 |
| `$previous` | Throwable\|null | null | 前一个异常 |

### `getCurlErrno(): int`

获取 cURL 错误码。

```php
try {
    $ch = curl_init('https://invalid.domain');
    curl_exec($ch);
    if (curl_errno($ch)) {
        throw new CurlException('', curl_errno($ch));
    }
} catch (CurlException $e) {
    $e->getCurlErrno(); // 6  (CURLE_COULDNT_RESOLVE_HOST)
    $e->getMessage();    // 'cURL 错误 (6): Couldn't resolve host name'
}
```

---

## NotSupportedException

`zap\exception\NotSupportedException` 功能不支持异常。

```php
namespace zap\exception;

class NotSupportedException extends \RuntimeException
```

用于标记某个功能或操作不被支持。

```php
throw new NotSupportedException('Memcached 驱动暂不支持 incr 操作');
```

---

## 异常类层次

```
\Throwable
├── \Exception
│   └── \RuntimeException
│       ├── HttpException（statusCode 属性）
│       │   └── NotFoundException（404）
│       ├── ViewNotFoundException（viewName 属性）
│       ├── CurlException（curlErrno 属性）
│       └── NotSupportedException
```
