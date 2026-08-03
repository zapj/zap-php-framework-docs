# HTTP 层

## 概述

Zap PHP Framework 的 HTTP 层提供了功能完善的请求（Request）和响应（Response）对象，帮助您处理 HTTP 输入和构建 HTTP 输出。

## 请求对象 (ZapRequest)

`zap\http\ZapRequest` 封装了 `$_GET`、`$_POST`、`$_SERVER` 和原始请求体，提供了丰富的方法来访问请求数据。

### 获取请求对象

```php
use zap\http\ZapRequest;

// 手动创建
$request = ZapRequest::createFromGlobals();

// 使用 req() 辅助函数（推荐）
$request = req();

// 在控制器中
$request = $this->request();
```

### 获取输入数据

```php
// 获取单个输入值（支持 $_GET 和 $_POST）
$name = req()->input('name');
$email = req()->input('email', 'default@example.com'); // 带默认值

// 获取所有输入
$all = req()->all();

// 获取 JSON 请求体
$jsonData = req()->json();

// 获取原始请求体
$rawBody = req()->rawBody();

// 获取查询字符串参数
$page = req()->query('page', 1);
$sort = req()->query('sort', 'desc');

// 获取 POST 参数
$username = req()->post('username');

// 获取文件上传
$avatar = req()->file('avatar');

// 获取指定键的输入
$data = req()->only(['name', 'email', 'age']);
// ['name' => '张三', 'email' => 'zhang@example.com', 'age' => 25]

// 排除指定键
$data = req()->except(['password', 'password_confirmation']);
// 返回除密码外的所有输入

// 检查是否存在
if (req()->has('name')) {
    // name 参数存在
}

if (req()->has(['name', 'email'])) {
    // name 和 email 都存在
}

// 检查是否缺失
if (req()->missing('token')) {
    // token 参数不存在
}

// 获取布尔值
$isActive = req()->boolean('active'); // true/false

// 获取数组输入
$tags = req()->input('tags', []);

// 获取多个输入
['name' => $name, 'email' => $email] = req()->only(['name', 'email']);
```

### 请求 URL 信息

```php
// 完整 URL
$fullUrl = req()->fullUrl();
// http://example.com/users?page=1&sort=desc

// 路径（不含查询字符串）
$path = req()->path();
// /users

// 主机名
$host = req()->host();
// example.com

// 端口号
$port = req()->port();
// 80 (或 443 等)

// 协议
$scheme = req()->scheme();
// http 或 https

// 域名
$domain = req()->domain();
// example.com

// 基础 URL
$baseUrl = req()->baseUrl();
// http://example.com

// URL 根路径
$root = req()->root();
```

### 请求方法判断

```php
$request = req();

// 判断 HTTP 方法
$request->isGet();      // GET
$request->isPost();     // POST
$request->isPut();      // PUT
$request->isPatch();    // PATCH
$request->isDelete();   // DELETE
$request->isOptions();  // OPTIONS
$request->isHead();     // HEAD

// 获取请求方法
$method = $request->method();  // GET, POST, PUT, DELETE 等

// 获取原始请求方法（不受 _method 伪装影响）
$realMethod = $request->getRealMethod();
```

### 请求头信息

```php
// 获取 User-Agent
$ua = req()->userAgent();

// 获取 Referer
$referer = req()->referer();

// 获取客户端 IP
$ip = req()->ip();

// 获取指定 Header
$contentType = req()->header('Content-Type');
$authorization = req()->header('Authorization');

// 检查是否是 AJAX 请求
$isAjax = req()->ajax();

// 检查是否期望 JSON 响应
$wantsJson = req()->wantsJson();

// 检查是否是安全连接
$isSecure = req()->isSecure();
```

### 其他请求信息

```php
// 获取请求时间
$time = req()->time();

// 获取旧的输入值（表单验证失败后回填）
$oldName = req()->old('name', '默认值');
```

## 响应对象 (Response)

`zap\http\Response` 提供了灵活的 HTTP 响应构建能力。

### 创建响应

```php
use zap\http\Response;

// 基本文本响应
return Response::ok('Hello World');

// 使用 response() 辅助函数
return response('Hello World');
```

### 状态码快捷工厂方法

```php
// 200 OK
Response::ok('操作成功');
Response::ok(['data' => $users]);

// 201 Created
Response::created('资源已创建');
Response::created(['id' => $newId]);

// 400 Bad Request
Response::badRequest('请求参数有误');

// 401 Unauthorized
Response::unauthorized('请先登录');

// 403 Forbidden
Response::forbidden('您没有权限执行此操作');

// 404 Not Found
Response::notFound('资源未找到');

// 204 No Content
Response::noContent();

// 自定义状态码
Response::make('内容', 418);  // I'm a teapot
```

### 响应类型设置（链式调用）

```php
// JSON 响应
Response::ok(['name' => 'Zap', 'version' => '1.0'])
    ->json()
    ->send();

// 等价于
response()->json(['name' => 'Zap', 'version' => '1.0'])->send();

// HTML 响应
Response::ok('<h1>Hello</h1>')->html()->send();

// 纯文本响应
Response::ok('Plain text')->text()->send();

// 设置内容
response()->setContent('<p>HTML Content</p>')->html()->send();
```

