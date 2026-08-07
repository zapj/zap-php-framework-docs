# 路由

## 概述

Zap PHP Framework 的路由系统提供了强大而灵活的路由定义方式。支持 RESTful 风格路由、路由分组、命名路由、参数约束、中间件链、路由缓存等功能。

## 基本路由

### GET 路由

```php
$router->get('/', function() {
    return response('Hello World');
});

$router->get('/about', function() {
    return view('about.index');
});

$router->get('/user/{id}', function($id) {
    return response("用户 ID: {$id}");
});
```

### POST 路由

```php
$router->post('/login', function() {
    $username = req()->input('username');
    $password = req()->input('password');
    // 处理登录逻辑
    return response()->json(['status' => 'ok']);
});
```

### PUT / PATCH / DELETE 路由

```php
$router->put('/user/{id}', function($id) {
    // 更新用户信息
    return response()->json(['updated' => true]);
});

$router->patch('/user/{id}/profile', function($id) {
    // 部分更新用户资料
    return response()->json(['patched' => true]);
});

$router->delete('/user/{id}', function($id) {
    // 删除用户
    return response()->json(['deleted' => true]);
});
```

### OPTIONS 路由

```php
$router->options('/api/users', function() {
    return response('')->header('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
});
```

### 任意 HTTP 方法

```php
$router->any('/webhook', function() {
    // 匹配所有 HTTP 方法
    return response('Webhook received');
});
```

### match() - 指定多个方法

```php
$router->match(['GET', 'POST'], '/contact', function() {
    if (req()->isGet()) {
        return view('contact.form');
    }
    // 处理表单提交
    return response()->redirect('/thank-you');
});
```

## 控制器路由

除了闭包路由，还可以将路由映射到控制器方法：

```php
// 格式：'ControllerClassName@method'
$router->get('/users', 'App\Controllers\UserController@index');
$router->get('/users/{id}', 'App\Controllers\UserController@show');
$router->post('/users', 'App\Controllers\UserController@store');
$router->put('/users/{id}', 'App\Controllers\UserController@update');
$router->delete('/users/{id}', 'App\Controllers\UserController@destroy');
```

控制器类示例：

```php
<?php

namespace App\Controllers;

use zap\http\Controller;

class UserController extends Controller
{
    public function index()
    {
        $users = DB::table('users')->getAll();
        return $this->json($users);
    }

    public function show($id)
    {
        $user = DB::table('users')->find($id);
        return $this->json($user);
    }

    public function store()
    {
        $data = $this->request()->json();
        $id = DB::table('users')->insert($data);
        return $this->json(['id' => $id], 201);
    }

    public function update($id)
    {
        $data = $this->request()->json();
        DB::table('users')->where('id', $id)->update($data);
        return $this->json(['updated' => true]);
    }

    public function destroy($id)
    {
        DB::table('users')->where('id', $id)->delete();
        return $this->json(['deleted' => true]);
    }
}
```

## RESTful 资源路由

`Route::resource()` 方法可以一次性注册标准的 RESTful CRUD 路由：

```php
// 注册完整的 RESTful 资源路由
$router->resource('posts', 'App\Controllers\PostController');
```

上述代码会生成以下路由：

| 方法 | URI | 控制器方法 | 路由名称 |
|------|-----|-----------|----------|
| GET | `/posts` | PostController@index | posts.index |
| GET | `/posts/create` | PostController@create | posts.create |
| POST | `/posts` | PostController@save | posts.save |
| GET | `/posts/{id}` | PostController@show | posts.show |
| GET | `/posts/{id}/edit` | PostController@edit | posts.edit |
| PUT | `/posts/{id}` | PostController@update | posts.update |
| DELETE | `/posts/{id}` | PostController@destroy | posts.destroy |

### 限制资源路由

使用 `only` 和 `except` 选项控制注册的路由：

```php
// 仅注册指定方法
$router->resource('photos', 'PhotoController', [
    'only' => ['index', 'show']
]);

// 排除指定方法
$router->resource('comments', 'CommentController', [
    'except' => ['create', 'edit']
]);
```

## 路由参数

### 基本参数

```php
// 基本参数 - 匹配除 / 外的任意字符
$router->get('/user/{name}', function($name) {
    return response("用户名: {$name}");
});

// 多个参数
$router->get('/post/{year}/{month}', function($year, $month) {
    return response("归档: {$year}年{$month}月");
});
```

### 正则约束

