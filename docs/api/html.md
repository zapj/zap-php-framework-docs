# Html & Element

`zap\html\Html` 是 HTML 元素工厂类，`zap\html\Element` 是 HTML 元素实例类。两者配合提供流式、安全的 HTML 生成能力。

**源文件**: `src/html/Html.php`, `src/html/Element.php`

## 类概览

```php
namespace zap\html;

// 工厂类
class Html
{
    static create(string $tagName, array $attributes = [], array $children = []): Element;
    static el(string $tagName, string|\Stringable|null $html = null, array $attributes = [], array $children = []): Element;

    // 便捷工厂
    static a(string $href, ...): Element;
    static img(string $src, array $attributes = []): Element;
    static div(string|\Stringable|null $content = null, array $attributes = []): Element;
    static span(string|\Stringable|null $content = null, array $attributes = []): Element;
    static input(string $type = 'text', string $name = '', string $value = '', array $attributes = []): Element;
    static textarea(string $name, string $value = '', array $attributes = []): Element;
    static select(array $options = [], mixed $selected = null, array $attributes = []): Element;
    static option(string $value, string $label = '', bool $selected = false, array $attributes = []): Element;
    static form(string $action = '', string $method = 'POST', array $attributes = []): Element;
    static label(string $for, ...): Element;
    static button(...): Element;
    static script(string $src = '', string $content = '', array $attributes = []): Element;
    static link(string $href, string $rel = 'stylesheet', array $attributes = []): Element;
    static meta(string $name, string $content, array $attributes = []): Element;
    static br(): Element;
    static hr(array $attributes = []): Element;
    static ul(array $items = [], array $attributes = []): Element;
    static ol(array $items = [], array $attributes = []): Element;
    static p(...): Element;
    static h(int $level, ...): Element;
    static table(array $rows = [], array $headers = [], array $attributes = []): Element;
}

// 元素实例类
class Element implements \Stringable
{
    public string $tag;
    public string $html = '';
    public array $attributes = [];
    public array $children = [];

    // 构造
    __construct(string $tag, array $attributes = [], array $children = []);

    // 流式属性方法
    attr(string $name, mixed $value = true): static;
    attrs(array $attrs): static;
    class(string $class): static;
    id(string $id): static;
    style(string $style): static;
    data(string $name, mixed $value): static;

    // 内容方法
    text(string $text): static;
    html(string|\Stringable $html): static;

    // 子节点
    append(self|string ...$children): static;
    prepend(self|string ...$children): static;

    // 渲染
    render(): string;
}
```

---

## Html 工厂方法

### Html::el() — 创建有内容的元素

```php
// 有内容
echo Html::el('div', 'Hello World');    // <div>Hello World</div>

// 只有属性
echo Html::el('div', null, ['id' => 'box']);  // <div id="box"></div>

// 带子节点
echo Html::el('div', null, [], [
    Html::el('span', 'child')
]);  // <div><span>child</span></div>
```

### Html::create() — 创建元素（无内容）

```php
$el = Html::create('form', ['method' => 'POST', 'action' => '/login']);
echo $el;  // <form method="POST" action="/login"></form>
```

---

## Element 流式 API

Element 所有属性方法均返回 `$this`，支持链式调用。

### attr() — 设置单个属性

```php
echo Html::el('input')->attr('type', 'email')->attr('placeholder', '请输入邮箱');
// <input type="email" placeholder="请输入邮箱">
```

`$value` 为 `null` 或 `false` 时该属性不渲染：
```php
echo Html::el('div')->attr('hidden', false);  // <div></div>
```

布尔属性传入 `true` 时渲染为存在性标记：
```php
echo Html::el('input')->attr('type', 'checkbox')->attr('checked', true);
// <input type="checkbox" checked>
```

### attrs() — 批量设置属性

```php
echo Html::el('div')->attrs([
    'id' => 'main',
    'class' => 'container',
    'data-controller' => 'page',
]);
// <div id="main" class="container" data-controller="page"></div>
```

### class() — 追加 CSS class（自动去重）

```php
echo Html::el('div')->class('btn')->class('btn')->class('primary');
// <div class="btn primary"></div>
```

### id() — 设置 id

```php
echo Html::el('div')->id('app');  // <div id="app"></div>
```

### style() — 追加内联样式

```php
echo Html::el('div')->style('color:red;')->style('font-size:14px;');
// <div style="color:red;font-size:14px;"></div>
```

### data() — 设置 data-* 属性

```php
echo Html::el('div')->data('controller', 'modal')->data('action', 'close');
// <div data-controller="modal" data-action="close"></div>
```

### text() — 设置纯文本内容（自动 HTML 转义）

```php
echo Html::el('div')->text('<script>alert("XSS")</script>');
// <div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>
```

### html() — 设置原始 HTML 内容

```php
echo Html::el('div')->html('<strong>加粗文本</strong>');
// <div><strong>加粗文本</strong></div>
```

### append() — 追加子节点

```php
echo Html::el('ul')->append(
    Html::el('li')->text('项目 1'),
    Html::el('li')->text('项目 2'),
    Html::el('li')->text('项目 3'),
);
// <ul><li>项目 1</li><li>项目 2</li><li>项目 3</li></ul>
```

