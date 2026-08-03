# Response

`zap\http\Response` HTTP 响应类，提供链式 API 构建响应。

**源文件**: `src/http/Response.php`

## 类概览

```php
namespace zap\http;

class Response
```

## 状态码工厂方法

所有工厂方法返回 `$this`，支持链式调用。

| 方法 | 状态码 | 说明 |
|------|--------|------|
| `ok($body)` | 200 | 成功 |
| `created($body)` | 201 | 已创建 |
| `noContent()` | 204 | 无内容 |
| `badRequest($msg)` | 400 | 请求错误 |
| `unauthorized($msg)` | 401 | 未授权 |
| `forbidden($msg)` | 403 | 禁止访问 |
| `notFound($msg)` | 404 | 未找到 |

```php
$response = new Response();

$response->ok(['status' => 'success']);
$response->created(['id' => 42]);
$response->noContent();
$response->badRequest('参数错误');
$response->unauthorized('请先登录');
$response->forbidden('无权访问');
$response->notFound('页面不存在');
```

## 内容类型方法

链式设置 Content-Type：

| 方法 | Content-Type |
|------|-------------|
| `json($data)` | `application/json` |
| `html($content)` | `text/html` |
| `text($content)` | `text/plain` |

```php
$response->json(['data' => $users])->send();
$response->html('<h1>Hello</h1>')->send();
$response->text('OK')->send();
```

## Cookie

### `cookie(string $name, string $value, int $expire = 0): Response`

设置响应 Cookie。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$name` | string | — | Cookie 名称 |
| `$value` | string | — | Cookie 值 |
| `$expire` | int | `0` | 过期时间（秒） |

```php
$response->cookie('remember', 'token123', 3600 * 24 * 30)
    ->json(['logged_in' => true])
    ->send();
```

## 文件下载

### `download(string $filePath): void`

触发文件下载。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | string | 文件系统路径 |

```php
$response->download('/path/to/report.pdf');
```

## 发送

### `send(): void`

显式发送响应（输出内容 + headers）。

```php
$response->json(['status' => 'ok'])->send();
```

## 完整示例

```php
class ApiController extends Controller
{
    public function store()
    {
        $data = $this->request()->input();

        if (empty($data['name'])) {
            return $this->response()
                ->badRequest(['error' => '名称不能为空'])
                ->json(['error' => '名称不能为空'])
                ->send();
        }

        $id = DB::table('items')->insert($data);

        return (new Response())
            ->created(['id' => $id])
            ->send();
    }
}
```