```php
// 仅匹配数字
$router->get('/user/{id:\d+}', function($id) {
    return response("用户ID: {$id}");
});

// 匹配字母
$router->get('/category/{slug:[a-zA-Z]+}', function($slug) {
    return response("分类: {$slug}");
});

// 匹配字母数字和连字符
$router->get('/article/{slug:[a-zA-Z0-9\-]+}', function($slug) {
    return response("文章: {$slug}");
});

// 组合约束
$router->get('/user/{id:\d+}/post/{slug:[a-z0-9\-]+}', function($id, $slug) {
    return response("用户{$id}的文章: {$slug}");
});
```

### 可选参数（{any}）

```php
// 匹配任意内容
$router->get('/page/{any}', function($path) {
    return response("页面路径: {$path}");
});
```

## 路由分组

路由分组允许共享路由属性，如 URL 前缀和中间件：

```php
// 前缀分组
$router->group(['prefix' => 'admin'], function($router) {
    $router->get('/dashboard', 'AdminController@dashboard');
    $router->get('/users', 'AdminController@users');
    $router->get('/settings', 'AdminController@settings');
});
// 以上路由匹配: /admin/dashboard, /admin/users, /admin/settings
```

### 嵌套分组

```php
$router->group(['prefix' => 'api'], function($router) {
    // 匹配 /api/v1
    $router->group(['prefix' => 'v1'], function($router) {
        $router->get('/users', 'Api\V1\UserController@index');
        $router->post('/users', 'Api\V1\UserController@store');
    });

    // 匹配 /api/v2
    $router->group(['prefix' => 'v2'], function($router) {
        $router->get('/users', 'Api\V2\UserController@index');
    });
});
```

### 分组中间件

```php
$router->group(['middleware' => 'auth'], function($router) {
    $router->get('/profile', 'UserController@profile');
    $router->get('/orders', 'OrderController@index');
});

// 多个中间件
$router->group(['middleware' => ['auth', 'admin']], function($router) {
    $router->get('/admin/dashboard', 'AdminController@dashboard');
});
```

## 命名路由

命名路由允许你为路由指定一个名称，然后通过名称生成 URL：

```php
// 定义命名路由
$router->get('/user/{id}', 'UserController@show')->name('user.profile');
$router->get('/posts', 'PostController@index')->name('posts.list');
$router->get('/post/{slug}', 'PostController@show')->name('post.show');
```

### 通过名称生成 URL

```php
// 使用 Router::url() 生成 URL
$url = Router::url('user.profile', ['id' => 5]);
// 结果: /user/5

$url = Router::url('post.show', ['slug' => 'hello-world']);
// 结果: /post/hello-world

// 资源路由自动生成名称
$url = Router::url('posts.index');
// 结果: /posts

$url = Router::url('posts.show', ['id' => 3]);
// 结果: /posts/3
```

### 获取所有命名路由

```php
$routes = Router::getNamedRoutes();
print_r($routes);
// [
//     'user.profile' => '/user/{id:\d+}',
//     'posts.list'   => '/posts',
//     'post.show'    => '/post/{slug}',
// ]
```

## URL 后缀

在配置文件中设置 `suffix` 后，所有通过 `Router::url()` 和 `UrlHelper` 生成的 URL 会自动追加后缀。

### 配置

```php
// config/config.php
return [
    'suffix' => '.html',   // 设置 URL 后缀
    // ...
];
```

### 自动生成

```php
// 路由定义
$router->get('/post/{id}', 'PostController@show')->name('post.show');

// Router::url() 生成
Router::url('post.show', ['id' => 42]);     // → /post/42.html

// UrlHelper 同样生效
UrlHelper::route('post.show', ['id' => 42]); // → /post/42.html
UrlHelper::action('PageController@about');   // → /about.html
UrlHelper::to('/contact');                   // → /contact.html
```

### 排除规则

以下情况**不会**追加后缀：

| 场景 | URL | 结果 |
|------|-----|------|
| 根路径 | `/` | `/` |
| 已有该后缀 | `/about.html` | `/about.html` |
| 带 query string | `/search?q=test` | `/search.html?q=test` |
| 绝对路径 | `https://example.com/page` | `https://example.com/page.html` |

```php
Router::url('home');        // → /              （根路径不追加）
url('/about.html');         // → /about.html    （已存在不追加）
url('/search?q=test');      // → /search.html?q=test
url('https://ex.com/post'); // → https://ex.com/post.html
```

## 404 处理

通过 `Router::setNotFound()` 设置自定义的 404 处理器：

```php
// 闭包方式
$router->setNotFound(function() {
    return zap\http\Response::notFound('抱歉，页面未找到');
});

// 控制器方式
$router->setNotFound('App\Controllers\ErrorController@notFound');

// 返回 JSON 的 404
$router->setNotFound(function() {
    return response()->json(['error' => 'Not Found'], 404);
});
```

## 路由缓存

路由缓存可以显著提升应用性能，尤其在路由数量较多时。框架支持多种缓存驱动。

