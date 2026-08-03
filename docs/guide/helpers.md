# 辅助函数

## 概述

Zap PHP Framework 提供了丰富的全局辅助函数和工具类，帮助开发者高效完成常见任务。

## 全局辅助函数

### app() - 获取应用实例

```php
// 获取 App 实例
$app = app();

// 从 IoC 容器获取
$router = app('router');

// 向容器注册
app('payment', new PaymentService());

// 通过 App 实例创建对象
$service = app()->make(SomeService::class);
```

### config() - 读取/写入配置

```php
// 读取配置（第二个参数为默认值）
$debug = config('config.debug', false);
$dbHost = config('database.master.host', '127.0.0.1');

// 写入配置（第二个参数非 null）
config('config.debug', false);
config('cache.default', 'redis');
```

### config_set() / config_has() / config_forget() / config_all()

```php
// 设置配置
config_set('app.debug', false);

// 检查是否存在
if (config_has('database.master.host')) {
    // 配置存在
}

// 删除配置项
config_forget('old.config.key');

// 获取全部已加载配置
$all = config_all();

// 清空缓存
config_clear();
```

### 路径辅助函数

```php
// 项目根目录
$root = base_path();                    // /path/to/project
$configFile = base_path('config/cache.php');

// 配置文件目录
$path = config_path();                  // /path/to/project/config

// 变量/缓存目录
$path = var_path();                     // /path/to/project/var
$cacheDir = var_path('cache');
$logDir = var_path('logs');

// 静态资源目录
$cssFile = assets_path('css/app.css');

// 存储目录
$uploadDir = storage_path('uploads');

// 公共目录（Web 入口）
$indexFile = public_path('index.php');

// 资源目录
$scssFile = resource_path('scss/app.scss');

// 主题目录
$themeViews = themes_path('default/views');
```

### base_url() / current_url() / redirect()

```php
// 基础 URL
$url = base_url('/users');         // http://localhost/users

// 当前请求 URL
$current = current_url();

// 重定向
redirect('/dashboard', 302);
```

### is_production() - 环境判断

```php
if (is_production()) {
    // 生产环境逻辑：关闭详细错误、切换 CDN 等
}
```

### response() - 创建响应

```php
// 快速创建响应
return response('Hello World');
// 带状态码
return response('Not Found', 404);
// JSON 响应
return response()->json(['status' => 'ok']);
```

### req() - 获取请求对象

```php
$request = req();
$name = req()->input('name');
$isPost = req()->isPost();
```

### view() - 渲染视图

```php
return view('home.index', ['title' => '首页']);
```

### 注册/输出静态资源

```php
// 注册 JS 脚本
register_scripts('/assets/js/app.js', ASSETS_BODY);
register_scripts([
    '/assets/js/vendor.js',
    '/assets/js/app.js'
], ASSETS_HEAD);

// 注册 CSS 样式
register_styles('/assets/css/app.css', ASSETS_HEAD);

// 输出
print_scripts(ASSETS_HEAD);   // 输出头部脚本
print_scripts(ASSETS_BODY);   // 输出底部脚本
print_styles();               // 输出所有样式
```
