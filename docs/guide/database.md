# 数据库

## 概述

Zap PHP Framework 提供了简洁的数据库操作层，包括 DB 门面（Facade）、ZPDO（PDO 包装器）、查询构建器和事务支持。框架支持多数据库连接、查询日志等功能。

## DB 门面

DB 门面提供了静态方式访问数据库操作的便捷接口：

```php
use zap\DB;

// 获取数据库连接
$connection = DB::connection();

// 切换连接
$readConnection = DB::connection('slave');

// 获取表查询构建器
$query = DB::table('users');

// CRUD 便捷方法（表名+数据，自动参数化绑定）
$id = DB::insert('users', ['name' => '张三', 'email' => 'zhang@example.com']);
DB::update('users', ['status' => 'inactive'], ['id' => 5]);
DB::delete('users', ['id' => 5]);

// 批量插入 / Upsert / Replace
DB::batchInsert('users', [['name' => 'A'], ['name' => 'B']]);
DB::upsert('users', ['id' => 1, 'name' => '更新']);
DB::replace('users', ['id' => 1, 'name' => '替换']);

// 计数和键值对
$total = DB::count('users', 'status = ?', [1]);
$map = DB::keyPair('users', 'id, name'); // → [1=>'张三', 2=>'李四']

// 原始 SQL 执行
$results = DB::select('SELECT * FROM users WHERE status = ?', ['active']);
DB::exec('UPDATE users SET status=? WHERE id=?', ['inactive', 5]);
$id = DB::execInsert('INSERT INTO logs (msg) VALUES (?)', ['start']);
```

## 查询构建器

### 基本查询

```php
// 查询所有记录
$users = DB::table('users')->getAll();

// 查询单条记录
$user = DB::table('users')->find(1);

// 查询第一条记录
$user = DB::table('users')->where('email', 'admin@example.com')->first();

// 查询指定列
$names = DB::table('users')->select('id', 'name', 'email')->getAll();
```

### WHERE 条件

```php
// 等于
DB::table('users')->where('status', 'active')->getAll();

// 比较运算符
DB::table('products')->where('price', '>', 100)->getAll();
DB::table('products')->where('price', '>=', 50)->getAll();
DB::table('products')->where('stock', '<', 10)->getAll();
DB::table('products')->where('name', '!=', 'test')->getAll();
DB::table('products')->where('name', 'LIKE', '%手机%')->getAll();

// WHERE IN
DB::table('users')->whereIn('id', [1, 2, 3, 5])->getAll();

// WHERE NOT IN
DB::table('users')->whereNotIn('status', ['banned', 'deleted'])->getAll();

// WHERE NULL / WHERE NOT NULL
DB::table('users')->whereNull('deleted_at')->getAll();
DB::table('users')->whereNotNull('email_verified_at')->getAll();

// 多个 WHERE（AND）
DB::table('users')
    ->where('status', 'active')
    ->where('role', 'admin')
    ->getAll();

// OR WHERE
DB::table('users')
    ->where('status', 'active')
    ->orWhere('role', 'admin')
    ->getAll();
```

### 排序、分页与限制

```php
// 排序
DB::table('posts')
    ->orderBy('created_at', 'DESC')
    ->orderBy('id', 'ASC')
    ->getAll();

// 限制数量
DB::table('posts')->limit(10)->getAll();

// 偏移（分页）
$page = 2;
$perPage = 20;
DB::table('posts')
    ->orderBy('id', 'DESC')
    ->limit($perPage)
    ->offset(($page - 1) * $perPage)
    ->getAll();

// 分组
DB::table('orders')
    ->select('status', 'COUNT(*) as count')
    ->groupBy('status')
    ->getAll();

// HAVING
DB::table('orders')
    ->select('user_id', 'SUM(amount) as total')
    ->groupBy('user_id')
    ->having('total', '>', 1000)
    ->getAll();
```

### 聚合查询

