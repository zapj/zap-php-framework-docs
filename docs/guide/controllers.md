# 控制器

## 概述

控制器是 Zap PHP Framework 中处理 HTTP 请求的核心组件。框架提供了基础控制器类 `Controller` 和 RESTful 控制器类 `RestController`，帮助您快速构建 Web 应用和 API。

## 基础控制器

所有控制器应继承 `zap\http\Controller` 基类：

```php
<?php

namespace App\Controllers;

use zap\http\Controller;

class HomeController extends Controller
{
    public function index()
    {
        return $this->json(['message' => 'Hello, Zap!']);
    }
}
```

### Controller 内置方法

#### json() - 返回 JSON 响应

```php
public function index()
{
    $data = ['name' => 'Zap', 'version' => '1.0.5'];
    return $this->json($data);
    // 等价于: return response()->json($data)->send();
}
```

#### request() - 获取请求对象

```php
public function store()
{
    // 获取 ZapRequest 实例
    $request = $this->request();

    // 读取表单输入
    $name = $request->input('name');
    $email = $request->input('email');

    // 读取 JSON 请求体
    $payload = $request->json();

    // 判断请求方法
    if ($request->isPost()) {
        // 处理 POST 请求
    }

    return $this->json(['received' => true]);
}
```

#### response() - 创建响应对象

```php
public function show($id)
{
    $user = DB::table('users')->find($id);

    if (!$user) {
        return $this->response()->setStatusCode(404)->json()->send();
    }

    return $this->json($user);
}
```

## RESTful 控制器

`RestController` 继承自 `Controller`，专为 RESTful API 设计：

```php
<?php

namespace App\Controllers;

use zap\http\RestController;

class PostController extends RestController
{
    // GET /posts - 列表
    public function index()
    {
        $posts = DB::table('posts')->orderBy('created_at', 'DESC')->getAll();
        return $this->json(['data' => $posts]);
    }

    // GET /posts/{id} - 详情
    public function show($id)
    {
        $post = DB::table('posts')->find($id);

        if (!$post) {
            return $this->json(['error' => '文章未找到'], 404);
        }

        return $this->json(['data' => $post]);
    }

    // POST /posts - 创建
    public function store()
    {
        $data = $this->request()->json();

        // 数据验证...
        $id = DB::table('posts')->insert($data);

        return $this->json(['id' => $id, 'message' => '创建成功'], 201);
    }

    // PUT /posts/{id} - 更新
    public function update($id)
    {
        $data = $this->request()->json();

        DB::table('posts')->where('id', $id)->update($data);

        return $this->json(['message' => '更新成功']);
    }

    // DELETE /posts/{id} - 删除
    public function destroy($id)
    {
        DB::table('posts')->where('id', $id)->delete();

        return $this->json(['message' => '删除成功']);
    }
}
```

### RestController 的 save() 与 create() 方法

`RestController` 也支持 `save()` 方法（资源路由中的 POST 对应方法）：

```php
// POST /posts 映射到 save() 或 store()
public function save()
{
    $data = $this->request()->input();
    $id = DB::table('posts')->insert($data);
    return $this->json(['id' => $id], 201);
}
```

## 依赖注入

通过 `App::make()` 方法实现简单的依赖注入：

```php
<?php

namespace App\Controllers;

use zap\http\Controller;
use App\Services\UserService;

class UserController extends Controller
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index()
    {
        $users = $this->userService->getAllUsers();
        return $this->json($users);
    }
}

// 在路由或服务提供者中注册
app()->make(UserService::class);

// 控制器在路由匹配时自动实例化
$router->get('/users', 'App\Controllers\UserController@index');
```

`App::make()` 使用反射机制解析构造函数的参数依赖：

```php
// 手动创建带依赖的实例
$userService = app()->make(App\Services\UserService::class);

// 带参数的实例化
$mailer = app()->make(App\Services\Mailer::class, [
    'config' => ['host' => 'smtp.example.com']
]);
```

## 路由到控制器映射

### 基本映射

```php
// 字符串格式：'命名空间\控制器类@方法名'
$router->get('/users', 'App\Controllers\UserController@index');
$router->get('/users/{id}', 'App\Controllers\UserController@show');
$router->post('/users', 'App\Controllers\UserController@store');
```

### 资源路由映射

```php
$router->resource('posts', 'App\Controllers\PostController');
// 自动映射: index, create, save, show, edit, update, destroy
```