### prepend() — 前置子节点

```php
echo Html::el('ul')
    ->append(Html::el('li')->text('B'))
    ->prepend(Html::el('li')->text('A'));
// <ul><li>A</li><li>B</li></ul>
```

---

## 便捷工厂方法

### a() — 链接

```php
echo Html::a('/home', '首页')->class('nav-link');
// <a href="/home" class="nav-link">首页</a>
```

### img() — 图片

```php
echo Html::img('/images/logo.png', ['alt' => 'Logo'])->class('logo');
// <img src="/images/logo.png" alt="Logo" class="logo">
```

注意：`<img>` 是 void 元素，不会生成闭合标签。

### input() — 输入框

```php
echo Html::input('email', 'user_email', '')->placeholder('邮箱')->class('form-control');
// <input type="email" name="user_email" value="" placeholder="邮箱" class="form-control">
```

### textarea() — 多行文本框

```php
echo Html::textarea('content', '默认内容', ['rows' => 5]);
// <textarea name="content" rows="5">默认内容</textarea>
```

### select() / option() — 下拉框

```php
echo Html::select(
    [1 => '启用', 0 => '禁用'],
    1,                           // 选中值
    ['class' => 'form-select']
);
// <select class="form-select">
//   <option value="1" selected>启用</option>
//   <option value="0">禁用</option>
// </select>
```

### form() — 表单

```php
echo Html::form('/login', 'POST')
    ->class('login-form')
    ->append(
        Html::input('text', 'username')->class('form-control'),
        Html::input('password', 'password')->class('form-control'),
        Html::button('登录')->class('btn'),
    );
```

### label() — 标签

```php
echo Html::label('email', '邮箱地址')->class('form-label');
// <label for="email" class="form-label">邮箱地址</label>
```

### button() — 按钮

```php
echo Html::button('提交', 'submit', ['class' => 'btn'])->attr('disabled', false);
// <button type="submit" class="btn">提交</button>
```

### script() — 脚本

```php
echo Html::script('/js/app.js');          // <script src="/js/app.js"></script>
echo Html::script('', 'alert(1)');         // <script>alert(1)</script>
```

### link() — CSS 样式表（void 元素）

```php
echo Html::link('/css/style.css', 'stylesheet', ['media' => 'screen']);
// <link href="/css/style.css" rel="stylesheet" media="screen">
```

### meta() — 元标签（void 元素）

```php
echo Html::meta('viewport', 'width=device-width', []);
// <meta name="viewport" content="width=device-width">
```

### br() / hr() — 换行/分隔（void 元素）

```php
echo Html::br();   // <br>
echo Html::hr(['class' => 'divider']);  // <hr class="divider">
```

### p() — 段落

```php
echo Html::p('这是一段文字')->class('lead');
// <p class="lead">这是一段文字</p>
```

### h() — 标题（自动 clamp 1-6）

```php
echo Html::h(1, '主标题');    // <h1>主标题</h1>
echo Html::h(2, '二级标题');  // <h2>二级标题</h2>
echo Html::h(99, '上限');     // <h6>上限</h6>  ← 自动 clamp
```

### ul() / ol() — 列表

```php
// 字符串数组自动包 <li>
echo Html::ul(['首页', '关于', '联系'])->class('nav');
// <ul class="nav"><li>首页</li><li>关于</li><li>联系</li></ul>

// 传入 Element 实例自定义子项
echo Html::ol([
    Html::el('li')->text('第一步')->class('done'),
    Html::el('li')->text('第二步'),
]);
```

### table() — 表格

```php
echo Html::table(
    [['张三', 28], ['李四', 32]],
    ['姓名', '年龄'],
    ['class' => 'table']
);
// <table class="table">
//   <thead><tr><th>姓名</th><th>年龄</th></tr></thead>
//   <tbody><tr><td>张三</td><td>28</td></tr><tr><td>李四</td><td>32</td></tr></tbody>
// </table>
```

### div() / span()

```php
echo Html::div('内容')->class('container');
// <div class="container">内容</div>

echo Html::span('徽章')->class('badge');
// <span class="badge">徽章</span>
```

---

## void 元素

以下 14 个 HTML void 元素不生成闭合标签：

`area base br col embed hr img input link meta param source track wbr`

```php
echo Html::img('/a.png');      // <img src="/a.png">
echo Html::br();                // <br>
echo Html::input('text', 'q');  // <input type="text" name="q">
```

## 布尔属性

以下属性值为 `true` 时仅渲染属性名：

`autofocus checked disabled multiple readonly required selected async defer novalidate`

```php
echo Html::el('input')->attr('disabled', true);   // <input disabled>
echo Html::el('input')->attr('disabled', false);  // <input>  ← 不渲染
```

## 安全机制

- **属性值自动转义**：`attr('data-x', '" onclick="alert(1)')` → 安全输出
- **`text()` 方法转义**：纯文本内容防止 XSS
- **`html()` 方法不转义**：仅在内容已安全时使用
- **`null`/`false` 值不渲染**：条件属性友好