```php
// 计数
$count = DB::table('users')->where('status', 'active')->count();

// 求和
$total = DB::table('orders')->sum('amount');

// 平均值
$avg = DB::table('products')->avg('price');

// 最大值
$max = DB::table('products')->max('price');

// 最小值
$min = DB::table('products')->min('price');
```

### 插入数据

```php
// 插入单条
$id = DB::table('users')->insert([
    'name'       => '张三',
    'email'      => 'zhangsan@example.com',
    'created_at' => date('Y-m-d H:i:s'),
]);

// 批量插入
$affected = DB::table('users')->insertMany([
    ['name' => '李四', 'email' => 'lisi@example.com'],
    ['name' => '王五', 'email' => 'wangwu@example.com'],
]);

// 获取最后插入的 ID
$lastId = DB::table('users')->lastInsertId();
```

### 更新数据

```php
// 更新
$affected = DB::table('users')
    ->where('id', 1)
    ->update([
        'name'       => '张三（已更新）',
        'updated_at' => date('Y-m-d H:i:s'),
    ]);

// 批量更新
DB::table('users')
    ->where('status', 'inactive')
    ->update(['status' => 'active']);

// 自增
DB::table('posts')->where('id', 5)->increment('views');
DB::table('posts')->where('id', 5)->increment('views', 5); // 每次加 5

// 自减
DB::table('products')->where('id', 3)->decrement('stock');
DB::table('products')->where('id', 3)->decrement('stock', 2); // 每次减 2
```

### 删除数据

```php
// 按条件删除
DB::table('users')->where('id', 10)->delete();

// 按多个条件删除
DB::table('logs')
    ->where('created_at', '<', '2024-01-01')
    ->delete();

// 批量删除
DB::table('users')->whereIn('id', [4, 5, 6])->delete();
```

## ZPDO - PDO 包装器

ZPDO 是 PDO 的轻量级包装，提供更友好的错误处理和便利方法：

```php
use zap\db\ZPDO;

$config = config('database.master');

$pdo = new ZPDO(
    "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']};charset={$config['charset']}",
    $config['username'],
    $config['password'],
    $config['options'] ?? []
);

// 执行查询
$rows = $pdo->getRows("SELECT * FROM users WHERE status = ?", ['active']);

// 获取单行
$row = $pdo->getRow("SELECT * FROM users WHERE id = ?", [1]);

// 获取单个值
$count = $pdo->getOne("SELECT COUNT(*) FROM users");

// 执行写操作
$affected = $pdo->execute("UPDATE users SET status = ? WHERE id = ?", ['active', 5]);

// 获取最后插入 ID
$id = $pdo->lastInsertId();

// 事务
$pdo->beginTransaction();
try {
    $pdo->execute("INSERT INTO users (name) VALUES (?)", ['Test']);
    $pdo->execute("INSERT INTO profiles (user_id) VALUES (?)", [$pdo->lastInsertId()]);
    $pdo->commit();
} catch (\Exception $e) {
    $pdo->rollBack();
    throw $e;
}
```

## Model 基类

框架提供了基础的 Model 类用于数据模型：

```php
<?php

namespace App\Models;

use zap\db\Model;

class User extends Model
{
    protected string $table = 'users';

    protected string $primaryKey = 'id';

    protected array $fillable = ['name', 'email', 'password', 'status'];
}
```

使用模型：

```php
$user = new User();

// 查找
$data = $user->find(1);

// 创建
$id = $user->create([
    'name'  => '新用户',
    'email' => 'new@example.com',
]);

// 更新
$user->update(1, ['name' => '已更新']);
```

## 事务支持

### 手动事务

