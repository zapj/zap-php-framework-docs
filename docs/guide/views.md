# 视图

## 概述

Zap PHP Framework 的视图系统支持 PHP 原生模板和 Twig 模板引擎，提供布局（Layout）、块（Block）、局部模板（Partial）等功能。视图文件默认存放在 `app/views/` 目录下。

## 视图配置

### 模板搜索路径

框架默认在 `app/views/` 目录中搜索模板。你可以添加额外的搜索路径：

```php
use zap\view\View;

// 添加模板路径（插入到头部，优先级更高）
View::addPath('/custom/template/path');

// 添加模板路径（追加到末尾）
View::addPath('/another/path', true);

// 获取所有搜索路径
$paths = View::paths();

// 清空搜索路径
View::clearPaths();
```

### 模板扩展名

支持的扩展名：`.php`、`.html`、`.twig`

```php
// 注册自定义扩展名
View::registerExtension('phtml');
```

### 主题支持

在 `config/config.php` 中设置主题后，框架会优先从主题目录加载模板：

```php
// config/config.php
return [
    'theme' => 'default', // 使用 themes/default/ 目录中的模板
];
```

## 基本渲染

### 直接渲染视图

```php
use zap\view\View;

// 渲染并直接输出
$view = View::make('home.index', ['title' => '首页']);
$view->show();

// 渲染并返回字符串
$html = View::make('user.profile', ['user' => $user])->fetch();

// 静态便捷方法
$html = View::render('home.index', ['title' => '首页'], true);

// 链式调用
$html = View::make('post.show')
    ->with('post', $post)
    ->with('comments', $comments)
    ->withLayout('layouts.main')
    ->fetch();
```

### 在控制器中使用

```php
<?php

namespace App\Controllers;

use zap\http\Controller;
use zap\view\View;

class PageController extends Controller
{
    public function home()
    {
        return View::make('home.index', [
            'title'   => '欢迎',
            'content' => 'Hello World',
        ])->show();
    }

    public function about()
    {
        $view = View::make('page.about');
        $view->with('title', '关于我们');
        $view->show();
    }
}
```

## 全局数据共享

```php
use zap\view\View;

// 向所有视图共享数据
View::share('app_name', 'Zap App');
View::share('current_year', date('Y'));

// 等价方法
View::set('version', '1.0.5');
```

在模板中直接使用共享的变量：

```html
<footer>
    <p>&copy; <?= $current_year ?> <?= $app_name ?></p>
</footer>
```

## PHPRenderer 模板引擎

### 模板语法

PHP 模板使用原生 PHP 语法，简洁高效：

```html
<!-- app/views/home/index.html -->
<h1><?= esc($title) ?></h1>

<p>欢迎您，<?= esc($user['name']) ?></p>

<!-- 条件判断 -->
<?php if ($isAdmin): ?>
    <a href="/admin">管理后台</a>
<?php endif; ?>

<!-- 循环 -->
<ul>
    <?php foreach ($posts as $post): ?>
        <li>
            <a href="/post/<?= $post['slug'] ?>">
                <?= esc($post['title']) ?>
            </a>
        </li>
    <?php endforeach; ?>
</ul>
```

### HTML 转义

使用 `esc()` 或 `_e()` 函数对输出内容进行 HTML 转义，防止 XSS 攻击：

```html
<!-- 安全输出用户内容 -->
<p><?= esc($userInput) ?></p>
<p><?= _e($comment['body']) ?></p>
```

这两个函数内部都使用 `htmlentities($html, ENT_QUOTES, 'UTF-8')` 进行转义。

### 布局（Layout）系统

#### 定义布局文件

```html
<!-- app/views/layouts/main.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title><?= esc($title) ?> - Zap App</title>
    <link rel="stylesheet" href="/assets/css/app.css">
</head>
<body>
    <header>
        <nav>
            <a href="/">首页</a>
            <a href="/about">关于</a>
        </nav>
    </header>

    <main>
        <!-- content 块会被子模板的内容替换 -->
        <?= $this->block('content') ?>
    </main>

    <footer>
        <p>&copy; 2026 Zap App. All rights reserved.</p>
    </footer>

    <script src="/assets/js/app.js"></script>
</body>
</html>
```

#### 使用布局的模板

```html
<!-- app/views/home/index.html -->
<?php $this->extend('layouts.main') ?>

<h1>欢迎来到 Zap 框架</h1>
<p>这是一个使用布局的页面。</p>
```

`extend()` 方法（也等同于 `layout()` 和 `setLayout()`）指定该视图使用的布局模板。子模板的内容会自动填充到布局的 `content` 块中。

### 块（Block）系统

块允许在布局中定义多个可替换的区域：

```html
<!-- 布局文件 app/views/layouts/main.html -->
<!DOCTYPE html>
<html>
<head>
    <title><?= esc($title) ?></title>
    <?= $this->block('styles') ?>
</head>
<body>
    <?= $this->block('header') ?>

    <main>
        <?= $this->block('content') ?>
    </main>

    <?= $this->block('scripts') ?>
</body>
</html>
```

在子模板中定义块：

```html
<!-- app/views/home/index.html -->
<?php $this->extend('layouts.main') ?>

<?php $this->beginBlock('styles') ?>
<style>
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
</style>
<?php $this->endBlock() ?>

<?php $this->beginBlock('header') ?>
<header class="hero">
    <h1>欢迎光临</h1>
</header>
<?php $this->endBlock() ?>

<!-- content 块（默认块，无需 begin/end） -->
<div class="container">
    <p>主要内容区域</p>
</div>

<?php $this->beginBlock('scripts') ?>
<script>
    console.log('页面加载完成');
</script>
<?php $this->endBlock() ?>
```

