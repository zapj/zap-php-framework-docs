# Request

HTTP 请求处理，包含 `zap\http\ZapRequest` 类和 `zap\http\Request` 外观。

**源文件**: `src/http/ZapRequest.php`, `src/http/Request.php`

## ZapRequest

```php
namespace zap\http;

class ZapRequest
```

### 输入方法

#### `input(string $key = null, $default = null): mixed`

获取任意输入（GET → POST → JSON 自动检测）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$key` | string\|null | `null` | 字段名（null 取全部） |
| `$default` | mixed | `null` | 默认值 |

```php
$request = new ZapRequest();

$name    = $request->input('name');
$age     = $request->input('age', 18);
$allData = $request->input();
```

#### `json(string $key = null, $default = null): mixed`

获取 JSON 请求体数据。

```php
$data  = $request->json();
$token = $request->json('token');
```

#### `rawBody(): string`

获取原始请求体内容。

```php
$raw = $request->rawBody();
```

#### `has(string $key): bool`

检查字段是否存在。

```php
if ($request->has('email')) {
    // 处理...
}
```

#### `only(array $keys): array`

仅返回指定字段。

```php
$filtered = $request->only(['name', 'email', 'phone']);
```

#### `except(array $keys): array`

排除指定字段。

```php
$safe = $request->except(['password', 'csrf_token']);
```

### URL 方法

| 方法 | 返回 | 说明 |
|------|------|------|
| `fullUrl()` | string | 完整 URL（含协议、主机、路径、查询字符串） |
| `path()` | string | 路径部分（如 `/users/42`） |
| `host()` | string | 主机名 |
| `port()` | int | 端口号 |
| `userAgent()` | string | User-Agent |
| `referer()` | string | Referer 来源 |

### HTTP 方法判断

| 方法 | 返回 | 说明 |
|------|------|------|
| `isGet()` | bool | GET 请求 |
| `isPost()` | bool | POST 请求 |
| `isPut()` | bool | PUT 请求 |
| `isPatch()` | bool | PATCH 请求 |
| `isDelete()` | bool | DELETE 请求 |
| `isHead()` | bool | HEAD 请求 |
| `isOptions()` | bool | OPTIONS 请求 |

```php
if ($request->isPost()) {
    $data = $request->input();
    // 处理表单...
}
```

## Request Facade

```php
namespace zap\http;

/**
 * @method static mixed  input($key = null, $default = null)
 * @method static mixed  json($key = null, $default = null)
 * @method static string rawBody()
 * @method static bool   has($key)
 * @method static array  only($keys)
 * @method static array  except($keys)
 * @method static string fullUrl()
 * @method static string path()
 * @method static string host()
 * @method static int    port()
 * @method static string userAgent()
 * @method static string referer()
 * @method static bool   isGet()
 * @method static bool   isPost()
 * @method static bool   isPut()
 * @method static bool   isPatch()
 * @method static bool   isDelete()
 * @method static bool   isHead()
 * @method static bool   isOptions()
 */
class Request extends \zap\facades\Facade
```

使用：

```php
use zap\http\Request;

$name = Request::input('name');
$all  = Request::input();

if (Request::isPost()) {
    // POST 处理
}
```
