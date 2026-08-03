# Controller & RestController

控制器基类和 RESTful 控制器，位于 `zap\http` 命名空间。

**源文件**: `src/http/Controller.php`, `src/http/RestController.php`

## Controller

```php
namespace zap\http;

class Controller
```

### 方法

#### `json(array $data, int $status = 200): string`

返回 JSON 响应。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$data` | array | — | 响应数据 |
| `$status` | int | `200` | HTTP 状态码 |

```php
class ApiController extends Controller
{
    public function index()
    {
        return $this->json(['users' => $users]);
    }

    public function store()
    {
        return $this->json(['id' => 42], 201);
    }
}
```

#### `request(): ZapRequest`

获取当前请求实例。

```php
$name = $this->request()->input('name');
$all  = $this->request()->input();
```

#### `response(): Response`

获取响应实例。

```php
$this->response()->ok('Hello');
$this->response()->notFound('Not found');
$this->response()->json(['status' => 'ok']);
```

## RestController

```php
namespace zap\http;

class RestController extends Controller
```

### RESTful 方法

| 方法 | HTTP 方法 | URL | 说明 |
|------|----------|-----|------|
| `index()` | GET | /resource | 列表 |
| `show($id)` | GET | /resource/{id} | 详情 |
| `store()` | POST | /resource | 创建 |
| `update($id)` | PUT/PATCH | /resource/{id} | 更新 |
| `destroy($id)` | DELETE | /resource/{id} | 删除 |

### 完整示例

```php
class PostController extends RestController
{
    public function index()
    {
        $posts = DB::table('posts')->all();
        return $this->json($posts);
    }

    public function show($id)
    {
        $post = DB::table('posts')->find($id);
        return $post
            ? $this->json($post)
            : $this->response()->notFound();
    }

    public function store()
    {
        $data = $this->request()->input();
        $id = DB::table('posts')->insert($data);
        return $this->json(['id' => $id], 201);
    }

    public function update($id)
    {
        DB::table('posts')->where('id', $id)
            ->update($this->request()->input());
        return $this->json(['updated' => true]);
    }

    public function destroy($id)
    {
        DB::table('posts')->where('id', $id)->delete();
        return $this->json(['deleted' => true]);
    }
}
```

### 注册 RESTful 路由

```php
Route::resource('posts', 'PostController');

// 生成路由：
// GET    /posts      → PostController@index
// GET    /posts/{id} → PostController@show
// POST   /posts      → PostController@store
// PUT    /posts/{id} → PostController@update
// DELETE /posts/{id} → PostController@destroy
```
