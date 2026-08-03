# 辅助函数

## 概述

Zap PHP Framework 提供了丰富的辅助函数和工具类，帮助开发者高效地完成常见任务。这些函数和类涵盖路径处理、数组操作、字符串处理、日期时间、UUID 生成、随机数生成、密码哈希等。

## 全局辅助函数

### app() - 获取应用实例

```php
// 获取 App 实例
$app = app();

// 通过 App 实例创建对象
$service = app()->make(SomeService::class);
```

### config() - 读取配置

```php
// 读取配置
$debug = config('config.debug', false);
$dbHost = config('database.master.host', '127.0.0.1');

// 等价于 Config::get()
```

### config_set() - 设置配置

```php
// 运行时修改配置
config_set('config.debug', false);
config_set('cache.default', 'redis');
```

### 路径辅助函数

```php
// 项目根目录
$root = base_path();                    // /path/to/project
$configFile = base_path('config/cache.php');

// 配置文件目录
$path = config_path();                  // /path/to/project/config
$cacheConfig = config_path('cache.php');

// 变量/缓存目录
$path = var_path();                     // /path/to/project/var
$cacheDir = var_path('cache');
$logDir = var_path('logs');

// 静态资源目录
$path = assets_path();                  // /path/to/project/assets
$cssFile = assets_path('css/app.css');

// 存储目录
$path = storage_path();                 // /path/to/project/storage
$uploadDir = storage_path('uploads');

// 公共目录（Web 入口）
$path = public_path();                  // /path/to/project/public
$indexFile = public_path('index.php');

// 资源目录
$path = resource_path();                // /path/to/project/resources
$scssFile = resource_path('scss/app.scss');

// 主题目录
$path = themes_path();                  // /path/to/project/themes
$themeViews = themes_path('default/views');
```

### url() - 生成 URL

```php
// 静态资源 URL
$cssUrl = url('/assets/css/app.css');
// http://example.com/assets/css/app.css

// 带参数的 URL
$url = url('/user/profile', ['id' => 5]);
```

### asset() - 静态资源 URL

```php
// 等同于 url('/assets/...')
$jsUrl = asset('js/app.js');
// http://example.com/assets/js/app.js

$imgUrl = asset('images/logo.png');
```

### response() - 创建响应

```php
// 快速创建响应
return response('Hello World');

// JSON 响应
return response()->json(['status' => 'ok']);

// 带状态码
return response('Not Found', 404);
```

### req() - 获取请求对象

```php
// 获取 ZapRequest 实例
$request = req();

$name = req()->input('name');
$isPost = req()->isPost();
```

### view() - 渲染视图

```php
// 渲染视图
return view('home.index', ['title' => '首页']);

// 等价于
return \zap\view\View::make('home.index', ['title' => '首页'])->show();
```

## Arr 类 - 数组操作

`zap\util\Arr` 提供了便捷的数组操作方法，支持点分路径（dot notation）。

### Arr::get() - 读取数组值

```php
use zap\util\Arr;

$data = [
    'user' => [
        'name' => '张三',
        'profile' => [
            'city' => '北京',
            'age' => 28,
        ],
    ],
];

// 点分路径读取
$name = Arr::get($data, 'user.name');              // '张三'
$city = Arr::get($data, 'user.profile.city');      // '北京'
$age = Arr::get($data, 'user.profile.age');        // 28

// 带默认值
$gender = Arr::get($data, 'user.profile.gender', '未知'); // '未知'
$phone = Arr::get($data, 'user.phone', 'N/A');            // 'N/A'
```

### Arr::set() - 设置数组值

```php
$data = [];

// 使用点分路径设置值
Arr::set($data, 'app.name', 'Zap App');
Arr::set($data, 'app.version', '1.0.5');
Arr::set($data, 'database.master.host', '127.0.0.1');
Arr::set($data, 'database.master.port', 3306);

// 结果
// [
//     'app' => ['name' => 'Zap App', 'version' => '1.0.5'],
//     'database' => ['master' => ['host' => '127.0.0.1', 'port' => 3306]],
// ]
```

### Arr::has() - 检查键是否存在

```php
$data = ['user' => ['name' => '张三', 'email' => 'zhang@example.com']];

Arr::has($data, 'user.name');   // true
Arr::has($data, 'user.phone');  // false
Arr::has($data, 'user');        // true
```

### Arr::only() - 提取指定键

```php
$user = [
    'id'       => 1,
    'name'     => '张三',
    'email'    => 'zhang@example.com',
    'password' => '$2y$10$...',
    'api_token'=> 'abc123',
];

// 只提取需要的字段
$safe = Arr::only($user, ['id', 'name', 'email']);
// ['id' => 1, 'name' => '张三', 'email' => 'zhang@example.com']
```

