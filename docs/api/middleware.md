# Middleware

`zap\http\Middleware` 中间件接口。

**源文件**: `src/http/Middleware.php`

## 接口定义

```php
namespace zap\http;

interface Middleware
{
    /**
     * 处理请求
     *
     * @param mixed $request  请求对象
     * @param callable $next  下一个中间件/路由处理器
     * @return mixed
     */
    public function handle($request, $next);
}
```

## 实现示例

```php
use zap\http\Middleware;

class AuthMiddleware implements Middleware
{
    public function handle($request, $next)
    {
        $session = new \zap\http\Session();

        if (!$session->has('user_id')) {
            return (new \zap\http\Response())->unauthorized('请先登录');
        }

        return $next($request);
    }
}

class RoleMiddleware implements Middleware
{
    protected string $role;

    public function __construct(string $role)
    {
        $this->role = $role;
    }

    public function handle($request, $next)
    {
        if (!in_array($this->role, $_SESSION['roles'] ?? [])) {
            return (new \zap\http\Response())->forbidden('无权访问');
        }

        return $next($request);
    }
}
```

## 绑定到路由

```php
Route::get('/admin', 'AdminController@index')
    ->middleware('auth', 'role:admin');

Route::group(['middleware' => 'auth'], function () {
    Route::get('/dashboard', 'DashboardController@index');
    Route::resource('users', 'UserController');
});
```
