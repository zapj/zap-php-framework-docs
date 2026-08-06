# 安全

## 概述

Web 应用安全是开发中不可忽视的重要环节。Zap PHP Framework 提供了多种安全机制，包括会话安全、密码哈希、CSRF 保护、输入验证等，帮助您构建安全可靠的 Web 应用。

## 会话安全

### 重新生成 Session ID

登录后重新生成 Session ID 是防止会话固定攻击（Session Fixation）的关键措施：

```php
use zap\http\Session;

// 用户登录成功后
Session::regenerate(true);  // true 表示删除旧会话数据

// 存储用户信息
Session::set('user_id', $user['id']);
Session::set('user_name', $user['name']);
```

### 安全登出

登出时应彻底销毁会话数据：

```php
public function logout()
{
    // 清除持久登录 Cookie
    if (isset($_COOKIE['remember_token'])) {
        setcookie('remember_token', '', time() - 3600, '/', '', true, true);
    }

    // 完全销毁会话
    Session::destroy();

    return response()->redirect('/');
}
```

### 会话安全配置

在 `php.ini` 中配置安全的会话参数：

```ini
; 仅通过 Cookie 传递 Session ID（禁用 URL 传递）
session.use_only_cookies = 1

; 使用严格模式
session.use_strict_mode = 1

; 设置 HttpOnly（防止 JavaScript 访问）
session.cookie_httponly = 1

; HTTPS 环境下设置 Secure
session.cookie_secure = 1

; 设置 SameSite 属性
session.cookie_samesite = "Lax"

; 会话过期时间（秒）
session.gc_maxlifetime = 1440
```

### 会话空闲超时

```php
// 检查会话空闲时间
$idleTimeout = 1800; // 30 分钟

if (Session::has('last_activity')) {
    $idleTime = time() - Session::get('last_activity');

    if ($idleTime > $idleTimeout) {
        Session::destroy();
        return response()->json(['error' => '会话已过期，请重新登录'], 401);
    }
}

// 更新最后活动时间
Session::set('last_activity', time());
```

## 密码安全

使用 `zap\crypto\Hash` 进行安全的密码哈希。优先使用 Argon2id 算法，不可用时自动回退到 bcrypt。详细 API 参考请见 [Crypto](/api/crypto)。

### 密码哈希

```php
use zap\crypto\Hash;

// 注册时哈希密码
$hashedPassword = Hash::password($userInputPassword);

// 存储到数据库
DB::table('users')->insert([
    'name'     => $name,
    'email'    => $email,
    'password' => $hashedPassword,
]);
```

### 密码验证

```php
// 登录时验证密码
$user = DB::table('users')->where('email', $email)->first();

if (!$user || !Hash::passwordVerify($password, $user['password'])) {
    // 密码错误
    Log::warning('登录失败', ['email' => $email, 'ip' => req()->ip()]);
    return response()->json(['error' => '邮箱或密码错误'], 401);
}
```

### 检查是否需要重新哈希

当部署环境升级了哈希算法或调整 cost 时，应检查旧哈希是否需要更新：

```php
// 登录成功后检查
if (Hash::passwordNeedsRehash($user['password'])) {
    DB::table('users')->where('id', $user['id'])->update([
        'password' => Hash::password($password),
    ]);
}
```

### 密码强度策略

```php
function validatePasswordStrength($password)
{
    $errors = [];

    if (strlen($password) < 8) {
        $errors[] = '密码长度至少 8 个字符';
    }

    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = '密码必须包含至少一个大写字母';
    }

    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = '密码必须包含至少一个小写字母';
    }

    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = '密码必须包含至少一个数字';
    }

    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        $errors[] = '密码必须包含至少一个特殊字符';
    }

    return $errors;
}

// 在注册/修改密码时使用
$errors = validatePasswordStrength($password);
if (!empty($errors)) {
    return response()->json(['errors' => $errors], 422);
}
```

## CSRF 保护

### CSRF 基本原理

CSRF（Cross-Site Request Forgery，跨站请求伪造）攻击利用用户已登录的身份，在用户不知情的情况下执行恶意操作。

### 实现 CSRF Token

