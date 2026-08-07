# Router

`zap\http\Router` HTTP 路由器，负责 URL 匹配、调度和路由缓存管理。

**源文件**: `src/http/Router.php`

## 类概览

```php
namespace zap\http;

class Router
```

## 静态方法

### `create(): Router`

创建 Router 实例（继承自 `Route`，可通过 `Route::get()` 等静态方法注册路由）。

### `url(string $name, array $params = []): string`

通过命名路由生成 URL。如果配置了 `config('config.suffix')`（如 `.html`），会自动追加后缀。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | string | 路由名称 |
| `$params` | array | 路由参数 |

```php
$url = Router::url('posts.show', ['id' => 42]);
// → /posts/42       (无 suffix 配置)
// → /posts/42.html  (配置了 suffix = '.html')
```

::: tip URL 后缀
在 `config/config.php` 中设置 `'suffix' => '.html'`，所有通过 `Router::url()` 和 `UrlHelper` 生成的 URL 会自动追加后缀。根路径 `/`、已有该后缀的 URL、以及绝对路径不会重复追加。详见 [路由指南](/guide/routing.md#url-后缀)。
:::

### `setNotFound($handler): void`

设置 404 处理器。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$handler` | callable|string | 404 回调或控制器方法 |

```php
Router::setNotFound(function () {
    return view('errors.404');
});

Router::setNotFound('ErrorController@notFound');
```

### 路由缓存方法

| 方法 | 说明 |
|------|------|
| `setCacheDriver(CacheInterface)` | 设置缓存驱动 |
| `setCachePath(string)` | 设置文件缓存路径 |
| `setCacheKey(string)` | 自定义缓存键名 |
| `getCacheInfo(): array` | 获取缓存状态 |
| `clearRouteCache(): bool` | 清除路由缓存 |

### `getCacheInfo(): array`

```php
$info = Router::getCacheInfo();
// [
//     'driver'       => 'redis',
//     'cache_key'    => 'zap.routes.cache',
//     'cached'       => true,
//     'routes_count' => 42,
// ]
```

## 实例方法

### `dispatch(): bool`

执行路由分发，遍历所有已注册路由进行匹配。

返回值：`true` 找到匹配路由，`false` 未匹配。

### `cacheRoutes(?string $routeFile, string ...$extraFiles): bool`

将所有已注册路由编译并缓存。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$routeFile` | string\|null | 路由文件路径（用于失效检测） |
| `$extraFiles` | string | 额外的依赖文件 |

```php
$router->cacheRoutes(__FILE__);
$router->cacheRoutes(__FILE__, 'helpers.php', 'auth.php');
```

### `loadRoutesFromCache(?string $routeFile, string ...$extraFiles): bool`

从缓存加载路由。返回 `true` 表示缓存命中。

```php
if ($router->loadRoutesFromCache(__FILE__)) {
    return $router;  // 命中，跳过注册
}
```

## 通过 Route 注册路由

Router 继承自 `Route`，所有 `Route` 的静态方法均可直接使用：

```php
use zap\http\Route;

Route::get('/users', 'UserController@index');
Route::post('/users', 'UserController@store');
Route::resource('posts', 'PostController');
Route::group(['prefix' => 'admin'], function () {
    Route::get('/dashboard', 'DashboardController@index');
});
```
