# 会话管理

## 概述

Zap PHP Framework 提供了简洁的 Session 管理类，支持数据存储、点分路径访问、Flash 消息、会话安全等功能。

## 基本使用

### 获取 Session 实例

```php
use zap\http\Session;

// 启动会话并获取实例
$session = Session::getInstance();

// 或者直接使用静态方法（自动启动会话）
$value = Session::get('key');
Session::set('key', 'value');
```

Session 采用单例模式，`getInstance()` 在首次调用时自动调用 `session_start()`。

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

// 使用点分路径设置嵌套值
Session::set('preferences.theme', 'dark');
Session::set('preferences.locale', 'zh-CN');
Session::set('preferences.notifications.email', true);
```

### 读取数据

```php
// 读取单个值
$username = Session::get('username');

// 带默认值（键不存在时返回）
$theme = Session::get('preferences.theme', 'light');

// 使用点分路径读取嵌套值
$locale = Session::get('preferences.locale', 'zh-CN');

// 读取整个数组
$user = Session::get('user');
// ['id' => 1, 'name' => '张三', 'email' => 'zhang@example.com', 'role' => 'admin']

// 读取数组中的嵌套字段
$userName = Session::get('user.name');   // 张三
$userRole = Session::get('user.role');   // admin
```

### 检查是否存在

```php
if (Session::has('username')) {
    echo '用户已设置';
}

// 检查嵌套键
if (Session::has('user.email')) {
    echo '邮箱已设置';
}

// 检查多个键
if (Session::has(['username', 'user.email'])) {
    // 所有键都存在
}
```

### 删除数据

```php
// 删除单个键
Session::forget('temp_data');

// 删除嵌套键
Session::forget('preferences.notifications');

// 获取并删除（类似 pop）
$value = Session::pull('draft_content', '默认值');
// 返回 draft_content 的值并从 Session 中删除

// 删除多个键
Session::forget('key1');
Session::forget('key2');
```

### 数组操作

```php
// 追加元素到数组
Session::push('notifications', '新消息1');
Session::push('notifications', '新消息2');
// Session::get('notifications') => ['新消息1', '新消息2']

// 自增
Session::set('login_attempts', 0);
Session::increment('login_attempts');     // 1
Session::increment('login_attempts', 5);  // 6

// 自减
Session::decrement('remaining_tries');    // 减 1
Session::decrement('remaining_tries', 2); // 减 2
```

### 获取全部或部分数据

```php
// 获取所有 Session 数据
$allData = Session::all();

// 获取指定键的数据
$subset = Session::only(['username', 'user', 'csrf_token']);
// ['username' => '张三', 'user' => [...], 'csrf_token' => '...']

// 获取指定键的数据（键不存在时跳过）
$subset = Session::only(['username', 'nonexistent']);
// ['username' => '张三']
```

## 点分路径访问详解

点分路径（dot notation）允许像访问多维数组一样访问嵌套的 Session 数据：

```php
// 存储嵌套数据
Session::set('cart.items', [
    ['id' => 1, 'name' => '商品A', 'qty' => 2],
    ['id' => 2, 'name' => '商品B', 'qty' => 1],
]);

Session::set('cart.total', 299.99);
Session::set('cart.coupon.code', 'SAVE20');
Session::set('cart.coupon.discount', 20.00);

// 读取嵌套数据
$items = Session::get('cart.items');
$total = Session::get('cart.total');
$couponCode = Session::get('cart.coupon.code');

// 实际存储结构
// $_SESSION['cart'] = [
//     'items' => [...],
//     'total' => 299.99,
//     'coupon' => ['code' => 'SAVE20', 'discount' => 20.00],
// ]
```

## Flash 消息

Flash 消息用于在请求之间传递临时数据，读取后自动清除。典型用途是表单提交后的成功/错误消息。

### 设置 Flash 消息

```php
// 设置单条 Flash 消息
Session::flash('success', '操作成功！');
Session::flash('error', '操作失败，请重试。');
Session::flash('warning', '请注意检查输入信息。');
Session::flash('info', '数据已自动保存。');

// 设置多条同类型消息（多次调用会自动追加为数组）
Session::flash('success', '用户创建成功');
Session::flash('success', '欢迎邮件已发送');
```

### 读取 Flash 消息

```php
// 检查是否有 Flash 消息
if (Session::hasFlash()) {
    // 有 Flash 消息
}

// 获取所有 Flash 消息（读取后自动删除）
$messages = Session::getFlash();
// [
//     'success' => ['操作成功！'],
//     'info'    => ['数据已自动保存。'],
// ]

// 在视图中显示 Flash 消息
$flash = Session::getFlash();
foreach ($flash as $type => $messages) {
    foreach ($messages as $msg) {
        echo "<div class=\"alert alert-{$type}\">{$msg}</div>";
    }
}
```

### 清除 Flash 消息

```php
// 手动清除所有 Flash 消息
Session::clearFlash();
```

### 完整表单示例

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

        $name = $request->input('name');
        $email = $request->input('email');
        $message = $request->input('message');

        // 验证
        $errors = [];
        if (empty($name)) $errors[] = '请填写姓名';
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = '请填写有效的邮箱';
        if (empty($message)) $errors[] = '请填写留言内容';

        if (!empty($errors)) {
            Session::flash('errors', $errors);
            Session::flash('old', $request->only(['name', 'email', 'message']));
            return response()->redirect('/contact');
        }

        // 保存留言
        DB::table('messages')->insert([
            'name'       => $name,
            'email'      => $email,
            'message'    => $message,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        Session::flash('success', '您的留言已提交，我们会尽快回复！');

        return response()->redirect('/contact');
    }
}
```