### Arr::except() - 排除指定键

```php
// 排除敏感字段
$safe = Arr::except($user, ['password', 'api_token']);
// ['id' => 1, 'name' => '张三', 'email' => 'zhang@example.com']
```

### Arr::dot() - 展开为点分路径

```php
$nested = [
    'app' => ['name' => 'Zap', 'debug' => true],
    'db'  => ['host' => 'localhost', 'port' => 3306],
];

$flat = Arr::dot($nested);
// [
//     'app.name' => 'Zap',
//     'app.debug' => true,
//     'db.host' => 'localhost',
//     'db.port' => 3306,
// ]
```

### Arr::undot() - 从点分路径还原

```php
$flat = [
    'app.name' => 'Zap',
    'app.debug' => true,
    'db.host' => 'localhost',
];

$nested = Arr::undot($flat);
// [
//     'app' => ['name' => 'Zap', 'debug' => true],
//     'db'  => ['host' => 'localhost'],
// ]
```

## Str 类 - 字符串操作

`zap\util\Str` 提供了常用的字符串处理方法：

```php
use zap\util\Str;

// 判断是否以指定字符串开头
Str::startsWith('HelloWorld', 'Hello');       // true
Str::startsWith('HelloWorld', 'World');       // false

// 判断是否以指定字符串结尾
Str::endsWith('HelloWorld', 'World');         // true
Str::endsWith('HelloWorld', 'Hello');         // false

// 判断是否包含子串
Str::contains('Hello World', 'World');        // true
Str::contains('Hello World', 'Zap');          // false

// 限制长度（超出部分用省略号）
Str::limit('这是一段很长的文本内容需要截断', 10);
// '这是一段很长的文本...'

Str::limit('Short', 20);
// 'Short'（不超出时不截断）

// 生成随机字符串
Str::random(16);    // 'aB3xK9mQ2wE7rT5p'
Str::random(32);    // 32 位随机字符串

// 转换为蛇形命名（snake_case）
Str::snake('HelloWorld');     // 'hello_world'
Str::snake('UserProfile');    // 'user_profile'

// 转换为驼峰命名（camelCase）
Str::camel('hello_world');    // 'helloWorld'
Str::camel('user_profile');   // 'userProfile'

// 转换为大驼峰命名（StudlyCase/PascalCase）
Str::studly('hello_world');   // 'HelloWorld'
Str::studly('user_profile');  // 'UserProfile'

// 生成 URL 友好的 Slug
Str::slug('Hello World! 你好');         // 'hello-world-ni-hao'
Str::slug('Product Name - 2024');       // 'product-name-2024'
```

## 日期时间

框架提供了 `Date` 门面用于日期时间操作：

```php
use zap\facades\Date;

// 当前日期时间
$now = Date::now();                      // 2024-01-15 10:30:00
$today = Date::today();                  // 2024-01-15

// 格式化
$formatted = Date::format('Y-m-d H:i:s');
$chinese = Date::format('Y年m月d日');

// 时间戳
$timestamp = Date::timestamp();
$unix = Date::unix();

// 日期计算
$tomorrow = Date::addDays(1);
$yesterday = Date::subDays(1);
$nextWeek = Date::addDays(7);
$lastMonth = Date::subMonths(1);

// 时间差
$diff = Date::diff('2024-01-01', '2024-01-15'); // 14 days
$hours = Date::diffInHours('2024-01-01 10:00', '2024-01-01 14:00'); // 4

// 判断
$isPast = Date::isPast('2023-12-31');    // true
$isFuture = Date::isFuture('2025-01-01'); // true

// 创建指定日期
$date = Date::create(2024, 6, 15);
$dateTime = Date::create(2024, 6, 15, 14, 30, 0);
```

## UUID 生成

```php
use zap\util\UUID;

// 生成 UUID v4（随机）
$uuid = UUID::v4();
// '550e8400-e29b-41d4-a716-446655440000'

// 生成有序 UUID（时间排序友好）
$ordered = UUID::ordered();
// 基于时间戳 + 随机数的有序 UUID

// 应用场景
// 数据库主键
$userId = UUID::v4();

// 文件名
$filename = UUID::v4() . '.jpg';

// API Trace ID
$traceId = UUID::v4();
header('X-Trace-Id: ' . $traceId);
```

## 随机数生成

```php
use zap\util\Random;

// 生成随机字符串
$str = Random::string(16);
// 'aB3xK9mQ2wE7rT5p'

// 生成随机数字字符串
$code = Random::numeric(6);
// '384721'

// 生成指定范围的随机整数
$num = Random::int(1000, 9999);
// 7362

// 验证码生成
$captcha = Random::numeric(4);        // '5829'
$token = Random::string(32);          // 32位随机令牌
$resetCode = Random::string(64);      // 密码重置令牌
```

