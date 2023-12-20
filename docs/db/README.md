# 数据库入门

ZAP 框架提供基础的PDO 数据库访问，和简单的ActiveRecord 访问


# 数据库类型

- MariaDB 10.10+
- MySQL 5.7+ 
- PostgreSQL 11.0+ 
- SQLite 3.8.8+


# 配置


数据库配置文件 `config/database.php` 


## SQLITE 配置


```php
<?php


return [

    'default' => 'sqlite',
    'connections' => [
       'sqlite'=>[
           'driver' => 'sqlite',
           'prefix' => 'zap_',
           'dsn'=> sprintf('sqlite:%s', var_path('data/zapcms.db'))
       ]
    ],

];

```



## MySQL / MariaDB 配置

```php
<?php


return [

    'default' => 'default',


    'connections' => [

        'default' => [
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'port' => 3306,
            'dbname' => 'zap_cms',
            'user' => 'root',
            'password' => 'root',
            'charset' => 'utf8',
            'collate' => 'utf8_unicode_ci',
            'prefix' => 'zap_',
            'options' => [],
        ]
    ],



];

```