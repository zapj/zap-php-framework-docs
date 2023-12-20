# DB

## 连接数据库
```php
public static function connect(string $default_name = null): ZPDO
```

## 插入数据
插入成功返回 ID
```php
DB::insert('table',['name'='zap']):int
```

## 更新数据
```php
DB::insert('table',['name'='zap']):int
```

## 开启事务

```php
DB::transaction(\Closure $callback, string $connection = null): bool


//Demo
DB::transaction(function(){

});

```


## connection

```php
DB::connection($connection = null , $callback = null): bool


//Demo
DB::connection('connection-name',function(){

});

```

## raw

```php
DB::raw($value): Expr
```