### 使用命名空间简化

如果控制器都在同一命名空间下，可以通过分组前缀简化：

```php
$router->group(['prefix' => 'api'], function($router) {
    $router->get('/users', 'Api\UserController@index');
    $router->get('/posts', 'Api\PostController@index');
});
```

## 完整 CRUD 控制器示例

以下是一个完整的数据表 CRUD 控制器示例：

```php
<?php

namespace App\Controllers;

use zap\http\Controller;
use DB;

class ArticleController extends Controller
{
    /**
     * 文章列表（支持分页和搜索）
     */
    public function index()
    {
        $page = $this->request()->input('page', 1);
        $perPage = $this->request()->input('per_page', 20);
        $keyword = $this->request()->input('keyword', '');

        $query = DB::table('articles');

        if ($keyword) {
            $query->where('title', 'LIKE', "%{$keyword}%");
        }

        $total = $query->count();
        $articles = $query->orderBy('created_at', 'DESC')
            ->limit($perPage)
            ->offset(($page - 1) * $perPage)
            ->getAll();

        return $this->json([
            'data' => $articles,
            'meta' => [
                'total'     => $total,
                'page'      => $page,
                'per_page'  => $perPage,
                'last_page' => ceil($total / $perPage),
            ],
        ]);
    }

    /**
     * 文章详情
     */
    public function show($id)
    {
        $article = DB::table('articles')->find($id);

        if (!$article) {
            return $this->json(['error' => '文章未找到'], 404);
        }

        // 增加阅读量
        DB::table('articles')->where('id', $id)->increment('views');

        return $this->json(['data' => $article]);
    }

    /**
     * 创建文章
     */
    public function store()
    {
        $data = $this->request()->json();

        // 基本验证
        if (empty($data['title'])) {
            return $this->json(['error' => '标题不能为空'], 422);
        }

        $now = date('Y-m-d H:i:s');
        $data['created_at'] = $now;
        $data['updated_at'] = $now;

        $id = DB::table('articles')->insert($data);

        return $this->json([
            'message' => '文章创建成功',
            'id'      => $id,
        ], 201);
    }

    /**
     * 更新文章
     */
    public function update($id)
    {
        $article = DB::table('articles')->find($id);

        if (!$article) {
            return $this->json(['error' => '文章未找到'], 404);
        }

        $data = $this->request()->json();
        $data['updated_at'] = date('Y-m-d H:i:s');

        DB::table('articles')->where('id', $id)->update($data);

        return $this->json(['message' => '文章更新成功']);
    }

    /**
     * 删除文章
     */
    public function destroy($id)
    {
        $article = DB::table('articles')->find($id);

        if (!$article) {
            return $this->json(['error' => '文章未找到'], 404);
        }

        DB::table('articles')->where('id', $id)->delete();

        return $this->json(['message' => '文章已删除']);
    }

    /**
     * 批量删除
     */
    public function batchDestroy()
    {
        $ids = $this->request()->input('ids', []);

        if (empty($ids)) {
            return $this->json(['error' => '请提供要删除的文章ID'], 422);
        }

        DB::table('articles')->whereIn('id', $ids)->delete();

        return $this->json(['message' => '批量删除成功']);
    }
}
```

对应的路由注册：

```php
$router->get('/articles', 'App\Controllers\ArticleController@index')->name('articles.index');
$router->get('/articles/{id:\d+}', 'App\Controllers\ArticleController@show')->name('articles.show');
$router->post('/articles', 'App\Controllers\ArticleController@store')->name('articles.store');
$router->put('/articles/{id:\d+}', 'App\Controllers\ArticleController@update')->name('articles.update');
$router->delete('/articles/{id:\d+}', 'App\Controllers\ArticleController@destroy')->name('articles.destroy');
$router->post('/articles/batch-destroy', 'App\Controllers\ArticleController@batchDestroy');
```

## 控制器最佳实践

1. **瘦控制器**：控制器应专注于请求处理和响应返回，业务逻辑放在 Service 层或 Model 层
2. **统一响应格式**：使用 `$this->json()` 统一 JSON 响应的格式
3. **输入验证**：在控制器中尽早验证输入数据，返回清晰的错误信息
4. **使用依赖注入**：通过 `App::make()` 管理服务依赖，提高可测试性
5. **合理使用 HTTP 状态码**：创建用 201，验证失败用 422，未找到用 404，未授权用 401
