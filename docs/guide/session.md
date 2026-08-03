# 会话管理

## 概述

Zap PHP Framework 提供了功能完备的 Session 管理类，支持：

- **静态代理调用**：`Session::get()`、`Session::set()` 开箱即用
- **会话配置**：Cookie 参数、GC 策略、SameSite 等一站式配置
- **点分路径访问**：`Session::get('user.profile.name')` 嵌套读写
- **Flash 消息**：跨请求一次性消息，支持时间戳和纯文本两种读取模式
- **CSRF 保护**：内置 Token 生成、校验、再生
- **表单旧值**：`flashInput()` / `old()` 简化表单回填
- **计数与数组操作**：`increment` / `decrement` / `push`
- **会话安全**：ID 再生、自定义 ID、活动追踪

## 快速开始

```php
use zap\http\Session;

// 静态调用 — 无需 getInstance()，Session 自动启动
Session::set('username', '张三');
echo Session::get('username');        // 张三
echo Session::get('theme', 'light');  // light（默认值）

// 也可走实例调用
$session = Session::getInstance();
```

## 会话配置

在应用启动阶段调用 `configure()` 设置会话参数，之后首次 `start()` 会自动应用：

```php
use zap\http\Session;

Session::configure([
    'name'            => 'MYAPP_SESSION',   // 会话名称（Cookie 键名）
    'cookie_lifetime' => 86400 * 7,         // 7 天
    'cookie_path'     => '/',
    'cookie_domain'   => '.example.com',    // 允许子域名共享
    'cookie_secure'   => true,              // HTTPS only
    'cookie_httponly' => true,              // 禁止 JS 访问
    'cookie_samesite' => 'Lax',             // Lax | Strict | None
    'gc_maxlifetime'  => 3600,              // 服务端 1 小时过期
    'gc_probability'  => 1,
    'gc_divisor'      => 100,
    'lazy_write'      => true,              // 数据变更时才写回
    'strict_mode'     => true,              // 拒绝未初始化 ID
    'last_activity'   => true,              // 记录最后活动时间
]);

// 也可在 start() 时直接传入选项
Session::start(['cookie_lifetime' => 3600]);
```

### 配置项速查

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `name` | string | `ZAP_SESSION` | 会话名称（Cookie 键名） |
| `cookie_lifetime` | int | `0` | Cookie 生命周期（秒），0=浏览器关闭时过期 |
| `cookie_path` | string | `/` | Cookie 有效路径 |
| `cookie_domain` | string | `''` | Cookie 有效域名 |
| `cookie_secure` | bool | `false` | 仅 HTTPS 发送 Cookie |
| `cookie_httponly` | bool | `true` | 禁止 JavaScript 访问 |
| `cookie_samesite` | string | `Lax` | SameSite：`Lax` / `Strict` / `None` |
| `save_path` | string | — | 自定义会话文件保存目录 |
| `gc_maxlifetime` | int | `1440` | 服务端 GC 过期时间（秒） |
| `gc_probability` | int | `1` | GC 触发概率分子 |
| `gc_divisor` | int | `100` | GC 触发概率分母 |
| `lazy_write` | bool | `true` | 仅在数据变化时写入 |
| `strict_mode` | bool | `true` | 严格模式，拒绝未初始化 ID |
| `last_activity` | bool | `true` | 记录最后活动时间 |

## 基本读写

### 存储数据

```php
use zap\http\Session;

// 设置单个值
Session::set('username', '张三');

// 设置数组
Session::set('user', [
    'id'    => 1,
    'name'  => '张三',
    'email' => 'zhang@example.com',
    'role'  => 'admin',
]);

// 点分路径设置嵌套值
Session::set('preferences.theme', 'dark');
Session::set('preferences.locale', 'zh-CN');
Session::set('preferences.notifications.email', true);
```

### 读取数据

```php
// 读取值（支持默认值）
$username = Session::get('username');
$theme    = Session::get('preferences.theme', 'light');

// 点分路径读取嵌套字段
$userName  = Session::get('user.name');   // 张三
$userRole  = Session::get('user.role');   // admin
$notifyOn  = Session::get('preferences.notifications.email');
```