```php
DB::beginTransaction();

try {
    $userId = DB::insert('users', [
        'name'  => '张三',
        'email' => 'zhang@example.com',
    ]);

    DB::insert('profiles', [
        'user_id' => $userId,
        'bio'     => '个人简介',
    ]);

    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

### 自动事务回调

使用 `DB::transaction()` 方法，回调中的操作会自动在事务中执行。回调正常结束时自动提交，抛出异常时自动回滚：

```php
DB::transaction(function() {
    $orderId = DB::insert('orders', [
        'user_id'    => 1,
        'total'      => 99.99,
        'created_at' => date('Y-m-d H:i:s'),
    ]);

    DB::insert('order_items', [
        'order_id'   => $orderId,
        'product_id' => 5,
        'quantity'   => 2,
        'price'      => 49.99,
    ]);

    // 更新库存
    DB::update('products', ['stock' => new \zap\db\Expression('stock - 2')], ['id' => 5]);
});

// 带返回值的事务
$orderId = DB::transaction(function() {
    return DB::insert('orders', [
        'user_id'    => 1,
        'total'      => 150.00,
        'created_at' => date('Y-m-d H:i:s'),
    ]);
});
```

### 嵌套事务

ZPDO 支持保存点（savepoint）实现嵌套事务：

```php
DB::beginTransaction();

try {
    // 外层操作
    DB::insert('users', ['name' => 'Parent User']);

    // 内层事务（使用保存点）
    DB::beginTransaction();
    try {
        DB::insert('profiles', ['user_id' => 1, 'bio' => 'Inner']);
        DB::commit(); // 释放保存点
    } catch (\Exception $e) {
        DB::rollBack(); // 回滚到保存点
    }

    DB::commit(); // 提交外层事务
} catch (\Exception $e) {
    DB::rollBack();
}
```

## 查询日志

调试 SQL 查询时，可以启用查询日志：

```php
// 启用查询日志
DB::enableQueryLog();

// 执行一些查询
DB::table('users')->where('status', 'active')->getAll();
DB::table('posts')->orderBy('id', 'DESC')->limit(10)->getAll();
DB::table('users')->find(5);

// 获取查询日志
$logs = DB::getQueryLog();

foreach ($logs as $log) {
    echo "SQL: {$log['query']}\n";
    echo "Params: " . json_encode($log['bindings']) . "\n";
    echo "Time: {$log['time']}ms\n\n";
}

// 输出示例:
// SQL: SELECT * FROM users WHERE status = ?
// Params: ["active"]
// Time: 2.35ms
//
// SQL: SELECT * FROM posts ORDER BY id DESC LIMIT 10
// Params: []
// Time: 1.80ms
```

## 多数据库连接

### 配置多连接

在 `config/database.php` 中定义多个连接：

```php
<?php
return [
    'default' => 'master',

    'connections' => [
        'master' => [
            'driver'   => 'mysql',
            'host'     => '192.168.1.10',
            'port'     => 3306,
            'dbname'   => 'myapp',
            'username' => 'root',
            'password' => 'secret',
            'charset'  => 'utf8mb4',
            'options'  => [],
        ],

        'slave' => [
            'driver'   => 'mysql',
            'host'     => '192.168.1.11',
            'port'     => 3306,
            'dbname'   => 'myapp',
            'username' => 'readonly',
            'password' => 'readonly',
            'charset'  => 'utf8mb4',
            'options'  => [],
        ],

        'analytics' => [
            'driver'   => 'mysql',
            'host'     => '192.168.1.20',
            'port'     => 3306,
            'dbname'   => 'analytics',
            'username' => 'analytics_user',
            'password' => 'analytics_pass',
            'charset'  => 'utf8mb4',
            'options'  => [],
        ],
    ],
];
```

### 切换连接

```php
// 使用默认连接（master）
$users = DB::table('users')->getAll();

// 切换到从库读取
$users = DB::connection('slave')->table('users')->getAll();

// 使用分析库
$stats = DB::connection('analytics')
    ->table('page_views')
    ->where('date', date('Y-m-d'))
    ->getAll();

// 获取特定连接的 ZPDO 实例
$slavePdo = DB::connection('slave')->getPdo();
```

### 读写分离最佳实践

```php
<?php

