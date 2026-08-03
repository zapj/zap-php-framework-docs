# ZPDO & Query & Model

数据库底层类。

**源文件**: `src/db/`

## ZPDO

`zap\db\ZPDO` PDO 封装类。

```php
use zap\db\ZPDO;

$pdo = new ZPDO([
    'driver'   => 'mysql',
    'host'     => '127.0.0.1',
    'port'     => 3306,
    'dbname'   => 'zap_demo',
    'username' => 'root',
    'password' => '',
    'charset'  => 'utf8mb4',
]);
```

继承自 PDO，提供简化的构造方法和查询接口。

## Query

`zap\db\Query` 查询构造器。

```php
$query = DB::table('users')->alias('u');

// 条件
$query->where('status', 'active');
$query->where('age', '>=', 18);
$query->orWhere('role', 'admin');

// 排序和限制
$query->orderBy('id', 'DESC');
$query->limit(10);
$query->offset(20);

// 执行
$users   = $query->all();         // 全部
$user    = $query->first();       // 第一条
$count   = $query->count();       // 计数
$max     = $query->max('id');     // 最大值

// 分页
$page = $query->page(2, 15);      // 第 2 页，每页 15 条

// 插入/更新
DB::table('users')->insert($data);
DB::table('users')->where('id', 1)->update($data);
DB::table('users')->where('id', 1)->delete();

// 自增/自减
DB::table('users')->where('id', 1)->increment('views');
DB::table('users')->where('id', 1)->decrement('balance', 10);
```

## Model

`zap\db\Model` 数据模型基类。

```php
use zap\db\Model;

class User extends Model
{
    protected string $table = 'users';
    protected string $primaryKey = 'id';
}

// 查询
$user = User::find(1);
$users = User::where('role', 'admin')->all();

// 创建
$user = new User();
$user->name = 'John';
$user->email = 'john@example.com';
$user->save();

// 更新
$user = User::find(1);
$user->name = 'New Name';
$user->save();

// 删除
$user->delete();
```
