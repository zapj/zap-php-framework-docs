# 外观模式

## 概述

外观模式（Facade Pattern）是 Zap PHP Framework 中的核心设计模式之一。外观（Facade）为框架的底层类提供了一个静态接口，让您可以用更简洁、更具表达力的方式访问框架服务，同时保持代码的可测试性和灵活性。

## 什么是 Facade

Facade 充当了一个"静态代理"，将静态方法调用转发到实际的底层实例上。它不会掩盖底层类的复杂性，而是提供了一个简洁的入口。

```php
// 不使用 Facade（需要手动获取实例）
$cache = new zap\cache\RedisCache([...]);
$cache->set('key', 'value');

// 使用 Facade（简洁直观）
use zap\facades\Cache;
Cache::set('key', 'value');
```

Facade 只是一个语法糖，底层仍然是通过真实的对象实例来工作的。这意味着你可以轻松地在测试中 mock 底层实例。

## Facade 工作原理

### 基类实现

所有 Facade 都继承自 `zap\facades\Facade` 抽象基类。基类的核心机制是通过 `__callStatic()` 魔术方法拦截静态调用，并将其转发到实际的实例对象：

```php
abstract class Facade
{
    // 存储已解析的实例
    protected static array $resolvedInstances = [];

    // 子类必须实现此方法，返回要代理的实例
    abstract protected static function getInstance();

    // 拦截所有静态方法调用
    public static function __callStatic($method, $args)
    {
        $instance = static::getInstance();
        return $instance->$method(...$args);
    }
}
```

工作流程：

1. 调用 `Cache::set('key', 'value')`
2. PHP 触发 `__callStatic('set', ['key', 'value'])`
3. 基类调用 `static::getInstance()` 获取实际的 Cache 驱动实例
4. 在实例上调用 `$instance->set('key', 'value')`
5. 返回结果

## 内置 Facade

### Cache 门面

```php
use zap\facades\Cache;

// 自动根据 config/cache.php 创建对应的缓存驱动实例
Cache::set('user:1', $userData, 3600);
$user = Cache::get('user:1');

// 内部实现：
// 1. 读取 config('cache.default') → 'redis'
// 2. 读取 config('cache.redis') 配置
// 3. 创建 RedisCache 实例
// 4. 调用实例的 set() 方法
```

### Date 门面

```php
use zap\facades\Date;

$now = Date::now();
$formatted = Date::format('Y-m-d H:i:s');
$nextWeek = Date::addDays(7);
```

### URL 门面

```php
use zap\facades\Url;

// 生成 URL
$url = Url::to('/user/profile', ['id' => 5]);

// 生成资源 URL
$cssUrl = Url::asset('css/app.css');
```

### Request 门面

```php
use zap\facades\Request;

$name = Request::input('name');
$isPost = Request::isPost();
$fullUrl = Request::fullUrl();
$json = Request::json();
```

## 创建自定义 Facade

### 1. 创建服务类

首先创建你的业务服务类：

```php
<?php

namespace App\Services;

class PaymentService
{
    protected string $gateway;

    public function __construct(string $gateway = 'alipay')
    {
        $this->gateway = $gateway;
    }

    public function charge(float $amount, string $orderId): array
    {
        // 实际支付逻辑
        return [
            'success' => true,
            'transaction_id' => 'TXN' . time(),
            'amount' => $amount,
            'order_id' => $orderId,
        ];
    }

    public function refund(string $transactionId): array
    {
        // 退款逻辑
        return [
            'success' => true,
            'transaction_id' => $transactionId,
        ];
    }

    public function query(string $orderId): array
    {
        // 查询订单状态
        return [
            'order_id' => $orderId,
            'status' => 'paid',
        ];
    }
}
```

### 2. 创建 Facade 类

```php
<?php

namespace App\Facades;

use zap\facades\Facade;

class Payment extends Facade
{
    protected static function getInstance()
    {
        // 返回实际的 PaymentService 实例
        // 可以在这里实现单例缓存
        if (!isset(static::$resolvedInstances['payment'])) {
            static::$resolvedInstances['payment'] = new \App\Services\PaymentService(
                config('payment.gateway', 'alipay')
            );
        }

        return static::$resolvedInstances['payment'];
    }
}
```

### 3. 使用自定义 Facade

