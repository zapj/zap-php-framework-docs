# DB

`zap\DB` 数据库门面类，提供静态方法操作数据库。封装了 CRUD 便捷方法、原始 SQL 执行、Query Builder、事务和连接管理。

**源文件**: `src/DB.php`

## 类概览

```php
use zap\DB;

// CRUD 便捷方法
DB::insert(string $table, array $data): false|string
DB::batchInsert(string $table, array $rows): int
DB::upsert(string $table, array $data, ?array $duplicate = null, $primaryKeys = null): mixed
DB::replace(string $table, array $data): int
DB::update(string $table, array $data, array|string $conditions = '', array $params = []): int
DB::delete(string $table, array|string $conditions = '', array $params = []): int
DB::count(string $table, array|string $conditions = '', array $params = []): int|string
DB::keyPair(string $table, array|string $columns, array|string $conditions = '', array $params = []): array

// 原始 SQL 执行
DB::select(string $query, array $params = []): array
DB::fetch(string $query, array $params = [], string|int|null $fetchModeOrModel = null): array|object|null
DB::fetchAll(string $query, array $params = [], string|int|null $fetchModeOrModel = null): array
DB::statement(string $query, array $params = []): \PDOStatement|false
DB::exec(string $query, array $params = []): int
DB::execInsert(string $query, array $params = []): false|string

// fetch_model 配置
DB::setFetchModel(?string $modelClass): void
DB::getFetchModel(): ?string

// Query Builder
DB::table(string $table, ?string $alias = null): \zap\db\Query

// 事务
DB::beginTransaction(): void
DB::commit(): void
DB::rollBack(): void
DB::transaction(callable $callback, ...$args): mixed

// 连接
DB::connection(?string $name = null): \zap\db\ZPDO
DB::connectionInfo(): array
```

---

## CRUD 便捷方法

直接传入表名 + 数据，自动构建参数化 SQL，防注入。

### insert() — 插入

```php
$id = DB::insert('users', [
    'name'   => '张三',
    'email'  => 'zs@example.com',
    'status' => 1,
]);
// → 成功返回新 ID，失败返回 false
```

### batchInsert() — 批量插入

```php
$rows = DB::batchInsert('users', [
    ['name' => '张三', 'email' => 'zs@a.com'],
    ['name' => '李四', 'email' => 'ls@a.com'],
    ['name' => '王五', 'email' => 'ww@a.com'],
]);
// → 返回受影响行数
```

### upsert() — 插入或更新

```php
// MySQL: INSERT ... ON DUPLICATE KEY UPDATE
DB::upsert('users', [
    'id'    => 1,
    'name'  => '更新后的名字',
    'views' => new \zap\db\Expression('views + 1'),
], ['name']);  // 冲突时更新 name 字段
```

### replace() — REPLACE INTO

```php
DB::replace('users', ['id' => 1, 'name' => '新名字', 'email' => 'new@a.com']);
```

### update() — 更新

```php
// 关联数组条件
$rows = DB::update('users', ['status' => 0], ['id' => 42]);

// SQL 条件字符串
$rows = DB::update('users', 
    ['status' => 0], 
    'created_at < ? AND role = ?', 
    ['2024-01-01', 'guest']
);

// → 返回受影响行数
```

### delete() — 删除

```php
// 关联数组条件
$rows = DB::delete('users', ['id' => 42]);

// SQL 条件字符串
$rows = DB::delete('users', 'status = 0 AND created_at < ?', ['2024-01-01']);

// → 返回受影响行数
```

### count() — 统计

```php
$total = DB::count('users', 'status = ?', [1]);     // 条件统计
$total = DB::count('users');                         // 全部统计
```

### keyPair() — 键值对

```php
$names = DB::keyPair('users', 'id, name');
// → [1 => '张三', 2 => '李四', 3 => '王五']
```

---

## 原始 SQL 执行

### select() — 查询

```php
$users = DB::select('SELECT * FROM users WHERE status = ?', [1]);
$user  = DB::select('SELECT * FROM users WHERE id = ?', [42])[0] ?? null;
```

### exec() — 执行 UPDATE / DELETE / DDL

```php
// 返回受影响行数
DB::exec('UPDATE users SET login_count = login_count + 1 WHERE id = ?', [1]);
DB::exec('DELETE FROM sessions WHERE expired_at < NOW()');
DB::exec("CREATE TABLE IF NOT EXISTS logs (id INT AUTO_INCREMENT, msg TEXT, PRIMARY KEY(id))");
```

### execInsert() — 执行 INSERT 并返回 ID

```php
$id = DB::execInsert('INSERT INTO logs (msg, created_at) VALUES (?, NOW())', ['启动']);
```

### statement() — 原生 PDOStatement

```php
$stm = DB::statement('SELECT * FROM users WHERE id = ?', [1]);
while ($row = $stm->fetch()) {
    // ...
}
```

### fetch() — 单行查询（支持模型水合）

执行 SELECT 返回单行结果。第三个参数可传入 PDO 常量或模型类名。