```php
use zap\crypto\Random;
use zap\crypto\Hash;

// 生成 CSRF Token 并存入 Session
function generateCsrfToken()
{
    if (!Session::has('csrf_token')) {
        Session::set('csrf_token', Random::hex(64));
    }
    return Session::get('csrf_token');
}

// 验证 CSRF Token（constant-time 比较）
function verifyCsrfToken($token)
{
    if (!Session::has('csrf_token')) {
        return false;
    }

    return hash_equals(Session::get('csrf_token'), $token);
}
```

### 在表单中使用 CSRF Token

```html
<!-- 在表单中添加隐藏字段 -->
<form method="POST" action="/user/update">
    <input type="hidden" name="_token" value="<?= generateCsrfToken() ?>">

    <input type="text" name="name" value="<?= esc($user['name']) ?>">
    <input type="email" name="email" value="<?= esc($user['email']) ?>">

    <button type="submit">保存</button>
</form>
```

### CSRF 中间件

```php
<?php

namespace App\Middleware;

use zap\http\Session;

class CsrfMiddleware
{
    // 不需要验证的方法
    protected array $except = ['GET', 'HEAD', 'OPTIONS'];

    public function handle($request, $next)
    {
        $method = $request->method();

        // GET/HEAD/OPTIONS 请求不需要验证
        if (in_array($method, $this->except)) {
            return $next($request);
        }

        // 获取请求中的 Token
        $token = $request->input('_token')
            ?? $request->header('X-CSRF-TOKEN')
            ?? $request->header('X-Csrf-Token');

        // 验证 Token
        if (!$token || !$this->verifyToken($token)) {
            return response()
                ->json(['error' => 'CSRF Token 验证失败'], 419)
                ->send();
        }

        return $next($request);
    }

    protected function verifyToken($token)
    {
        if (!Session::has('csrf_token')) {
            return false;
        }

        return hash_equals(Session::get('csrf_token'), $token);
    }
}
```

### AJAX 请求携带 CSRF Token

```javascript
// 在 AJAX 请求头中携带 CSRF Token
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

fetch('/api/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify(data),
})
.then(response => response.json())
.then(result => console.log(result));
```

```html
<!-- 在 HTML head 中输出 CSRF Token -->
<meta name="csrf-token" content="<?= generateCsrfToken() ?>">
```

## 输入验证与过滤

### 请求数据验证

始终对用户输入进行验证，不要信任任何来自客户端的数据：

```php
public function store()
{
    $data = $this->request()->json();

    // 使用验证器验证
    $validator = new Validator();

    $rules = [
        'name'  => 'required|string|min:2|max:50',
        'email' => 'required|email|unique:users,email',
        'age'   => 'integer|min:1|max:120',
    ];

    if (!$validator->validate($data, $rules)) {
        return $this->json(['errors' => $validator->errors()], 422);
    }

    // 只提取允许的字段
    $safeData = Arr::only($data, ['name', 'email', 'age']);

    // 创建用户
    $id = DB::table('users')->insert($safeData);

    return $this->json(['id' => $id], 201);
}
```

### SQL 注入防护

使用参数绑定而非拼接 SQL 字符串：

```php
// 错误：拼接 SQL（存在 SQL 注入风险）
$users = DB::select("SELECT * FROM users WHERE name = '{$name}'");

// 正确：使用参数绑定
$users = DB::select("SELECT * FROM users WHERE name = ?", [$name]);

// 使用查询构建器（自动参数绑定）
$users = DB::table('users')->where('name', $name)->getAll();
```

### XSS 防护

在输出用户内容到 HTML 时始终进行转义：

```html
<!-- 使用 esc() 函数转义 -->
<p><?= esc($user['bio']) ?></p>
<h1><?= esc($post['title']) ?></h1>

<!-- 使用 _e() 函数转义 -->
<span><?= _e($comment['body']) ?></span>
```

```php
// 在控制器中也可以手动转义
use zap\view\PHPRenderer;

$safeContent = PHPRenderer::esc($userInput);
```

### 文件上传安全

