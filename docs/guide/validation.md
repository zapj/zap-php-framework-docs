# 验证

## 概述

Zap PHP Framework 内置了强大的验证模块，位于 `src/validator/` 目录下，包含 37 个验证处理器文件，覆盖了常见的输入验证需求。验证模块采用可扩展的架构，每个验证规则对应一个独立的处理器类。

## 验证模块结构

```
src/validator/
├── Validator.php              # 验证器主类
├── handlers/                  # 验证处理器目录（37个文件）
│   ├── Required.php           # 必填验证
│   ├── Email.php              # 邮箱验证
│   ├── Min.php                # 最小值验证
│   ├── Max.php                # 最大值验证
│   ├── Between.php            # 范围验证
│   ├── Numeric.php            # 数字验证
│   ├── Integer.php            # 整数验证
│   ├── String.php             # 字符串验证
│   ├── Url.php                # URL 验证
│   ├── Date.php               # 日期验证
│   ├── Regex.php              # 正则验证
│   ├── In.php                 # 包含验证
│   ├── NotIn.php              # 排除验证
│   ├── Same.php               # 相同验证
│   ├── Different.php          # 不同验证
│   ├── Alpha.php              # 字母验证
│   ├── AlphaNum.php           # 字母数字验证
│   ├── Confirmed.php          # 确认验证
│   ├── Unique.php             # 唯一性验证
│   ├── Exists.php             # 存在性验证
│   └── ...                    # 更多验证规则
```

## 基本使用

```php
use zap\validator\Validator;

// 创建验证器实例
$validator = new Validator();

// 待验证的数据
$data = [
    'name'   => '张三',
    'email'  => 'zhangsan@example.com',
    'age'    => 25,
    'password' => 'secret123',
];

// 定义验证规则
$rules = [
    'name'     => 'required|string|min:2|max:50',
    'email'    => 'required|email',
    'age'      => 'required|integer|min:1|max:120',
    'password' => 'required|string|min:6',
];

// 执行验证
if ($validator->validate($data, $rules)) {
    echo '验证通过';
} else {
    $errors = $validator->errors();
    print_r($errors);
}
```

## 验证规则说明

### 常用验证规则

| 规则 | 说明 | 示例 |
|------|------|------|
| `required` | 字段必填 | `'name' => 'required'` |
| `email` | 验证邮箱格式 | `'email' => 'required\|email'` |
| `string` | 必须是字符串 | `'title' => 'string'` |
| `numeric` | 必须是数字 | `'price' => 'numeric'` |
| `integer` | 必须是整数 | `'age' => 'integer'` |
| `min:N` | 最小值/最小长度 | `'age' => 'min:18'` |
| `max:N` | 最大值/最大长度 | `'name' => 'max:50'` |
| `between:MIN,MAX` | 范围验证 | `'age' => 'between:1,120'` |
| `in:值1,值2,...` | 必须在列表中 | `'status' => 'in:active,inactive'` |
| `not_in:值1,值2,...` | 不能在列表中 | `'role' => 'not_in:banned,deleted'` |
| `url` | 验证 URL | `'website' => 'url'` |
| `date` | 验证日期格式 | `'birthday' => 'date'` |
| `regex:/pattern/` | 正则匹配 | `'phone' => 'regex:/^1[3-9]\d{9}$/'` |
| `alpha` | 纯字母 | `'username' => 'alpha'` |
| `alpha_num` | 字母和数字 | `'code' => 'alpha_num'` |
| `confirmed` | 确认字段匹配 | `'password' => 'required\|confirmed'` |
| `same:field` | 与指定字段相同 | `'confirm' => 'same:password'` |
| `different:field` | 与指定字段不同 | `'new_email' => 'different:old_email'` |
| `unique:table,column` | 数据库唯一 | `'email' => 'unique:users,email'` |
| `exists:table,column` | 数据库存在 | `'category_id' => 'exists:categories,id'` |

### 自定义错误消息

```php
$messages = [
    'name.required' => '姓名不能为空',
    'name.min'      => '姓名至少需要 :min 个字符',
    'email.required'=> '邮箱不能为空',
    'email.email'   => '请提供有效的邮箱地址',
    'age.required'  => '年龄不能为空',
    'age.integer'   => '年龄必须是整数',
    'age.min'       => '年龄不能小于 :min 岁',
    'age.max'       => '年龄不能大于 :max 岁',
];

$validator = new Validator();
$validator->setMessages($messages);

if (!$validator->validate($data, $rules)) {
    $errors = $validator->errors();
}
```

## 控制器中使用验证