namespace App\Controllers;

use zap\http\Controller;
use DB;

class UserController extends Controller
{
    public function index()
    {
        // 查询使用从库
        $users = DB::connection('slave')->table('users')
            ->orderBy('id', 'DESC')
            ->limit(20)
            ->getAll();

        return $this->json($users);
    }

    public function store()
    {
        // 写入使用主库（默认连接）
        $data = $this->request()->json();

        $id = DB::insert('users', [
            'name'       => $data['name'],
            'email'      => $data['email'],
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        return $this->json(['id' => $id], 201);
    }
}
```

## 完整 CRUD 示例

```php
<?php

namespace App\Controllers;

use zap\http\Controller;
use DB;

class ProductController extends Controller
{
    /**
     * 商品列表
     */
    public function index()
    {
        $categoryId = $this->request()->input('category_id');
        $keyword = $this->request()->input('keyword');
        $page = (int) $this->request()->input('page', 1);
        $perPage = 20;

        $query = DB::table('products')
            ->where('status', 'active');

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($keyword) {
            $query->where('name', 'LIKE', "%{$keyword}%");
        }

        $total = $query->count();

        $products = $query
            ->orderBy('sort', 'ASC')
            ->orderBy('id', 'DESC')
            ->limit($perPage)
            ->offset(($page - 1) * $perPage)
            ->getAll();

        return $this->json([
            'data' => $products,
            'meta' => [
                'total'     => $total,
                'page'      => $page,
                'per_page'  => $perPage,
                'last_page' => ceil($total / $perPage),
            ],
        ]);
    }

    /**
     * 商品详情
     */
    public function show($id)
    {
        $product = DB::table('products')->find($id);

        if (!$product) {
            return $this->json(['error' => '商品未找到'], 404);
        }

        // 关联查询分类信息
        $category = DB::table('categories')->find($product['category_id']);
        $product['category'] = $category;

        return $this->json(['data' => $product]);
    }

    /**
     * 创建商品
     */
    public function store()
    {
        $data = $this->request()->json();

        $id = DB::transaction(function() use ($data) {
            // 插入商品
            $id = DB::insert('products', [
                'name'        => $data['name'],
                'category_id' => $data['category_id'],
                'price'       => $data['price'],
                'stock'       => $data['stock'] ?? 0,
                'status'      => 'active',
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ]);

            // 记录操作日志
            DB::insert('operation_logs', [
                'action'     => 'product.create',
                'target_id'  => $id,
                'created_at' => date('Y-m-d H:i:s'),
            ]);

            return $id;
        });

        return $this->json(['id' => $id, 'message' => '商品创建成功'], 201);
    }

    /**
     * 更新商品
     */
    public function update($id)
    {
        $product = DB::table('products')->find($id);
        if (!$product) {
            return $this->json(['error' => '商品未找到'], 404);
        }

        $data = $this->request()->json();
        $data['updated_at'] = date('Y-m-d H:i:s');

        DB::table('products')->where('id', $id)->update($data);

        return $this->json(['message' => '商品更新成功']);
    }

    /**
     * 删除商品
     */
    public function destroy($id)
    {
        $product = DB::table('products')->find($id);
        if (!$product) {
            return $this->json(['error' => '商品未找到'], 404);
        }

        DB::table('products')->where('id', $id)->delete();

        return $this->json(['message' => '商品已删除']);
    }
}
```

## 最佳实践

1. **使用事务保证数据一致性**：涉及多表操作的业务逻辑应使用事务
2. **读写分离**：查询使用从库连接，写入使用主库连接
3. **参数绑定防止 SQL 注入**：始终使用参数绑定，避免拼接 SQL 字符串
4. **使用查询日志调试**：开发时开启查询日志排查性能问题
5. **合理使用索引**：确保 WHERE、ORDER BY、JOIN 列有合适的索引