```php
// 返回关联数组（默认）
$user = DB::fetch('SELECT * FROM users WHERE id = ?', [1]);

// PDO 模式：取单个值
$count = DB::fetch('SELECT COUNT(*) FROM users', [], PDO::FETCH_COLUMN);

// 水合到模型
$user = DB::fetch('SELECT * FROM users WHERE id = ?', [1], User::class);

// 无结果返回 null
$user = DB::fetch('SELECT * FROM users WHERE id = ?', [999]);
// → null
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$query` | `string` | SQL 语句 |
| `$params` | `array` | 绑定参数 |
| `$fetchModeOrModel` | `string\|int\|null` | PDO 常量或模型类名；`null` 使用 `setFetchModel()` 设置的值 |

**返回值**: `array|object|null` — 有结果返回数组/对象/模型实例，无结果返回 `null`

---

### fetchAll() — 多行查询（支持模型水合）

执行 SELECT 返回所有行。第三个参数可传入 PDO 常量或模型类名。

```php
// 返回关联数组列表（默认）
$users = DB::fetchAll('SELECT * FROM users WHERE status = ?', [1]);

// PDO 模式：取单列值列表
$ids = DB::fetchAll('SELECT id FROM users', [], PDO::FETCH_COLUMN);

// 水合到模型列表
$users = DB::fetchAll('SELECT * FROM users', [], User::class);

// 无结果返回空数组
$users = DB::fetchAll('SELECT * FROM users WHERE id = ?', [999]);
// → []
```

**参数**: 同 `fetch()`

**返回值**: `array` — 始终返回数组，无结果时为空数组

---

### setFetchModel() / getFetchModel() — 全局 fetch_model 配置

设置/获取 `fetch()` 和 `fetchAll()` 的默认模型水合类。调用 `fetch()` / `fetchAll()` 时传入第三个参数可覆盖此设置。

```php
// 全局设置
DB::setFetchModel(User::class);

// 之后所有 fetch / fetchAll 自动水合到 User 模型
$user  = DB::fetch('SELECT * FROM users WHERE id = ?', [1]);
$users = DB::fetchAll('SELECT * FROM users WHERE status = ?', [1]);

// 单次覆盖：传入 PDO 常量恢复数组模式
$raw = DB::fetchAll('SELECT * FROM users', [], PDO::FETCH_ASSOC);

// 单次覆盖：传入其他模型类
$post = DB::fetch('SELECT * FROM posts WHERE id = ?', [1], Post::class);

// 获取当前设置
$model = DB::getFetchModel();  // → 'App\Models\User' 或 null

// 清除设置
DB::setFetchModel(null);
```

**优先级**: 参数 > `setFetchModel()` > 默认 `PDO::FETCH_ASSOC`

| 方法 | 参数 | 返回值 |
|------|------|--------|
| `setFetchModel(?string $modelClass)` | 模型类名或 `null` | `void` |
| `getFetchModel()` | — | `?string` |

---

## Query Builder

```php
$users = DB::table('users')
    ->select('id', 'name', 'email')
    ->where('status', 1)
    ->where('created_at', '>=', '2024-01-01')
    ->orderBy('id', 'desc')
    ->limit(10)
    ->get();

// 别名
$u = DB::table('users', 'u')
    ->leftJoin('profiles p', 'u.id = p.user_id')
    ->where('u.status', 1)
    ->get();
```

---

## 事务

```php
// 手动事务
DB::beginTransaction();
try {
    DB::insert('orders', ['total' => 100]);
    DB::insert('order_items', ['order_id' => 1, 'name' => '商品']);
    DB::commit();
} catch (\Throwable $e) {
    DB::rollBack();
    throw $e;
}

// 自动事务
DB::transaction(function () {
    $orderId = DB::insert('orders', ['total' => 100]);
    DB::insert('order_items', ['order_id' => $orderId, 'name' => '商品']);
});

// 带参数
DB::transaction(function ($conn, $userId) {
    DB::insert('orders', ['user_id' => $userId]);
}, 42);
```

---

## 连接管理

```php
// 默认连接
$db = DB::connection();

// 指定连接名
$slave = DB::connection('slave');

// 连接信息
$info = DB::connectionInfo();
```

---

## 查询日志

```php
DB::enableQueryLog();
DB::insert('users', ['name' => 'test']);
DB::update('users', ['name' => 'changed'], ['id' => 1]);

$log = DB::getQueryLog();
// [
//   ['query' => "INSERT INTO users (name) VALUES (?)", 'bindings' => ['test'], 'time' => 0.52],
//   ['query' => "UPDATE users SET name = ? WHERE id = ?", 'bindings' => ['changed', 1], 'time' => 0.31],
// ]

DB::disableQueryLog();
DB::flushQueryLog();
```

---

## 方法对照表

| 旧方法 | 新方法 | 说明 |
|--------|--------|------|
| `DB::insert($sql, $params)` | `DB::execInsert($sql, $params)` | 原始 INSERT → 返回 ID |
| | `DB::insert($table, $data)` | CRUD INSERT |
| `DB::update($sql, $params)` | `DB::exec($sql, $params)` | 原始 UPDATE → 受影响行数 |
| | `DB::update($table, $data, $conditions, $params)` | CRUD UPDATE |
| `DB::delete($sql, $params)` | `DB::exec($sql, $params)` | 原始 DELETE → 受影响行数 |
| | `DB::delete($table, $conditions, $params)` | CRUD DELETE |
