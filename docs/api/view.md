# View & Renderers

视图系统类和渲染器接口。

**源文件**: `src/view/`

## View

`zap\view\View` 视图管理类。

```php
$view = new View(['/path/to/views']);
$view->addPath('/another/path');
```

| 方法 | 返回 | 说明 |
|------|------|------|
| `exists($view)` | bool | 视图是否存在 |
| `first($views)` | string | 第一个存在的视图名 |
| `with($key, $value)` | View | 绑定数据 |
| `withLayout($layout)` | View | 设置布局 |
| `fetch($view)` | string | 渲染并返回 HTML |
| `show($view)` | void | 渲染并输出 |
| `partial($view, $data)` | void | 渲染局部模板 |
| `renderString($tpl, $data)` | string | 字符串渲染 |
| `addPath($path)` | View | 添加模板路径 |
| `clearPaths()` | View | 清空路径 |
| `registerExtension($ext)` | View | 注册扩展名 |
| `setRenderer($renderer)` | View | 设置渲染器 |

## ViewRenderer

```php
namespace zap\view;

interface ViewRenderer
{
    public function render(string $view, array $data): string;
}
```

## PHPRenderer

`zap\view\PHPRenderer` 原生 PHP 渲染器，支持布局和块系统。

```php
$renderer = new PHPRenderer($view);
$view->setRenderer($renderer);
```

| 方法 | 说明 |
|------|------|
| `render($view, $data)` | 渲染模板 |
| `e($value)` | HTML 转义 |
| `esc($value)` | HTML 转义（别名） |
| `block($name)` | 获取块内容 |
| `section($name)` | 块别名 |
| `layout($name)` | 设置布局 |

## TwigViewRenderer

`zap\view\TwigViewRenderer` Twig 模板引擎渲染器。

```php
$renderer = new TwigViewRenderer($view, [
    'cache'   => VAR_PATH . '/cache/twig',
    'debug'   => true,
    'charset' => 'utf-8',
]);
$view->setRenderer($renderer);
```

| 方法 | 说明 |
|------|------|
| `render($view, $data)` | 渲染 Twig 模板 |

## ZView

`zap\view\ZView` 简单视图渲染器。

```php
$zview = new ZView();
$zview->render('template.php', ['name' => 'Zap']);
```
