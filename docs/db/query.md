# Query

## 方法

```php
public function select($columns = '*'): Query
public function from($tables, string $alias = null): Query
function where(string $name, $operator = '=', $value = null): Query
function orWhere($name, $operator = '=', $value = null): Query
function rawWhere(string $conditions, array $params = array()): Query
public function whereIn(string $column, array $params): Query
public function whereNotIn($column, $params): Query
public function having(string $statement, array $params = null) {
public function join($table, $on, $params = array()): Query
public function leftJoin($table, $on, $params = array()): Query
public function rightJoin($table, $on, $params = array()): Query
public function innerJoin($table, $on, $params = array()): Query
public function crossJoin($table, $on, $params = array()): Query
public function groupBy($statement): Query
public function orderBy($statement): Query
public function getSQL(): string
public function getFullSQL(): string
public function execute() : false|PDOStatement
public function get($fetchMode = null,$fetch_argument = null,...$args) 
public function first($fetchMode = null,$fetchClass = null)
public function statement()
public function fetchColumn($column = 0)
public function fetchAll($mode = null)
public function fetch($mode = null)
public function count($columnName = '*')
public function distinct(): Query
public function addParams($params): Query
public function set($name, $value = null): Query
public function getParams(): array
public function bindValues($params): Query
public function bind($name, $value): Query
public function limit($limit, $offset = null): Query
public function offset($offset): Query
public function reset() 
public function update($table = NULL, $columns = NULL, $conditions = '', $params = array())
public function delete($table = NULL, $conditions = '', $params = array())
```

## 查询
```php
$resultSet = DB::table('table_name')
                ->where('status',1)
                ->orderBy('sort_order ASC')
                ->get(FETCH_ASSOC);
```

## 更新
```php
DB::table('table_name')
    ->where('id',1)
    ->set('name','data')
    ->update();
```

## 删除
```php
DB::table('table_name')
    ->where('id',1)
    ->delete();
```
