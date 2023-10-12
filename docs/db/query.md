# Query

```php
$resultSet = DB::table('table_name')
                ->where('status',1)
                ->orderBy('sort_order ASC')
                ->get(FETCH_ASSOC);
```