### 自动配置（推荐）

只需在 `config/cache.php` 中正确配置缓存驱动，路由系统会自动使用：

```php
// config/cache.php
return [
    'default' => 'redis',  // 路由缓存将自动使用 Redis
    'status'  => 'enabled',
    // ...
];
```

### 手动设置缓存驱动

```php
use zap\cache\FileCache;
use zap\cache\RedisCache;
use zap\cache\MemcacheCache;

// 文件缓存
Router::setCacheDriver(new FileCache([
    'cacheDir' => var_path('cache')
]));

// Redis 缓存
Router::setCacheDriver(new RedisCache([
    'host' => '127.0.0.1',
    'port' => 6379
]));

// Memcached 缓存
Router::setCacheDriver(new MemcacheCache([
    'driver'  => 'memcached',
    'servers' => [['host' => '127.0.0.1', 'port' => 11211]]
]));

// 文件缓存快捷方式
Router::setCachePath(var_path('cache'));
```

### 缓存与加载

```php
// 定义路由文件路径（用于缓存校验）
$routeFile = base_path('app/routes.php');

// 尝试从缓存加载路由（如果缓存有效则跳过注册）
if (!$router->loadRoutesFromCache($routeFile)) {
    // 缓存无效，注册路由
    require $routeFile;

    // 将路由写入缓存
    $router->cacheRoutes($routeFile);
}

// 清除路由缓存
Router::clearRouteCache();

// 获取缓存信息
$info = Router::getCacheInfo();
print_r($info);
// [
//     'driver'       => 'redis',
//     'cache_key'    => 'zap.routes.cache',
//     'cached'       => true,
//     'routes_count' => 42,
// ]
```

### 缓存工作原理

1. 路由注册完成后，调用 `cacheRoutes()` 将所有路由序列化并存储
2. 下次请求时，调用 `loadRoutesFromCache()` 检测缓存是否有效
3. 缓存有效性通过校验路由文件的修改时间（hash）来判断
4. 如果路由文件发生变更，缓存自动失效，需重新注册和缓存
5. 缓存数据包含完整路由表（patterns、methods、handlers、命名路由）

### 注意事项

- 闭包路由**无法**被缓存，缓存前请确保所有路由使用控制器方式
- 路由文件路径用于生成缓存校验 hash，确保传入正确的文件路径
- 额外依赖文件（如中间件配置）可通过 `$extraFiles` 参数纳入校验

## 中间件

路由支持中间件链，中间件在路由处理前后执行：

```php
// 单一路由中间件
$router->get('/admin', 'AdminController@index')
    ->middleware('auth')
    ->middleware('admin');

// 分组中间件
$router->group(['middleware' => 'auth'], function($router) {
    $router->get('/profile', 'UserController@profile');
    $router->get('/settings', 'UserController@settings');
});
```

中间件在 `Route` 对象中通过 `middleware()` 方法注册，在路由匹配后由框架按顺序执行。

## 完整路由示例

以下是一个完整的路由配置文件示例（`app/routes.php`）：

```php
<?php

use zap\http\Router;

// 首页
$router->get('/', 'App\Controllers\HomeController@index')->name('home');

// 静态页面
$router->get('/about', 'App\Controllers\PageController@about')->name('about');
$router->get('/contact', 'App\Controllers\PageController@contact')->name('contact');

// RESTful 资源
$router->resource('posts', 'App\Controllers\PostController', [
    'except' => ['create', 'edit']
]);

$router->resource('comments', 'App\Controllers\CommentController', [
    'only' => ['store', 'destroy']
]);

// API 分组
$router->group(['prefix' => 'api/v1', 'middleware' => 'api'], function($router) {
    $router->resource('users', 'App\Controllers\Api\V1\UserController');
    $router->resource('articles', 'App\Controllers\Api\V1\ArticleController');

    // 嵌套资源路由
    $router->get('/users/{id:\d+}/posts', 'App\Controllers\Api\V1\UserPostController@index');
});

// 管理后台分组
$router->group(['prefix' => 'admin', 'middleware' => ['auth', 'admin']], function($router) {
    $router->get('/dashboard', 'App\Controllers\Admin\DashboardController@index')->name('admin.dashboard');

    $router->group(['prefix' => 'manage'], function($router) {
        $router->resource('users', 'App\Controllers\Admin\UserController');
        $router->resource('settings', 'App\Controllers\Admin\SettingController');
    });
});

// 404 处理
$router->setNotFound('App\Controllers\ErrorController@notFound');

// 路由缓存（生产环境推荐）
if (!config('config.debug')) {
    $routeFile = __FILE__;
    if (!$router->loadRoutesFromCache($routeFile)) {
        $router->cacheRoutes($routeFile);
    }
}
```
