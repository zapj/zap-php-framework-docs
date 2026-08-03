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

获取 App 单例实例。首次调用时自动从 vendor 位置向上推断项目根路径。

```php
$app = App::instance();
```

### `version(): string`

获取框架版本号。

```php
echo App::version(); // '1.0.5'
```

## 实例方法

### 路径方法

| 方法 | 返回 | 说明 |
|------|------|------|
| `rootPath($path)` | string | Web 文档根路径 |
| `basePath($path)` | string | 项目基础路径 |
| `configPath($filename)` | string | 配置文件路径 |
| `assetsPath($filename)` | string | 静态资源路径 |
| `storagePath($filename)` | string | 存储路径 |
| `resourcesPath($filename)` | string | 资源路径 |
| `themesPath($filename)` | string | 主题路径 |
| `varPath($filename)` | string | Var 目录路径 |
| `publicPath($filename)` | string | Public 入口目录路径 |

```php
$app = App::instance();

$app->basePath('config/database.php');   // /path/to/project/config/database.php
$app->configPath('cache.php');            // /path/to/project/config/cache.php
$app->varPath('cache');                   // /path/to/project/var/cache
$app->publicPath('index.php');            // /path/to/project/public/index.php
```

### `baseUrl(?string $path = null): string`

获取基础 URL。

```php
$url = $app->baseUrl();        // 返回当前 baseUrl
$url = $app->baseUrl('/users'); // 拼接路径
```

### `themesUrl(?string $url = null): string`

获取主题资源 URL。

```php
$themeCss = $app->themesUrl('css/app.css');
```

### `isWin(): bool`

当前是否为 Windows 环境。

### `isConsole(): bool`

当前是否在命令行模式下运行。

### `isProduction(): bool`

判断是否为生产环境（`config.debug` 为 `false` 时返回 `true`）。可用于控制调试输出、详细错误页等。

```php
if (App::instance()->isProduction()) {
    // 生产环境逻辑
}
```

### `createRouter(): Router`

创建路由器实例并注册到容器。

```php
$router = $app->createRouter();
```

### `run(): bool`

运行应用（启动路由分发）。若未创建 Router 则自动创建。

```php
$app->run();
```

### `getLogger(string $name = 'app'): \Monolog\Logger|\zap\log\SimpleLogger`

获取指定通道的日志记录器。若 Monolog 不可用则自动回退到 `SimpleLogger`。

```php
$logger = $app->getLogger();         // 默认 'app' 通道
$errorLogger = $app->getLogger('error');
```

## IoC 容器方法

### `make(string $class, array $args = [], ?string $alias = null): object`

从容器中创建或解析对象。使用 PHP 8 反射 API，支持构造参数自动注入。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$class` | string | 完整类名 |
| `$args` | array | 构造参数（按参数名索引） |
| `$alias` | string\|null | 容器别名 |

```php
$app->make(Logger::class, ['name' => 'app'], 'logger');
```

### `has(string $name): bool`

检查容器中是否存在绑定。

### `get(string $name): mixed`

从容器获取实例。

### `set(string $name, mixed $value): void`

向容器注册绑定。

```php
$app->set('payment', new PaymentService());
$app->set('config', $configInstance);
```

## 魔术方法

App 支持属性式访问容器中的对象：

```php
$app->logger = new Logger('app');  // 调用 __set()
$logger = $app->logger;            // 调用 __get()
if (isset($app->payment)) { }      // 调用 __isset()
```

### `__deprecated __has(string $key): bool`

已废弃，请使用 `__isset()` 或 `has()` 代替。

## ArrayAccess

App 实现了 `ArrayAccess` 接口，支持数组方式访问容器：

```php
$app['logger'] = new Logger('app');
$logger = $app['logger'];
if (isset($app['payment'])) { }
```
