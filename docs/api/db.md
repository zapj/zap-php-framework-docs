# DB

`zap\DB` 数据库门面类，提供静态方法操作数据库。

**源文件**: `src/DB.php`

## 类概览

```php
namespace zap;

class DB
```

## 查询方法

| 方法 | 返回 | 说明 |
|------|------|------|
| `DB::table($table, $alias)` | Query | 获取查询构造器 |
| `DB::select($sql, $params)` | array | 执行查询 |
| `DB::insert($sql, $params)` | string\|false | 执行插入，返回 lastInsertId |
| `DB::update($sql, $params)` | int | 执行更新，返回影响行数 |
| `DB::delete($sql, $params)` | int | 执行删除，返回影响行数 |
| `DB::statement($sql, $params)` | PDOStatement\|false | 执行任意语句 |

```php
// 查询
$users = DB::select('SELECT * FROM users WHERE status = ?', ['active']);

// 插入
$id = DB::insert('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@email.com']);

// 更新
$rows = DB::update('UPDATE users SET status = ? WHERE id = ?', ['active', 1]);

// 删除
$rows = DB::delete('DELETE FROM users WHERE id = ?', [42]);

// 查询构造器
$users = DB::table('users')->where('status', 'active')->all();
```

## 连接方法

| 方法 | 说明 |
|------|------|
| `DB::connection($name)` | 获取指定数据库连接的 Query 构建器 |
| `DB::getConnection($name)` | 获取原生 PDO 连接 |
| `DB::connectionInfo()` | 获取所有连接配置信息 |

```php
$users = DB::connection('slave')->table('users')->all();
$pdo   = DB::getConnection('master');
$info  = DB::connectionInfo();
```

## 事务方法

| 方法 | 说明 |
|------|------|
| `DB::beginTransaction()` | 开始事务 |
| `DB::commit()` | 提交事务 |
| `DB::rollBack()` | 回滚事务 |
| `DB::transaction($callback)` | 自动事务 |

```php
DB::transaction(function () {
    DB::insert('INSERT INTO orders (...) VALUES (...)', [...]);
    DB::insert('INSERT INTO order_items (...) VALUES (...)', [...]);
});
```

## 查询日志

| 方法 | 说明 |
|------|------|
| `DB::enableQueryLog()` | 启用查询日志 |
| `DB::disableQueryLog()` | 禁用查询日志 |
| `DB::getQueryLog()` | 获取日志数组 |
| `DB::flushQueryLog()` | 清空日志 |
