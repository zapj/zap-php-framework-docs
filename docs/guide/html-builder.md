# HTML 构建器

## 概述

Zap PHP Framework 提供流式 HTML 构建器，让你用链式调用快速生成安全、优雅的 HTML 标记，无需手动拼接字符串。

```php
use zap\html\Html;

// 一行生成完整元素
echo Html::el('div')->class('card')->id('app')->text('Hello World');
// <div class="card" id="app">Hello World</div>
```

## 基本用法

### 创建元素

```php
// 空元素
$div = Html::el('div');

// 带内容
echo Html::el('span', 'Hello');         // <span>Hello</span>

// 带属性
echo Html::el('div', null, ['id' => 'box']);  // <div id="box"></div>

// create() 只创建元素结构（不含内容）
echo Html::create('div', ['class' => 'container']);
```

### 链式调用

所有 Element 方法均返回 `$this`，支持无限链式调用：

```php
echo Html::el('div')
    ->id('main')
    ->class('container')
    ->class('wrapper')          // 自动去重
    ->style('padding: 20px;')
    ->attr('data-role', 'page')
    ->text('内容');
// <div id="main" class="container wrapper" style="padding: 20px;" data-role="page">内容</div>
```

### 自动转义

`text()` 方法自动 HTML 转义，防止 XSS 攻击：

```php
echo Html::el('span')->text('<script>alert(1)</script>');
// <span>&lt;script&gt;alert(1)&lt;/script&gt;</span>
```

需要渲染 HTML 标签时请使用 `html()`：

```php
echo Html::el('div')->html('<strong>粗体</strong>');
// <div><strong>粗体</strong></div>
```

---

## 常用场景

### 表单

```php
echo Html::form('/users', 'POST')
    ->class('user-form')
    ->append(
        Html::div('创建用户')->class('form-title'),
        Html::input('text', 'name')->placeholder('姓名')->class('form-control'),
        Html::input('email', 'email')->placeholder('邮箱')->class('form-control'),
        Html::select([1 => '管理员', 2 => '编辑'], 2, ['name' => 'role'])->class('form-select'),
        Html::button('保存')->class('btn btn-primary'),
    );
```

渲染结果：
```html
<form action="/users" method="POST" class="user-form">
  <div class="form-title">创建用户</div>
  <input type="text" name="name" placeholder="姓名" class="form-control">
  <input type="email" name="email" placeholder="邮箱" class="form-control">
  <select name="role" class="form-select">
    <option value="1">管理员</option>
    <option value="2" selected>编辑</option>
  </select>
  <button type="submit" class="btn btn-primary">保存</button>
</form>
```

### 表格

```php
$rows = [
    ['张三', 'zhangsan@example.com', '2024-01-01'],
    ['李四', 'lisi@example.com', '2024-02-01'],
];

echo Html::table($rows, ['姓名', '邮箱', '日期'])->class('table table-striped');
```

渲染结果：
```html
<table class="table table-striped">
  <thead><tr><th>姓名</th><th>邮箱</th><th>日期</th></tr></thead>
  <tbody>
    <tr><td>张三</td><td>zhangsan@example.com</td><td>2024-01-01</td></tr>
    <tr><td>李四</td><td>lisi@example.com</td><td>2024-02-01</td></tr>
  </tbody>
</table>
```

### 导航栏

```php
echo Html::el('nav')->class('navbar')->append(
    Html::a('/')->text('首页')->class('nav-link'),
    Html::a('/about')->text('关于')->class('nav-link'),
    Html::a('/contact')->text('联系')->class('nav-link')->attr('target', '_blank'),
);
```

渲染结果：
```html
<nav class="navbar">
  <a href="/" class="nav-link">首页</a>
  <a href="/about" class="nav-link">关于</a>
  <a href="/contact" class="nav-link" target="_blank">联系</a>
</nav>
```

### 列表

```php
// 字符串数组自动包 <li>
echo Html::ul(['首页', '关于', '联系'])->class('menu');

// 自定义子元素
echo Html::ol([
    Html::el('li')->append(
        Html::span('步骤一')->class('step'),
        Html::p('填写基础信息')->class('desc'),
    ),
    Html::el('li')->append(
        Html::span('步骤二')->class('step'),
        Html::p('提交审核')->class('desc'),
    ),
]);
```

### 卡片组件

```php
echo Html::el('div')->class('card')->append(
    Html::el('div')->class('card-header')->text('标题'),
    Html::el('div')->class('card-body')->append(
        Html::p('这是卡片内容'),
        Html::a('/detail', '查看详情')->class('btn'),
    ),
    Html::el('div')->class('card-footer')->text('底部'),
);
```

---

## void 元素

以下 HTML 元素自动渲染为无闭合标签格式：

| 元素 | 用法 | 输出 |
|------|------|------|
| `<img>` | `Html::img('/a.png')` | `<img src="/a.png">` |
| `<br>` | `Html::br()` | `<br>` |
| `<hr>` | `Html::hr()` | `<hr>` |
| `<input>` | `Html::input('text', 'q')` | `<input type="text" name="q">` |
| `<link>` | `Html::link('/css/a.css')` | `<link href="/css/a.css" rel="stylesheet">` |
| `<meta>` | `Html::meta('viewport', '...')` | `<meta name="viewport" content="...">` |

---

## 条件属性

```php
$isActive = true;
$isAdmin = false;

echo Html::el('div')
    ->class('item')
    ->class($isActive ? 'active' : '')       // class 自动去重忽略空串
    ->attr('data-admin', $isAdmin ? '1' : false);  // false → 不渲染
// <div class="item active"></div>
```

---

## 在视图中使用

```php
// 在控制器中
use zap\html\Html;

class UserController
{
    public function edit($id)
    {
        $user = DB::table('users')->find($id);

        $form = Html::form('/users/' . $id, 'POST')
            ->append(
                Html::input('hidden', '_method', 'PUT'),
                Html::input('text', 'name', $user['name'])->class('form-control'),
                Html::input('email', 'email', $user['email'])->class('form-control'),
                Html::button('更新')->class('btn'),
            );

        view('users/edit', ['form' => $form, 'user' => $user]);
    }
}
```

```php
// 在视图文件中
echo $form;
```

---

## 与模板引擎配合

Zap HTML 构建器与 PHP 原生模板和 Twig 模板均可无缝配合。

### PHP 模板

```php
<div class="container">
    <h1><?= Html::h(1, $title)->class('page-title') ?></h1>
    <div class="content">
        <?= Html::el('div')->class('card')->text($content) ?>
    </div>
</div>
```

### Twig 模板

```twig
<div class="container">
    {{ html.el('h1', title)|raw }}
</div>
```

---

## 性能建议

- **大量列表项**：用 `Html::ul($items)` 比逐个 `append(Html::el('li', ...))` 更简洁
- **静态 HTML 片段**：纯 HTML 直接写在模板中，构建器用于动态逻辑
- **复杂嵌套**：分步构建中间变量，保持代码可读

```php
// 推荐：分步构建
$header = Html::el('div')->class('header')->text('标题');
$body   = Html::el('div')->class('body')->text('内容');
$card   = Html::el('div')->class('card')->append($header, $body);

// 不推荐：单行超长链
echo Html::el('div')->class('card')->append(Html::el('div')->class('header')->text('标题'), Html::el('div')->class('body')->text('内容'));
```

---

## 参考

- [Html & Element API 参考](/api/html)
- [视图系统](/guide/views)
