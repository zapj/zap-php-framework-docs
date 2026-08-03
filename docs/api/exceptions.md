# Exceptions

本页面列出了 Zap PHP 框架中所有异常类及其说明。

---

## NotFoundException

**命名空间**: `zap\exception\NotFoundException`

**父类**: `\RuntimeException`

通用的"未找到"异常。当请求的资源（路由、文件、数据等）不存在时抛出。

**示例**:
```php
throw new \zap\exception\NotFoundException('用户不存在');
throw new \zap\exception\NotFoundException('请求的页面未找到', 404);
```

---

## ViewNotFoundException

**命名空间**: `zap\exception\ViewNotFoundException`

**父类**: `\RuntimeException`

视图文件未找到异常。当渲染引擎找不到指定的视图模板文件时抛出。

### `getViewName(): string`

```php
public function getViewName(): string
```

获取引发异常的视图文件名称。

**返回值**: `string`

**示例**:
```php
try {
    View::render('nonexistent/template');
} catch (\zap\exception\ViewNotFoundException $e) {
    echo 'View not found: ' . $e->getViewName();
}
```

---

## CurlException

**命名空间**: `zap\exception\CurlException`

**父类**: `\RuntimeException`

cURL 请求异常。当 HTTP 客户端（cURL）请求失败时抛出。

**示例**:
```php
try {
    $response = HttpClient::get('https://api.example.com/data');
} catch (\zap\exception\CurlException $e) {
    Log::error('API 请求失败', ['error' => $e->getMessage()]);
}
```

---

## NotSupportedException

**命名空间**: `zap\exception\NotSupportedException`

**父类**: `\RuntimeException`

不支持的操作异常。当调用了框架不支持的功能或方法时抛出。

**示例**:
```php
throw new \zap\exception\NotSupportedException('此驱动不支持该操作');
throw new \zap\exception\NotSupportedException('Memcache 扩展不支持 CAS 操作');
```

---

## 异常层次结构

所有框架异常均继承自 PHP 标准异常类：

```
\Exception
    \RuntimeException
        zap\exception\NotFoundException
        zap\exception\ViewNotFoundException
        zap\exception\CurlException
        zap\exception\NotSupportedException
```

---

## 使用示例

### 在控制器中抛出异常

```php
class UserController extends \zap\http\Controller
{
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            throw new \zap\exception\NotFoundException("用户 ID {$id} 不存在");
        }

        return $this->json($user);
    }
}
```

### 捕获特定异常

```php
use zap\exception\NotFoundException;
use zap\exception\CurlException;

try {
    $data = fetchFromApi($url);
} catch (CurlException $e) {
    Log::error('API 调用失败: ' . $e->getMessage());
    return Response::badRequest('外部服务暂不可用');
} catch (NotFoundException $e) {
    return Response::notFound($e->getMessage());
} catch (\Exception $e) {
    Log::error('未知错误: ' . $e->getMessage());
    return Response::internalServerError('服务器错误');
}
```

### 全局异常处理

`ErrorHandler` 会自动捕获所有未处理的异常，并根据 `debug` 配置显示适当的错误页面：

```php
// 入口文件
\zap\ErrorHandler::register();

// 开发环境（debug=true）：显示详细堆栈
// 生产环境（debug=false）：显示简洁错误页面
```