### 存在性检查

```php
if (Session::has('username')) {
    echo '用户已登录';
}

// 检查嵌套键
if (Session::has('user.email')) {
    echo '邮箱已设置';
}
```

> **提示**：`has()` 检查的是键是否存在，与值为 `null` / `false` / `0` 无关。

### 删除数据

```php
// 删除单个键
Session::forget('temp_data');

// 删除嵌套键
Session::forget('preferences.notifications');

// 取走 → 删除（pop 语义）
$value = Session::pull('draft_content', '默认值');

// 批量删除
Session::forget(['key1', 'key2', 'key3']);
```

### 数组与计数器

```php
// 向数组追加元素
Session::push('notifications', '新消息');
Session::push('notifications', '另一条');
// Session::get('notifications') => ['新消息', '另一条']

// 自增 / 自减
Session::set('views', 0);
Session::increment('views');      // 1
Session::increment('views', 10);  // 11
Session::decrement('views');      // 10
Session::decrement('views', 5);   // 5
```

### 批量读取

```php
// 获取全部数据
$all = Session::all();

// 仅取指定键（不存在的键会被跳过）
$subset = Session::only(['username', 'user.id', 'nonexistent']);
// ['username' => '张三', 'user.id' => 1]

// 排除指定键
$withoutSys = Session::except(['__zap_flash__', '__zap_csrf__']);

// 数据统计
$count = Session::count();         // 用户数据条数
$empty = Session::isEmpty();       // bool
```

## 点分路径详解

点分路径让嵌套 Session 数据像访问对象属性一样直观：

```php
Session::set('cart.items', [
    ['id' => 1, 'name' => '商品A', 'qty' => 2],
    ['id' => 2, 'name' => '商品B', 'qty' => 1],
]);
Session::set('cart.total', 299.99);
Session::set('cart.coupon.code', 'SAVE20');

// 内部存储结构
// $_SESSION['cart'] = [
//     'items'  => [...],
//     'total'  => 299.99,
//     'coupon' => ['code' => 'SAVE20'],
// ]

$code = Session::get('cart.coupon.code');  // 'SAVE20'
```

## Flash 消息

Flash 消息在读取后自动清除，典型场景是表单提交后的反馈通知。

### 写入消息

```php
Session::flash('success', '操作成功！');
Session::flash('error', '操作失败，请重试。');
Session::flash('warning', '请检查输入信息。');
Session::flash('info', '数据已自动保存。');

// 同类型多次调用会自动追加
Session::flash('success', '用户创建成功');
Session::flash('success', '欢迎邮件已发送');
```

### 读取消息

```php
// 检查是否存在
if (Session::hasFlash()) {
    // 有任意 Flash 消息
}
if (Session::hasFlash('error')) {
    // 有错误消息
}

// 获取原始格式（含 timestamp，适合精细化控制）
$flash = Session::getFlash();
foreach ($flash as $type => $messages) {
    foreach ($messages as $entry) {
        $text = $entry['message'];
        $time = date('H:i:s', $entry['timestamp']);
        echo "<div class='alert alert-{$type}'>[{$time}] {$text}</div>";
    }
}

// 获取纯文本消息（仅 message 字符串，推荐用法）
$messages = Session::getFlashMessages();
// ['success' => ['操作成功！', '欢迎邮件已发送']]

foreach ($messages['success'] ?? [] as $msg) {
    echo "<div class='alert alert-success'>{$msg}</div>";
}
```

### 清除消息

```php
Session::clearFlash();           // 清除所有
Session::clearFlash('error');    // 清除指定类型
Session::clearFlash(['error', 'warning']);
```

## 表单旧值

处理表单验证失败时，需要回填用户之前输入的内容。Session 内置了 `flashInput()` / `old()` 方法简化这一流程。

### 控制器