### 局部模板（Partial）

使用 `partial()` 方法包含子模板：

```html
<!-- 主模板 -->
<div class="sidebar">
    <?= $this->partial('sidebar.widget', ['type' => 'latest_posts']) ?>
</div>

<div class="comments">
    <?= $this->partial('comments.list', ['post_id' => $post['id']]) ?>
</div>
```

```php
// 在 PHP 代码中使用
$sidebar = View::make('main.index')->partial('sidebar.widget', ['type' => 'popular']);
```

### include() - 包含并缓存为块

```html
<?php $this->include('shared.header') ?>

<main>
    页面内容...
</main>

<?php $this->include('shared.footer') ?>
```

## Twig 视图引擎

框架内置对 Twig 模板引擎的支持。使用 `.twig` 扩展名的模板会自动使用 Twig 渲染：

```twig
{# app/views/home/index.twig #}
{% extends 'layouts.main.twig' %}

{% block content %}
    <h1>{{ title }}</h1>

    <ul>
    {% for post in posts %}
        <li>
            <a href="/post/{{ post.slug }}">{{ post.title }}</a>
        </li>
    {% endfor %}
    </ul>
{% endblock %}
```

### Twig 全局数据

通过 `View::share()` 设置的全局数据在 Twig 模板中同样可用：

```twig
<footer>
    &copy; {{ current_year }} {{ app_name }}
</footer>
```

### Twig 布局变量

在 Twig 模板中使用 `_zap_layout` 变量设置布局：

```twig
{# 方式一：在模板中设置 _zap_layout 变量 #}
{% set _zap_layout = 'layouts.main.twig' %}

<h1>页面内容</h1>
```

或者通过 PHP 代码设置：

```php
$view = View::make('page.content.twig')
    ->with('_zap_layout', 'layouts.main.twig')
    ->show();
```

## 视图辅助方法

### View::exists() - 检查模板是否存在

```php
if (View::exists('custom.page')) {
    return View::render('custom.page', $data);
} else {
    return View::render('default.page', $data);
}
```

### View::first() - 使用第一个存在的模板

```php
// 按顺序查找，使用第一个找到的模板
$template = View::first('theme.custom.home', 'theme.default.home', 'home.index');
$html = View::render($template, $data);
```

### View::renderString() - 渲染内联模板字符串

```php
$template = '<h1><?= esc($title) ?></h1><p><?= esc($body) ?></p>';
$html = View::renderString($template, [
    'title' => '动态标题',
    'body'  => '动态内容',
]);
```

### 魔术方法

```php
$view = View::make('page.show', ['title' => '文章']);

// 设置/获取变量
$view->author = '张三';       // __set
echo $view->title;            // __get
isset($view->description);    // __isset
unset($view->tmp);            // __unset

// 直接输出（__toString）
echo View::make('page.show', ['title' => 'Hello']);
```

## 完整示例

### 主布局

```html
<!-- app/views/layouts/app.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= esc($title ?? 'Zap App') ?></title>
    <link rel="stylesheet" href="<?= url('/assets/css/app.css') ?>">
    <?= $this->block('head') ?>
</head>
<body>
    <?php $this->include('shared.header') ?>

    <?php if (has_flash()): ?>
        <div class="flash-messages">
            <?php foreach (get_flash() as $type => $messages): ?>
                <?php foreach ($messages as $msg): ?>
                    <div class="alert alert-<?= $type ?>"><?= esc($msg) ?></div>
                <?php endforeach; ?>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <main class="container">
        <?= $this->block('content') ?>
    </main>

    <?php $this->include('shared.footer') ?>

    <script src="<?= url('/assets/js/app.js') ?>"></script>
    <?= $this->block('scripts') ?>
</body>
</html>
```

### 视图页面

```html
<!-- app/views/post/show.html -->
<?php $this->extend('layouts.app') ?>

<?php $this->beginBlock('head') ?>
<meta name="description" content="<?= esc($post['excerpt']) ?>">
<?php $this->endBlock() ?>

<article class="post">
    <h1><?= esc($post['title']) ?></h1>
    <div class="meta">
        <span>作者: <?= esc($post['author']) ?></span>
        <span>发布于: <?= $post['created_at'] ?></span>
    </div>
    <div class="content">
        <?= $post['content'] ?>
    </div>
</article>

<?= $this->partial('comments.list', ['post_id' => $post['id']]) ?>

<?php $this->beginBlock('scripts') ?>
<script>
    // 页面特定脚本
    document.querySelectorAll('.comment-reply').forEach(function(btn) {
        btn.addEventListener('click', function() {
            // 回复评论逻辑
        });
    });
</script>
<?php $this->endBlock() ?>
```

### 控制器调用

```php
<?php

namespace App\Controllers;

use zap\http\Controller;
use zap\view\View;

class PostController extends Controller
{
    public function show($slug)
    {
        $post = DB::table('posts')->where('slug', $slug)->first();

        if (!$post) {
            return $this->response()
                ->setStatusCode(404)
                ->html()
                ->setContent(View::render('errors.404', ['slug' => $slug], true))
                ->send();
        }

        View::make('post.show', [
            'title' => $post['title'],
            'post'  => $post,
        ])->show();
    }
}
```