对应的视图模板：

```html
<!-- app/views/contact/form.html -->
<h1>联系我们</h1>

<?php $flash = Session::getFlash(); ?>

<?php if (isset($flash['success'])): ?>
    <?php foreach ($flash['success'] as $msg): ?>
        <div class="alert alert-success"><?= esc($msg) ?></div>
    <?php endforeach; ?>
<?php endif; ?>

<?php if (isset($flash['errors'])): ?>
    <?php foreach ($flash['errors'] as $error): ?>
        <div class="alert alert-danger"><?= esc($error) ?></div>
    <?php endforeach; ?>
<?php endif; ?>

<form method="POST" action="/contact">
    <div class="form-group">
        <label>姓名</label>
        <input type="text" name="name" value="<?= esc($flash['old']['name'] ?? '') ?>">
    </div>
    <div class="form-group">
        <label>邮箱</label>
        <input type="email" name="email" value="<?= esc($flash['old']['email'] ?? '') ?>">
    </div>
    <div class="form-group">
        <label>留言</label>
        <textarea name="message"><?= esc($flash['old']['message'] ?? '') ?></textarea>
    </div>
    <button type="submit">提交</button>
</form>
```

## 会话安全

### 重新生成 Session ID

重新生成 Session ID 可以有效防止会话固定攻击（Session Fixation）：

```php
// 登录成功后重新生成 Session ID
Session::regenerate();

// 重新生成并删除旧会话数据
Session::regenerate(true);
```

典型使用场景：

```php
public function login()
{
    // ... 验证用户凭据 ...

    // 登录成功，重新生成 Session ID
    Session::regenerate(true);

    // 存储用户信息
    Session::set('user_id', $user['id']);
    Session::set('user_name', $user['name']);

    Session::flash('success', '登录成功');

    return response()->redirect('/dashboard');
}
```

### 销毁会话

```php
// 完全销毁会话（登出时使用）
Session::destroy();

// 典型登出流程
public function logout()
{
    // 清除用户数据
    Session::destroy();

    // 重定向到首页
    return response()->redirect('/');
}
```

## 完整示例：用户认证系统

```php
<?php

namespace App\Controllers;

use zap\http\Controller;

class AuthController extends Controller
{
    /**
     * 显示登录表单
     */
    public function loginForm()
    {
        return view('auth.login');
    }

    /**
     * 处理登录请求
     */
    public function login()
    {
        $request = $this->request();

        $email = $request->input('email');
        $password = $request->input('password');
        $remember = $request->input('remember', false);

        // 验证
        if (empty($email) || empty($password)) {
            Session::flash('error', '请填写邮箱和密码');
            return response()->redirect('/login');
        }

        // 查询用户
        $user = DB::table('users')->where('email', $email)->first();

        if (!$user || !password_verify($password, $user['password'])) {
            Session::flash('error', '邮箱或密码错误');

            // 记录登录尝试次数
            $attempts = Session::get('login_attempts', 0);
            Session::set('login_attempts', $attempts + 1);

            if ($attempts >= 5) {
                Session::flash('error', '登录尝试次数过多，请 15 分钟后再试');
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

        // 清除登录尝试次数
        Session::forget('login_attempts');

        // 处理"记住我"
        if ($remember) {
            $token = bin2hex(random_bytes(32));
            setcookie('remember_token', $token, time() + 86400 * 30, '/', '', true, true);

            DB::table('users')->where('id', $user['id'])->update([
                'remember_token' => hash('sha256', $token),
            ]);
        }

        Session::flash('success', '欢迎回来，' . $user['name'] . '！');

        return response()->redirect('/dashboard');
    }

    /**
     * 登出
     */
    public function logout()
    {
        // 清除"记住我"cookie
        if (isset($_COOKIE['remember_token'])) {
            setcookie('remember_token', '', time() - 3600, '/');
        }

        Session::destroy();

        return response()->redirect('/');
    }

    /**
     * 检查登录状态（中间件中使用）
     */
    public static function check()
    {
        return Session::has('user.id');
    }

    /**
     * 获取当前用户
     */
    public static function user()
    {
        return Session::get('user');
    }
}
```

## 最佳实践

1. **登录后重新生成 Session ID**：使用 `Session::regenerate(true)` 防止会话固定攻击
2. **敏感操作前验证**：修改密码、修改邮箱等操作前重新验证用户身份
3. **合理设置 Session 过期时间**：通过 `session.gc_maxlifetime` 配置会话有效期
4. **使用 HTTPS**：生产环境启用 HTTPS 并设置 `session.cookie_secure = 1`
5. **设置 HttpOnly**：配置 `session.cookie_httponly = 1` 防止 XSS 攻击获取 Cookie
6. **定期清理过期会话**：确保 `session.gc_probability` 和 `session.gc_divisor` 合理配置