```php
<?php

namespace App\Controllers;

use zap\http\Controller;

class ContactController extends Controller
{
    public function form()
    {
        return view('contact.form');
    }

    public function submit()
    {
        $request = $this->request();

        $name    = $request->input('name');
        $email   = $request->input('email');
        $message = $request->input('message');

        // 验证
        $errors = [];
        if (empty($name))    $errors[] = '请填写姓名';
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL))
            $errors[] = '请填写有效邮箱';
        if (empty($message)) $errors[] = '请填写留言内容';

        if ($errors) {
            // ★ 保存当前输入供下一个请求使用
            Session::flashInput($request->only(['name', 'email', 'message']));

            foreach ($errors as $error) {
                Session::flash('error', $error);
            }
            return response()->redirect('/contact');
        }

        // 保存 ...
        Session::flash('success', '您的留言已提交！');
        return response()->redirect('/contact');
    }
}
```

### 视图中使用 `old()`

```html
<h1>联系我们</h1>

<?php
$messages = Session::getFlashMessages();
foreach ($messages['success'] ?? [] as $msg):
?>
    <div class="alert alert-success"><?= esc($msg) ?></div>
<?php endforeach; ?>
<?php foreach ($messages['error'] ?? [] as $msg): ?>
    <div class="alert alert-danger"><?= esc($msg) ?></div>
<?php endforeach; ?>

<form method="POST" action="/contact">
    <input type="text"  name="name"
           value="<?= esc(Session::old('name', '')) ?>">
    <input type="email" name="email"
           value="<?= esc(Session::old('email', '')) ?>">
    <textarea name="message"><?= esc(Session::old('message', '')) ?></textarea>
    <button type="submit">提交</button>
</form>
```

> **注意**：`old()` 返回的值在 `getFlash()` 或 `getFlashMessages()` 调用时会被 **自动清除**，因此确保在视图渲染前读取旧值。

## CSRF 保护

Zap Session 内置了 CSRF Token 机制，无需额外配置。

### 生成隐藏字段

```php
// 在表单中输出 CSRF Token（控制器中传给视图）
$csrf = Session::token();
```

```html
<form method="POST" action="/submit">
    <input type="hidden" name="_token" value="<?= esc(Session::token()) ?>">
    <!-- 其他表单字段 -->
</form>
```

### 验证 Token

```php
// 控制器中验证
if (!Session::validateToken($request->input('_token', ''))) {
    Session::flash('error', '安全校验失败，请刷新页面重试');
    return response()->redirect($request->url());
}

// 或需要时手动再生 Token（如登录成功后）
Session::regenerateToken(true);
```

### CSRF 方法速查

| 方法 | 说明 |
|------|------|
| `Session::token()` | 获取当前 CSRF Token |
| `Session::regenerateToken()` | 再生 Token（不存在时生成） |
| `Session::regenerateToken(true)` | 强制再生 Token |
| `Session::validateToken($token)` | 验证 Token 是否有效 |

## 会话信息

```php
// Session ID
$id = Session::getId();

// 活动追踪
$lastSeen = Session::lastActivity();  // Unix 时间戳
$duration = Session::age();           // 当前已存活秒数
```

使用 `@internal` 标记的方法仅供内部使用，外部代码无需直接调用。

## 会话安全

### 防止会话固定攻击

登录成功后立即再生 Session ID：

```php
public function login()
{
    // ... 验证凭据 ...

    Session::regenerate(true);     // 再生 ID，删除旧数据
    Session::set('user_id', $user['id']);
    Session::flash('success', '登录成功！');

    return response()->redirect('/dashboard');
}
```

### 自定义 Session ID（session hijack 防御）

```php
// 在 start() 之前设置自定义 ID
$customId = hash('sha256', $userId . request()->ip() . 'secret_salt');
Session::setId($customId);
Session::start();
```

### 登出

```php
public function logout()
{
    Session::destroy();        // 完全销毁会话
    return response()->redirect('/');
}
```

### 生产环境安全配置

