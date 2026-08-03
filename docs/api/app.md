# App

`zap\App` 是框架的核心应用类，负责启动引导、IoC 容器、路径管理和日志获取。

**源文件**: `src/App.php`

## 类概览

```php
namespace zap;

class App implements \ArrayAccess
```

## 常量

| 常量 | 值 | 说明 |
|------|---|------|
| `VERSION` | `'1.0.5'` | 框架版本号 |

## 构造方法

```php
public function __construct(string $basePath)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `$basePath` | string | 项目根目录绝对路径 |

## 静态方法

### `instance(): App`

获取 App 单例实例。

```php
$app = App::instance();
```

## 实例方法

### 路径方法

| 方法 | 返回 | 说明 |
|------|------|------|
| `basePath($path)` | string | 基础路径 |
| `rootPath($path)` | string | 根路径 |
| `configPath($filename)` | string | 配置文件路径 |
| `assetsPath($filename)` | string | 静态资源路径 |
| `storagePath($filename)` | string | 存储路径 |
| `resourcesPath($filename)` | string | 资源路径 |
| `themesPath($filename)` | string | 主题路径 |
| `varPath($filename)` | string | Var 目录路径 |

```php
$app = App::instance();

base_path('config/database.php');   // 等价于 $app->basePath('config/database.php')
config_path('cache.php');            // → /path/to/project/config/cache.php
var_path('cache');                   // → /path/to/project/var/cache
public_path('index.php');            // → /path/to/project/public/index.php
```

### `baseUrl($path = null): string`

获取基础 URL。

```php
$url = $app->baseUrl();       // 'http://localhost'
$url = $app->baseUrl('/users'); // 'http://localhost/users'
```

### `themesUrl($url): string`

获取主题资源 URL。

```php
$themeCss = $app->themesUrl('css/app.css');
```

### `isWin(): bool`

当前是否为 Windows 环境。

```php
if (App::instance()->isWin()) {
    // Windows 特定处理
}
```

### `isConsole(): bool`

当前是否在命令行模式下运行。

```php
if (App::instance()->isConsole()) {
    // CLI 模式
}
```

### `createRouter(): Router`

创建路由器实例。

```php
$router = $app->createRouter();
```

### `run(): bool`

运行应用（启动路由分发）。

```php
$app->run();
```

### `getLogger($name = 'app'): \Monolog\Logger|\zap\log\SimpleLogger`

获取指定通道的日志记录器。

```php
$logger = $app->getLogger();         // 默认 'app' 通道
$errorLogger = $app->getLogger('error');
```

## IoC 容器方法

### `make($class, $args = [], $alias = null): object`

从容器中创建或解析对象。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$class` | string | 完整类名 |
| `$args` | array | 构造参数 |
| `$alias` | string | 别名 |

```php
$app->make(Logger::class, ['app'], 'logger');
```

### `has($name): bool`

检查容器中是否存在绑定。

### `get($name): mixed`

从容器获取实例。

### `set($name, $value): void`

向容器注册绑定。

```php
$app->set('payment', new PaymentService());
$app->set('config', $configInstance);
```

## ArrayAccess

App 实现了 `ArrayAccess` 接口，支持数组方式访问容器：

```php
$app['logger'] = new Logger('app');
$logger = $app['logger'];
```
