# Route

`zap\http\Route` 路由定义类，每个路由对应一个 URL 模式和处理逻辑。

**源文件**: `src/http/Route.php`

## 类概览

```php
namespace zap\http;

class Route
```

## 构造方法

```php
public function __construct(string $pattern, $fn, array $methods = ['GET'])
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$pattern` | string | — | URL 模式 |
| `$fn` | string\|callable | — | 处理器 |
| `$methods` | array | `['GET']` | HTTP 方法 |

## 静态方法（HTTP 方法快捷注册）

| 方法 | 说明 |
|------|------|
| `Route::get($uri, $handler)` | GET 路由 |
| `Route::post($uri, $handler)` | POST 路由 |
| `Route::put($uri, $handler)` | PUT 路由 |
| `Route::patch($uri, $handler)` | PATCH 路由 |
| `Route::delete($uri, $handler)` | DELETE 路由 |
| `Route::options($uri, $handler)` | OPTIONS 路由 |
| `Route::match($methods, $uri, $handler)` | 多方法路由 |
| `Route::resource($name, $controller)` | RESTful 资源路由 |
| `Route::group($options, $callback)` | 路由分组 |

## 实例方法

### `name(string $name): Route`

设置路由名称（用于 URL 生成）。

```php
Route::get('/posts/{id}', 'PostController@show')->name('posts.show');
```

### `middleware(string ...$middlewares): Route`

绑定中间件。

```php
Route::get('/admin', 'AdminController@index')
    ->middleware('auth', 'role:admin');
```

### `matchPattern(string $url): bool`

尝试将 URL 匹配到路由模式。匹配成功时填充 `$this->params`。

```php
$route = new Route('/users/{id}', 'UserController@show', ['GET']);
if ($route->matchPattern('/users/42')) {
    // $route->params = ['id' => '42']
}
```

### `compilePattern(): string`

将路由模式编译为正则表达式（结果缓存复用）。

```php
$route = new Route('/posts/{id:\d+}', 'PostController@show', ['GET']);
$pattern = $route->compilePattern();
// → /^(?P<id>\d+)$/
```

### `invoke(array $params): mixed`

调用路由处理器。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$params` | array | 路由参数 |

### `toCacheData(): array`

导出为可缓存的数组数据。

::: warning
闭包处理器会抛出 `RuntimeException`——闭包不可序列化。
:::

```php
$data = $route->toCacheData();
// ['pattern' => '/users/{id}', 'fn' => 'UserController@show', ...]
```

### `fromCacheData(array $data): Route`

从缓存数据还原 Route 实例。

```php
$route = Route::fromCacheData($cachedData);
```

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `$params` | array | 匹配后的路由参数 |

## 路由参数格式

```php
// 基本参数
Route::get('/users/{id}', ...)

// 带正则约束
Route::get('/posts/{id:\d+}', ...)
Route::get('/articles/{slug:[a-z0-9-]+}', ...)

// 通配符
Route::get('/search/{any}', ...)
```