```php
public function upload()
{
    $file = $this->request()->file('attachment');

    if (!$file) {
        return $this->json(['error' => '请选择文件'], 400);
    }

    // 1. 验证文件类型（使用 MIME 类型，不要信任扩展名）
    $allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
    ];

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowedMimes)) {
        return $this->json(['error' => '不支持的文件类型'], 422);
    }

    // 2. 限制文件大小（5MB）
    $maxSize = 5 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        return $this->json(['error' => '文件大小不能超过 5MB'], 422);
    }

    // 3. 生成安全的文件名（使用 Random）
    use zap\crypto\Random;
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = Random::hex(32) . '.' . strtolower($extension);

    // 4. 存储到非公开目录
    $destPath = storage_path('secure_uploads/' . date('Y/m/d') . '/' . $filename);
    $destDir = dirname($destPath);
    if (!is_dir($destDir)) {
        mkdir($destDir, 0755, true);
    }

    move_uploaded_file($file['tmp_name'], $destPath);

    return $this->json([
        'message' => '上传成功',
        'file_id' => $filename,
    ], 201);
}
```

## 安全最佳实践

### 1. 生产环境配置

```php
// config/config.php
return [
    'debug' => false,          // 关闭调试模式
    'log'   => true,           // 开启日志
    'log_enabled' => true,
];
```

```ini
; php.ini 生产环境配置
display_errors = Off
display_startup_errors = Off
expose_php = Off
```

### 2. 敏感信息管理

```php
// 不要将敏感信息硬编码在代码中
// 错误：
$apiKey = 'sk-abc123xyz';

// 正确：使用环境变量或配置文件
$apiKey = config('services.api_key');
// 或
$apiKey = getenv('API_KEY');
```

### 3. HTTPS 强制

```php
// 中间件：强制 HTTPS
class ForceHttpsMiddleware
{
    public function handle($request, $next)
    {
        if (!$request->isSecure() && !config('config.debug')) {
            $url = 'https://' . $request->host() . $request->fullUrl();
            return response()->redirect($url)->send();
        }

        return $next($request);
    }
}
```

### 4. 安全响应头

```php
// 添加安全相关的 HTTP 头
class SecurityHeadersMiddleware
{
    public function handle($request, $next)
    {
        $response = $next($request);

        $response
            ->header('X-Content-Type-Options', 'nosniff')
            ->header('X-Frame-Options', 'DENY')
            ->header('X-XSS-Protection', '1; mode=block')
            ->header('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        return $response;
    }
}
```

### 5. 速率限制

```php
// 简单的速率限制实现
function rateLimit($key, $maxAttempts = 60, $decaySeconds = 60)
{
    $cacheKey = "rate_limit:{$key}:" . floor(time() / $decaySeconds);
    $attempts = Cache::increment($cacheKey);

    if ($attempts === 1) {
        Cache::set($cacheKey, 1, $decaySeconds);
    }

    if ($attempts > $maxAttempts) {
        return false; // 超出限制
    }

    return true;
}

// 在中间件中使用
if (!rateLimit(req()->ip(), 100, 60)) {
    return response()->json(['error' => '请求过于频繁'], 429);
}
```

### 6. 错误信息处理

```php
// 生产环境不要暴露内部错误细节
try {
    // 业务逻辑
    $result = $service->process($data);
} catch (\Exception $e) {
    Log::error('处理失败', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
    ]);

    // 返回通用错误信息
    return response()->json([
        'error' => '服务器处理失败，请稍后重试',
    ], 500);
}
```

## 安全检查清单

- [ ] 生产环境关闭 debug 模式
- [ ] 使用 HTTPS 加密传输
- [ ] 密码使用 `Hash::password()`（Argon2id/bcrypt）哈希存储
- [ ] 登录后重新生成 Session ID
- [ ] 登出时销毁会话数据
- [ ] 所有用户输入进行验证和过滤
- [ ] 输出到 HTML 的内容进行转义
- [ ] 使用参数绑定防止 SQL 注入
- [ ] 上传文件验证 MIME 类型
- [ ] 敏感操作使用 CSRF Token
- [ ] 设置安全的 HTTP 响应头
- [ ] 错误信息不暴露内部细节
- [ ] 实施 API 速率限制
- [ ] 记录安全相关事件到日志
- [ ] 定期更新框架和依赖包