```php
use App\Facades\Payment;

// 发起支付
$result = Payment::charge(99.99, 'ORDER-2024-001');

// 查询订单
$status = Payment::query('ORDER-2024-001');

// 退款
$refund = Payment::refund('TXN1705314000');
```

## 访问底层实例

有时你需要访问 Facade 背后的实际对象实例：

```php
use zap\facades\Cache;

// 通过 Facade 获取底层实例
$cacheInstance = Cache::getInstance();

// 直接调用实例方法
$cacheInstance->set('key', 'value');
$value = $cacheInstance->get('key');

// 检查实例类型
if ($cacheInstance instanceof \zap\cache\RedisCache) {
    // Redis 特定操作
}
```

## Facade vs 直接实例化

| 方式 | 优点 | 缺点 |
|------|------|------|
| **Facade** | 代码简洁；易于全局访问；统一的静态接口 | 可能被滥用导致测试困难 |
| **直接实例化** | 明确的依赖关系；便于单元测试 | 代码冗长；需要手动管理实例 |

### 使用 Facade

```php
use zap\facades\Cache;

class UserController
{
    public function show($id)
    {
        $user = Cache::get("user:{$id}");

        if (!$user) {
            $user = DB::table('users')->find($id);
            Cache::set("user:{$id}", $user, 3600);
        }

        return response()->json($user);
    }
}
```

### 使用依赖注入

```php
class UserController
{
    private CacheInterface $cache;

    public function __construct(CacheInterface $cache)
    {
        $this->cache = $cache;
    }

    public function show($id)
    {
        $user = $this->cache->get("user:{$id}");

        if (!$user) {
            $user = DB::table('users')->find($id);
            $this->cache->set("user:{$id}", $user, 3600);
        }

        return response()->json($user);
    }
}
```

两种方式都可以正常工作。Facade 更适合快速开发和简单场景，依赖注入更适合需要高可测试性的复杂业务逻辑。

## 高级用法：条件性 Facade

创建可以根据配置切换实现的 Facade：

```php
<?php

namespace App\Facades;

use zap\facades\Facade;

class Sms extends Facade
{
    protected static function getInstance()
    {
        if (!isset(static::$resolvedInstances['sms'])) {
            $driver = config('sms.driver', 'aliyun');

            static::$resolvedInstances['sms'] = match($driver) {
                'aliyun'  => new \App\Services\AliyunSmsService(config('sms.aliyun')),
                'tencent' => new \App\Services\TencentSmsService(config('sms.tencent')),
                default   => new \App\Services\LogSmsService(),
            };
        }

        return static::$resolvedInstances['sms'];
    }
}

// 使用（无需关心底层驱动）
use App\Facades\Sms;

Sms::send('13800138000', '您的验证码是: 1234');
```

## 所有内置 Facade 列表

| Facade | 命名空间 | 代理的对象 | 说明 |
|--------|----------|-----------|------|
| Cache | `zap\facades\Cache` | CacheInterface 实现 | 缓存操作 |
| Date | `zap\facades\Date` | Date 工具类 | 日期时间操作 |
| URL | `zap\facades\Url` | URL 生成器 | URL 生成 |
| Request | `zap\facades\Request` | ZapRequest | 请求对象 |

## 测试中的 Facade

在单元测试中，可以替换 Facade 背后的实例来实现 mock：

```php
class UserControllerTest
{
    public function testShow()
    {
        // 创建 mock 缓存
        $mockCache = $this->createMock(CacheInterface::class);
        $mockCache->method('get')
            ->willReturn(['id' => 1, 'name' => 'Test User']);

        // 替换 Facade 实例（需要框架支持实例注入）
        Cache::setInstance($mockCache);

        // 执行测试...
    }
}
```

## 最佳实践

1. **Facade 是语法糖，不是替代品**：理解 Facade 背后实际的类和方法，遇到问题时能快速定位
2. **不要过度使用**：对于简单的工具函数，使用辅助函数（如 `config()`, `req()`）更合适
3. **核心业务逻辑使用依赖注入**：对于复杂的业务服务，优先使用依赖注入提高可测试性
4. **自定义 Facade 命名清晰**：使用能准确表达服务含义的名称
5. **保持 Facade 简洁**：Facade 应只做简单的转发，不要包含业务逻辑
6. **在测试中可替换**：设计 Facade 时考虑实例的可替换性，便于单元测试