```php
Session::configure([
    'name'            => '__Host-SID',        // 前缀绑定域名（浏览器安全策略）
    'cookie_secure'   => true,                // HTTPS only
    'cookie_httponly' => true,                // 禁止 JS 访问
    'cookie_samesite' => 'Lax',               // 防止 CSRF 携带 Cookie
    'cookie_lifetime' => 3600,                // 1 小时过期
    'gc_maxlifetime'  => 3600,
    'strict_mode'     => true,                // 拒绝未初始化的 Session ID
]);
```

## 完整示例：用户认证系统

```php
<?php

namespace App\Controllers;

use zap\http\Controller;

class AuthController extends Controller
{
    public function loginForm()
    {
        return view('auth.login', ['csrf' => Session::token()]);
    }

    public function login()
    {
        $request  = $this->request();
        $email    = $request->input('email');
        $password = $request->input('password');
        $token    = $request->input('_token');

        // CSRF 校验
        if (!Session::validateToken($token)) {
            Session::flash('error', '页面已过期，请刷新重试');
            return response()->redirect('/login');
        }

        // 参数校验
        if (empty($email) || empty($password)) {
            Session::flashInput(['email' => $email]);
            Session::flash('error', '请填写邮箱和密码');
            return response()->redirect('/login');
        }

        // 查询用户
        $user = DB::table('users')->where('email', $email)->first();

        if (!$user || !password_verify($password, $user['password'])) {
            Session::flashInput(['email' => $email]);

            $attempts = Session::get('login_attempts', 0);
            Session::increment('login_attempts');

            if ($attempts >= 5) {
                Session::flash('error', '尝试次数过多，请 15 分钟后重试');
            } else {
                Session::flash('error', '邮箱或密码错误');
            }
            return response()->redirect('/login');
        }

        // 登录成功
        Session::regenerate(true);
        Session::set('user', [
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ]);
        Session::forget('login_attempts');

        // 记住我
        if ($request->input('remember')) {
            $token = bin2hex(random_bytes(32));
            setcookie('remember_token', $token, time() + 86400 * 30, '/', '', true, true);
            DB::table('users')->where('id', $user['id'])
                ->update(['remember_token' => hash('sha256', $token)]);
        }

        Session::flash('success', '欢迎回来，' . $user['name'] . '！');
        return response()->redirect('/dashboard');
    }

    public function logout()
    {
        if (isset($_COOKIE['remember_token'])) {
            setcookie('remember_token', '', time() - 3600, '/');
        }
        Session::destroy();
        return response()->redirect('/');
    }

    public static function check(): bool
    {
        return Session::has('user.id');
    }

    public static function user(): ?array
    {
        return Session::get('user');
    }
}
```

对应的登录视图模板：

```html
<h1>用户登录</h1>

<?php foreach (Session::getFlashMessages()['error'] ?? [] as $msg): ?>
    <div class="alert alert-danger"><?= esc($msg) ?></div>
<?php endforeach; ?>

<form method="POST" action="/login">
    <input type="hidden" name="_token" value="<?= esc($csrf) ?>">

    <label>邮箱</label>
    <input type="email" name="email" value="<?= esc(Session::old('email', '')) ?>">

    <label>密码</label>
    <input type="password" name="password">

    <label><input type="checkbox" name="remember" value="1"> 记住我</label>

    <button type="submit">登录</button>
</form>
```

## 最佳实践

1. **生产环境启用 `cookie_secure` + `cookie_httponly`**，防止 XSS 和中间人攻击
2. **登录后调用 `Session::regenerate(true)`** 防止会话固定攻击
3. **所有 POST/PUT/DELETE 表单添加 CSRF Token**，调用 `Session::token()` 和 `Session::validateToken()`
4. **表单验证失败时调用 `Session::flashInput()`**，视图用 `old()` 回填
5. **使用 `getFlashMessages()` 代替 `getFlash()`**，获取更简洁的消息格式
6. **合理配置 `gc_maxlifetime` 和 `cookie_lifetime`**，平衡安全与用户体验
7. **避免在 Session 中存储大量数据**，保持轻量（推荐 < 4KB）
8. **使用 Redis / 数据库驱动存储会话**（未来版本支持）替代文件系统以获得更好的扩展性