### 响应头设置

```php
// 设置单个 Header
response('data')
    ->header('X-Custom-Header', 'value')
    ->header('Cache-Control', 'no-cache')
    ->send();

// 设置多个 Headers
response()->json($data)
    ->headers([
        'X-API-Version' => '1.0',
        'X-RateLimit-Remaining' => 99,
    ])
    ->send();

// 获取已设置的 Header
$headers = response()->getHeaders();
```

### 响应状态码

```php
// 获取当前状态码
$code = response()->getStatusCode();

// 设置状态码
response('Not Found')->setStatusCode(404)->send();

// 链式调用
response()->json($data)->setStatusCode(201)->send();
```

### Cookie 响应

```php
// 设置 Cookie
response('OK')
    ->cookie('user_id', '12345', time() + 3600)  // 1 小时后过期
    ->cookie('preferences', json_encode($prefs), time() + 86400 * 30, '/', null, true, true)  // 30天, Secure, HttpOnly
    ->send();
```

### 文件下载

```php
// 下载文件
response()
    ->download('/path/to/report.pdf', '季度报告.pdf')
    ->send();

// 强制下载（带自定义 Header）
response()
    ->download('/path/to/file.zip', 'archive.zip')
    ->header('X-Download-Source', 'app')
    ->send();
```

### 重定向

```php
// 重定向
response()->redirect('/login')->send();

// 使用命名路由
$url = Router::url('user.profile', ['id' => 5]);
response()->redirect($url)->send();
```

### 发送响应

```php
// 构建并发送
$response = response()->json($data);
$response->send();

// 直接返回响应对象（路由处理器返回时框架自动调用 send()）
return response()->json(['status' => 'ok']);
```

## Request 门面

通过 Request 门面可以静态访问请求对象：

```php
use zap\facades\Request;

// 等同于 req()->input('name')
$name = Request::input('name');

// 等同于 req()->json()
$data = Request::json();

// 判断请求方法
if (Request::isPost()) {
    // ...
}

// 获取完整 URL
$url = Request::fullUrl();
```

## 完整示例

### 登录接口

```php
<?php

namespace App\Controllers;

use zap\http\Controller;

class AuthController extends Controller
{
    public function login()
    {
        $request = $this->request();

        // 验证输入
        $email = $request->input('email');
        $password = $request->input('password');

        if (!$email || !$password) {
            return $this->response()
                ->json(['error' => '邮箱和密码不能为空'])
                ->setStatusCode(400)
                ->send();
        }

        // 查询用户
        $user = DB::table('users')->where('email', $email)->first();

        if (!$user || !password_verify($password, $user['password'])) {
            return response()
                ->json(['error' => '邮箱或密码错误'])
                ->setStatusCode(401)
                ->send();
        }

        // 生成 token
        $token = bin2hex(random_bytes(32));

        // 保存 token
        DB::table('user_tokens')->insert([
            'user_id'    => $user['id'],
            'token'      => hash('sha256', $token),
            'created_at' => date('Y-m-d H:i:s'),
            'expires_at' => date('Y-m-d H:i:s', strtotime('+7 days')),
        ]);

        return response()
            ->json([
                'message' => '登录成功',
                'token'   => $token,
                'user'    => [
                    'id'    => $user['id'],
                    'name'  => $user['name'],
                    'email' => $user['email'],
                ],
            ])
            ->header('X-Auth-Timestamp', time())
            ->send();
    }

    public function logout()
    {
        $token = $this->request()->header('Authorization');

        if ($token) {
            $token = str_replace('Bearer ', '', $token);
            DB::table('user_tokens')
                ->where('token', hash('sha256', $token))
                ->delete();
        }

        return response()->json(['message' => '已退出登录'])->send();
    }

    public function profile()
    {
        // 从认证中间件设置的用户信息中读取
        $userId = $this->request()->input('auth_user_id');

        $user = DB::table('users')->find($userId);

        if (!$user) {
            return response()->json(['error' => '用户未找到'], 404)->send();
        }

        unset($user['password']);

        return response()->json(['data' => $user])->send();
    }
}
```

### 文件上传接口

```php
public function upload()
{
    $request = $this->request();

    // 检查文件是否存在
    if (!$request->hasFile('file')) {
        return response()
            ->json(['error' => '请选择要上传的文件'], 400)
            ->send();
    }

    $file = $request->file('file');

    // 验证文件
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        return response()
            ->json(['error' => '不支持的文件类型'], 422)
            ->send();
    }

    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $maxSize) {
        return response()
            ->json(['error' => '文件大小不能超过 5MB'], 422)
            ->send();
    }

    // 生成唯一文件名
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = UUID::v4() . '.' . $extension;
    $destPath = storage_path('uploads/' . date('Y/m/d') . '/' . $filename);

    // 确保目录存在
    $destDir = dirname($destPath);
    if (!is_dir($destDir)) {
        mkdir($destDir, 0755, true);
    }

    // 移动文件
    move_uploaded_file($file['tmp_name'], $destPath);

    return response()
        ->json([
            'message' => '上传成功',
            'url'     => url('storage/uploads/' . date('Y/m/d') . '/' . $filename),
            'name'    => $file['name'],
            'size'    => $file['size'],
        ], 201)
        ->send();
}
```