## 密码哈希

`zap\util\Password` 提供了安全的密码哈希和验证功能（使用 bcrypt 算法）：

```php
use zap\util\Password;

// 哈希密码
$hashed = Password::hash('my_secure_password');
// $2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

// 验证密码
if (Password::verify('my_secure_password', $hashed)) {
    echo '密码正确';
}

// 检查是否需要重新哈希（如算法参数变更）
if (Password::needsRehash($hashed)) {
    $newHashed = Password::hash('my_secure_password');
    // 更新数据库中的哈希值
}
```

实际使用示例：

```php
// 用户注册
public function register()
{
    $data = req()->json();

    $userId = DB::table('users')->insert([
        'name'     => $data['name'],
        'email'    => $data['email'],
        'password' => Password::hash($data['password']),
        'created_at' => date('Y-m-d H:i:s'),
    ]);

    return response()->json(['id' => $userId], 201);
}

// 用户登录
public function login()
{
    $email = req()->input('email');
    $password = req()->input('password');

    $user = DB::table('users')->where('email', $email)->first();

    if (!$user || !Password::verify($password, $user['password'])) {
        return response()->json(['error' => '邮箱或密码错误'], 401);
    }

    // 检查是否需要更新哈希
    if (Password::needsRehash($user['password'])) {
        DB::table('users')->where('id', $user['id'])->update([
            'password' => Password::hash($password),
        ]);
    }

    Session::regenerate(true);
    Session::set('user_id', $user['id']);

    return response()->json(['message' => '登录成功']);
}
```

## FileUtils - 文件工具

```php
use zap\util\FileUtils;

// 递归创建目录
FileUtils::mkdir('/path/to/deep/nested/directory');

// 递归删除目录
FileUtils::rmdir('/path/to/temp/directory');

// 复制目录
FileUtils::copyDir('/source/path', '/destination/path');

// 获取文件扩展名
$ext = FileUtils::extension('photo.jpg');   // 'jpg'
$ext = FileUtils::extension('archive.tar.gz'); // 'gz'

// 获取 MIME 类型
$mime = FileUtils::mimeType('document.pdf'); // 'application/pdf'

// 人性化文件大小
$size = FileUtils::humanSize(1024);          // '1 KB'
$size = FileUtils::humanSize(1048576);       // '1 MB'
$size = FileUtils::humanSize(1536000);       // '1.46 MB'

// 删除文件
FileUtils::delete('/path/to/file.txt');

// 检查目录是否为空
$empty = FileUtils::isEmptyDir('/path/to/dir');
```

## 辅助函数速查表

| 函数 | 说明 | 示例 |
|------|------|------|
| `app()` | 获取 App 实例 | `app()->make(Service::class)` |
| `config($key, $default)` | 读取配置 | `config('app.debug', false)` |
| `config_set($key, $value)` | 设置配置 | `config_set('app.debug', false)` |
| `base_path($path)` | 项目根目录路径 | `base_path('config/app.php')` |
| `config_path($path)` | 配置目录路径 | `config_path('database.php')` |
| `var_path($path)` | 变量目录路径 | `var_path('cache')` |
| `assets_path($path)` | 静态资源路径 | `assets_path('css/app.css')` |
| `storage_path($path)` | 存储目录路径 | `storage_path('uploads')` |
| `public_path($path)` | 公共目录路径 | `public_path('index.php')` |
| `resource_path($path)` | 资源目录路径 | `resource_path('scss/app.scss')` |
| `themes_path($path)` | 主题目录路径 | `themes_path('default')` |
| `url($path, $params)` | 生成 URL | `url('/assets/css/app.css')` |
| `asset($path)` | 静态资源 URL | `asset('js/app.js')` |
| `response($content, $code)` | 创建响应 | `response('Hello')` |
| `req()` | 获取请求对象 | `req()->input('name')` |
| `view($name, $data)` | 渲染视图 | `view('home.index', $data)` |

## 工具类速查表

| 类 | 命名空间 | 主要方法 |
|----|----------|----------|
| Arr | `zap\util\Arr` | get, set, has, only, except, dot, undot |
| Str | `zap\util\Str` | startsWith, endsWith, contains, limit, random, snake, camel, studly, slug |
| Date | `zap\facades\Date` | now, today, format, timestamp, addDays, subDays, diff, isPast, isFuture |
| UUID | `zap\util\UUID` | v4, ordered |
| Random | `zap\util\Random` | string, numeric, int |
| Password | `zap\util\Password` | hash, verify, needsRehash |
| FileUtils | `zap\util\FileUtils` | mkdir, rmdir, copyDir, extension, mimeType, humanSize, delete |