```php
<?php

namespace App\Controllers;

use zap\http\Controller;
use zap\validator\Validator;

class UserController extends Controller
{
    public function store()
    {
        $data = $this->request()->json();

        // 定义验证规则
        $rules = [
            'name'     => 'required|string|min:2|max:50',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'age'      => 'integer|min:1|max:120',
            'role'     => 'in:user,admin,moderator',
        ];

        // 自定义错误消息
        $messages = [
            'name.required' => '用户名不能为空',
            'email.unique'  => '该邮箱已被注册',
            'password.confirmed' => '两次输入的密码不一致',
        ];

        // 执行验证
        $validator = new Validator();
        $validator->setMessages($messages);

        if (!$validator->validate($data, $rules)) {
            return $this->json([
                'error'  => '验证失败',
                'errors' => $validator->errors(),
            ], 422);
        }

        // 验证通过，创建用户
        $data['password'] = Password::hash($data['password']);
        $data['created_at'] = date('Y-m-d H:i:s');

        $id = DB::table('users')->insert($data);

        return $this->json(['id' => $id, 'message' => '用户创建成功'], 201);
    }

    public function update($id)
    {
        $user = DB::table('users')->find($id);

        if (!$user) {
            return $this->json(['error' => '用户未找到'], 404);
        }

        $data = $this->request()->json();

        // 更新时的验证规则（排除当前用户）
        $rules = [
            'name'  => 'string|min:2|max:50',
            'email' => 'email|unique:users,email,' . $id,  // 排除当前 ID
            'age'   => 'integer|min:1|max:120',
        ];

        $validator = new Validator();

        if (!$validator->validate($data, $rules)) {
            return $this->json([
                'error'  => '验证失败',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data['updated_at'] = date('Y-m-d H:i:s');
        DB::table('users')->where('id', $id)->update($data);

        return $this->json(['message' => '用户更新成功']);
    }
}
```

## 自定义验证规则

验证模块采用可扩展架构，您可以轻松添加自定义验证规则：

```php
// 在 app/Validator/Handlers/ 中创建自定义处理器
<?php

namespace App\Validator\Handlers;

class Mobile
{
    public function validate($field, $value, $params, $validator)
    {
        // 验证中国大陆手机号
        return preg_match('/^1[3-9]\d{9}$/', $value);
    }

    public function message($field, $params)
    {
        return "{$field} 不是有效的手机号码";
    }
}

// 注册自定义规则
$validator = new Validator();
$validator->addRule('mobile', \App\Validator\Handlers\Mobile::class);

// 使用
$rules = [
    'phone' => 'required|mobile',
];

$data = ['phone' => '13800138000'];

if ($validator->validate($data, $rules)) {
    echo '手机号验证通过';
}
```

## 验证器高级用法

### 条件验证

```php
// 仅在指定条件满足时验证
$rules = [
    'shipping_address' => 'required_if:has_physical_product,true',
    'company_name'     => 'required_if:type,company',
];
```

### 数组验证

```php
$data = [
    'items' => [
        ['name' => '商品A', 'qty' => 2, 'price' => 99.99],
        ['name' => '商品B', 'qty' => 1, 'price' => 199.99],
    ],
];

$rules = [
    'items.*.name'  => 'required|string',
    'items.*.qty'   => 'required|integer|min:1',
    'items.*.price' => 'required|numeric|min:0',
];
```

### 可空字段

```php
$rules = [
    'avatar'   => 'nullable|url',        // 可以为空
    'bio'      => 'nullable|string|max:500',
    'birthday' => 'nullable|date',
];
```

## 完整示例：订单创建验证

```php
public function createOrder()
{
    $data = $this->request()->json();

    $rules = [
        // 用户信息
        'user_id' => 'required|integer|exists:users,id',

        // 收货地址
        'address.name'     => 'required|string|max:50',
        'address.phone'    => 'required|regex:/^1[3-9]\d{9}$/',
        'address.province' => 'required|string',
        'address.city'     => 'required|string',
        'address.district' => 'required|string',
        'address.detail'   => 'required|string|max:200',

        // 订单商品
        'items'              => 'required',
        'items.*.product_id' => 'required|integer|exists:products,id',
        'items.*.quantity'   => 'required|integer|min:1|max:99',
        'items.*.price'      => 'required|numeric|min:0.01',

        // 优惠券
        'coupon_code' => 'nullable|string|exists:coupons,code',

        // 备注
        'remark' => 'nullable|string|max:500',
    ];

    $messages = [
        'address.phone.regex'       => '请填写有效的手机号码',
        'items.*.product_id.exists' => '商品不存在或已下架',
        'items.*.quantity.max'      => '单个商品最多购买 99 件',
        'coupon_code.exists'        => '优惠券不存在或已失效',
    ];

    $validator = new Validator();
    $validator->setMessages($messages);

    if (!$validator->validate($data, $rules)) {
        return $this->json([
            'error'  => '订单验证失败',
            'errors' => $validator->errors(),
        ], 422);
    }

    // 验证通过，创建订单
    $orderId = DB::transaction(function() use ($data) {
        // ... 订单创建逻辑
    });

    return $this->json(['order_id' => $orderId], 201);
}
```

## 最佳实践

1. **前后端双重验证**：前端验证提升用户体验，后端验证保证数据安全
2. **使用自定义错误消息**：为用户提供清晰、友好的错误提示
3. **根据场景选择规则**：创建和更新的验证规则可能不同
4. **使用 unique/exists 验证数据库**：确保数据一致性和完整性
5. **可空字段使用 nullable**：明确区分必填和可选字段
6. **复杂业务逻辑单独验证**：将复杂验证逻辑提取到自定义规则中
