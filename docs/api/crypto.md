# 加密与安全

本页面包含加密、哈希、随机数生成和 Base64 编解码相关的 API 文档，所有类位于 `zap\crypto` 命名空间下。

---

## Base64

**命名空间**: `zap\crypto\Base64`

URL 安全的 Base64 编解码工具，将标准 Base64 中的 `+` `/` `=` 替换为 URL 友好字符，适用于 URL 参数、Cookie、Token 等场景。

### `encode(string $data): string`

```php
public static function encode(string $data): string
```

标准 Base64 编码。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `string` | 原始数据 |

**返回值**: `string`

**示例**:
```php
use zap\crypto\Base64;

echo Base64::encode('Hello World');
// 'SGVsbG8gV29ybGQ='
```

---

### `decode(string $data): string|false`

```php
public static function decode(string $data): string|false
```

标准 Base64 解码（严格模式）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `string` | Base64 字符串 |

**返回值**: `string|false` — 解码失败返回 `false`

---

### `encodeUrlSafe(string $data): string`

```php
public static function encodeUrlSafe(string $data): string
```

URL 安全编码。将 `+` → `-`，`/` → `_`，去除末尾 `=`。

**示例**:
```php
$data = base64_encode(random_bytes(16));
// 'abc+def/GH=='

echo Base64::encodeUrlSafe(random_bytes(16));
// 'abc-def_GH'
```

---

### `decodeUrlSafe(string $base64): string|false`

```php
public static function decodeUrlSafe(string $base64): string|false
```

URL 安全解码。将 `-` → `+`，`_` → `/`，自动补全末尾 `=`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$base64` | `string` | URL 安全的 Base64 字符串 |

**返回值**: `string|false` — 解码后的原始数据，失败返回 `false`

---

### `encodeUrlSafePadded(string $data): string`

```php
public static function encodeUrlSafePadded(string $data): string
```

URL 安全编码但**保留** `=` 填充。仅在需要保持标准 Base64 长度规格时使用。

---

## Hash

**命名空间**: `zap\crypto\Hash`

密码哈希、HMAC 签名验证及快速哈希工具。

### 密码哈希

### `password(string $password, array $options = []): string`

```php
public static function password(string $password, array $options = []): string
```

生成密码哈希。**优先使用 Argon2id**，不可用时回退到 bcrypt。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$password` | `string` | 明文密码 |
| `$options` | `array` | 算法选项，如 `['cost' => 12]` 或 `['memory_cost' => 65536, 'time_cost' => 4]` |

**返回值**: `string` — 哈希后的密码字符串

**示例**:
```php
use zap\crypto\Hash;

// 默认使用 Argon2id（PHP 7.3+）或 bcrypt
$hashed = Hash::password('my_password');

// bcrypt cost 参数
$hashed = Hash::password('my_password', ['cost' => 14]);
```

---

### `passwordVerify(string $password, string $hash): bool`

```php
public static function passwordVerify(string $password, string $hash): bool
```

验证密码与哈希是否匹配。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$password` | `string` | 明文密码 |
| `$hash` | `string` | 已存储的哈希值 |

**返回值**: `bool`

**示例**:
```php
$hashed = Hash::password('secret123');

if (Hash::passwordVerify('secret123', $hashed)) {
    // 密码正确
}
```

---

### `passwordNeedsRehash(string $hash, array $options = []): bool`

```php
public static function passwordNeedsRehash(string $hash, array $options = []): bool
```

检查哈希是否需要重新生成（算法升级或 cost 调整时）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$hash` | `string` | 现有的密码哈希 |
| `$options` | `array` | 新的哈希选项 |

**返回值**: `bool`

**示例**:
```php
if (Hash::passwordNeedsRehash($user->password, ['cost' => 14])) {
    $user->password = Hash::password($inputPassword);
    $user->save();
}
```

---

### `passwordInfo(string $hash): ?array`

```php
public static function passwordInfo(string $hash): ?array
```

获取哈希的算法信息。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$hash` | `string` | 密码哈希值 |

**返回值**: `array{algoName: string, options: array}|null`

**示例**:
```php
$info = Hash::passwordInfo($user->password);
// ['algoName' => 'argon2id', 'options' => ['memory_cost' => 65536, ...]]
```

---

### HMAC

### `hmac(string $data, string $key, string $algorithm = 'sha256', bool $rawOutput = false): string`

```php
public static function hmac(string $data, string $key, string $algorithm = 'sha256', bool $rawOutput = false): string
```

生成 HMAC 签名。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `string` | 待签名的数据 |
| `$key` | `string` | 密钥 |
| `$algorithm` | `string` | 哈希算法，默认 `sha256` |
| `$rawOutput` | `bool` | 是否返回原始二进制，默认十六进制 |

**返回值**: `string`

**示例**:
```php
// API 请求签名校验
$payload = json_encode(['user_id' => 1, 'action' => 'transfer']);
$signature = Hash::hmac($payload, $apiSecret);
// 发送时将 $signature 作为 X-Signature 请求头
```

---

### `hmacVerify(string $data, string $key, string $signature, string $algorithm = 'sha256', bool $isRaw = false): bool`

```php
public static function hmacVerify(string $data, string $key, string $signature, string $algorithm = 'sha256', bool $isRaw = false): bool
```

使用 constant-time 比较验证 HMAC 签名，防止时序攻击。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `string` | 原始数据 |
| `$key` | `string` | 密钥 |
| `$signature` | `string` | 待验证的签名 |
| `$algorithm` | `string` | 哈希算法 |
| `$isRaw` | `bool` | 签名是否为原始二进制 |

**返回值**: `bool`

---

### 快速哈希

### `sha256(string $data, bool $rawOutput = false): string`

SHA-256 哈希。

```php
$hash = Hash::sha256('hello');           // hex 输出
$raw  = Hash::sha256('hello', true);     // 原始二进制
```

---

### `sha1(string $data, bool $rawOutput = false): string`

SHA-1 哈希。

---

### `md5(string $data, bool $rawOutput = false): string`

MD5 哈希。

---

### `make(string $data, string $algorithm = 'sha256', bool $rawOutput = false): string`

```php
public static function make(string $data, string $algorithm = 'sha256', bool $rawOutput = false): string
```

通用哈希方法，支持任意 `hash_algos()` 算法。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `string` | 待哈希数据 |
| `$algorithm` | `string` | 算法名，如 `sha512`、`sha384` |
| `$rawOutput` | `bool` | 是否返回原始二进制 |

**返回值**: `string`

---

### `sha256File(string $filePath): ?string`

```php
public static function sha256File(string $filePath): ?string
```

计算文件的 SHA-256 哈希。文件不存在或不可读时返回 `null`。

---

### `md5File(string $filePath): ?string`

```php
public static function md5File(string $filePath): ?string
```

计算文件的 MD5 哈希。文件不存在或不可读时返回 `null`。

---

### `crc32(string $data): string`

```php
public static function crc32(string $data): string
```

CRC32 校验和（8 位十六进制），适用于缓存键生成、数据去重等场景。

**示例**:
```php
$cacheKey = 'users:' . Hash::crc32('long_string_that_needs_unique_id');
```

---

## Random

**命名空间**: `zap\crypto\Random`

密码学安全的随机数生成器，底层使用 `random_bytes()` / `random_int()`。

### `bytes(int $length = 32): string`

```php
public static function bytes(int $length = 32): string
```

生成安全的随机字节。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 字节数，默认 32 |

**返回值**: `string` — 原始二进制字符串

**示例**:
```php
$salt = Random::bytes(16);  // 128 位盐值
```

---

### `int(int $min, int $max): int`

```php
public static function int(int $min, int $max): int
```

生成指定范围内的安全随机整数（包含边界）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$min` | `int` | 最小值 |
| `$max` | `int` | 最大值 |

**示例**:
```php
$code = Random::int(100000, 999999);  // 6 位数字验证码
$delay = Random::int(1, 5);            // 1~5 秒随机延迟
```

---

### `hex(int $length = 32): string`

```php
public static function hex(int $length = 32): string
```

生成指定长度的十六进制随机字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 字符串长度（字符数） |

**示例**:
```php
$secret = Random::hex(64);  // 128 位密钥的十六进制
```

---

### `string(int $length = 32): string`

```php
public static function string(int $length = 32): string
```

生成字母数字混合的随机字符串（A-Za-z0-9）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 字符串长度 |

**示例**:
```php
$apiKey = 'zap_' . Random::string(40);
```

---

### `token(int $length = 48): string`

```php
public static function token(int $length = 48): string
```

生成 URL 安全的随机 Token。字符集：A-Za-z0-9 加上 `-` `_`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | Token 长度，默认 48 |

**示例**:
```php
// 适合放在 URL 或 Cookie 里
$sessionToken = Random::token(64);
setcookie('auth_token', $sessionToken, ['httponly' => true, 'secure' => true]);
```

---

### `numeric(int $length = 6): string`

```php
public static function numeric(int $length = 6): string
```

生成纯数字随机字符串，适用于短信验证码、数字令牌等场景。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 数字位数，默认 6 |

**示例**:
```php
$otp = Random::numeric(6);     // '482915'
$pin = Random::numeric(4);     // '7392'
```

---

### `readable(int $length = 16): string`

```php
public static function readable(int $length = 16): string
```

生成易读的随机字符串，**排除**易混淆字符（`0/O/1/I/l`）。适合需要手动输入的场景。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 字符串长度 |

**示例**:
```php
// 适合打印或手动输入的激活码
$code = Random::readable(8);  // 'XK9H-M2QD'
```

---

### `fromCharset(int $length, string $charset): string`

```php
public static function fromCharset(int $length, string $charset): string
```

从自定义字符集生成随机字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$length` | `int` | 字符串长度 |
| `$charset` | `string` | 自定义字符集 |

**示例**:
```php
// 自定义密码字符集
$password = Random::fromCharset(16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*');
```

---

### `uuid(): string`

```php
public static function uuid(): string
```

生成 UUID v4 格式字符串。

**返回值**: `string` — 格式：`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

---

## OpenSSL

**命名空间**: `zap\crypto\OpenSSL`

对称加解密组件，支持 AES-128/192/256 的 CBC/GCM/CTR 模式，提供 Base64 输出、HMAC 认证加密、JSON 载荷加密及 PBKDF2 密钥派生。

**特性**:
- 所有实例方法均支持静态调用（`__callStatic` 代理）
- 返回 `self` 的配置方法支持链式调用
- 认证加密使用 encrypt-then-MAC 模式，防止密文篡改

### 密码常量

| 常量 | 值 |
|------|-----|
| `CIPHER_AES_128_CBC` | `aes-128-cbc` |
| `CIPHER_AES_192_CBC` | `aes-192-cbc` |
| `CIPHER_AES_256_CBC` | `aes-256-cbc` |
| `CIPHER_AES_128_GCM` | `aes-128-gcm` |
| `CIPHER_AES_192_GCM` | `aes-192-gcm` |
| `CIPHER_AES_256_GCM` | `aes-256-gcm` |
| `CIPHER_AES_128_CTR` | `aes-128-ctr` |
| `CIPHER_AES_256_CTR` | `aes-256-ctr` |

---

### 构造与配置

### `__construct(?string $key = null, string $cipher = CIPHER_AES_256_CBC, ?string $hmacKey = null)`

创建加密实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `?string` | 对称加密密钥 |
| `$cipher` | `string` | 加密算法，默认 `aes-256-cbc` |
| `$hmacKey` | `?string` | HMAC 密钥（认证加密用） |

---

### `setKey(string $key): self`

设置对称加密密钥。返回 `self` 支持链式调用。

### `setCipher(string $cipher): self`

设置加密算法。返回 `self` 支持链式调用。

### `setHmacKey(string $hmacKey): self`

设置 HMAC 认证密钥。返回 `self` 支持链式调用。

### `getCipher(): string`

获取当前使用的加密算法名称。

### `getIvLength(): int`

获取当前算法的 IV（初始化向量）长度。

**示例**:
```php
$ssl = (new OpenSSL())
    ->setKey($myKey)
    ->setCipher(OpenSSL::CIPHER_AES_256_GCM)
    ->setHmacKey($myHmacKey);
```

---

### 基础加密 / 解密

### `encrypt(string $plain, ?string $key = null, ?string $method = null): string`

```php
public function encrypt(string $plain, ?string $key = null, ?string $method = null): string
```

加密数据。返回 `IV + 密文`（原始二进制格式）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$plain` | `string` | 明文 |
| `$key` | `?string` | 密钥（null 时使用实例默认密钥） |
| `$method` | `?string` | 算法（null 时使用实例默认算法） |

**返回值**: `string` — IV（二进制）拼接密文

---

### `decrypt(string $cipher, ?string $key = null, ?string $method = null): ?string`

```php
public function decrypt(string $cipher, ?string $key = null, ?string $method = null): ?string
```

解密数据。密文长度不足时返回 `null`。

---

### Base64 便捷方法

### `encryptToBase64(string $plain, ?string $key = null, ?string $method = null): string`

加密并返回标准 Base64 字符串。

### `decryptFromBase64(string $base64, ?string $key = null, ?string $method = null): ?string`

从 Base64 字符串解密。

**示例**:
```php
$encrypted = OpenSSL::encryptToBase64('敏感数据', $key);
$plain = OpenSSL::decryptFromBase64($encrypted, $key);
```

---

### HMAC 认证加密（推荐）

### `encryptWithAuth(string $plain, ?string $key = null, ?string $hmacKey = null, ?string $method = null): string`

认证加密（encrypt-then-MAC）。返回结构：`HMAC(32字节) + IV + 密文`。解密前先校验 HMAC 完整性，防止密文被篡改。

---

### `encryptWithAuthToBase64(string $plain, ?string $key = null, ?string $hmacKey = null, ?string $method = null): string`

认证加密后输出 URL 安全的 Base64 字符串。**推荐日常使用此方法**。

---

### `decryptWithAuth(string $packed, ?string $key = null, ?string $hmacKey = null, ?string $method = null): ?string`

认证解密。HMAC 不匹配时返回 `null`。

---

### `decryptWithAuthFromBase64(string $base64, ?string $key = null, ?string $hmacKey = null, ?string $method = null): ?string`

从 URL 安全 Base64 输入进行认证解密。

**示例**:
```php
$key = Random::hex(32);
$hmacKey = Random::hex(32);

// 加密
$encrypted = OpenSSL::encryptWithAuthToBase64('敏感数据', $key, $hmacKey);

// 解密
$plain = OpenSSL::decryptWithAuthFromBase64($encrypted, $key, $hmacKey);

// 篡改过的数据解密返回 null
if ($plain === null) {
    // 数据被篡改或无效
}
```

---

### JSON 加密

### `encryptJson(array $data, ?string $key = null, ?string $method = null): string`

将数组编码为 JSON 后进行认证加密，返回 URL 安全 Base64 字符串。

### `decryptJson(string $base64Data, ?string $key = null, ?string $method = null): ?array`

从认证加密字符串解密为数组。解密失败或 JSON 解析失败返回 `null`。

**示例**:
```php
$data = [
    'user_id' => 123,
    'expires' => time() + 3600,
    'scope'   => ['read', 'write'],
];

$token = OpenSSL::encryptJson($data, $appKey);
// 存储或发送 token...


$payload = OpenSSL::decryptJson($token, $appKey);
if ($payload && $payload['expires'] > time()) {
    // 有效载荷
}
```

---

### 静态工具方法

### `deriveKey(string $password, string $salt, int $length = 32, int $iterations = 100000): string`

```php
public static function deriveKey(string $password, string $salt, int $length = 32, int $iterations = 100000): string
```

从密码使用 PBKDF2 派生加密密钥。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$password` | `string` | 原始密码 |
| `$salt` | `string` | 盐值（建议 `Random::bytes(16)`） |
| `$length` | `int` | 输出密钥长度，默认 32 |
| `$iterations` | `int` | 迭代次数，默认 100000 |

**返回值**: `string` — 原始二进制密钥

**示例**:
```php
$salt = Random::bytes(16);
$key = OpenSSL::deriveKey('user_password', $salt);
// 将 $salt 与密文一同存储以便后续解密
```

---

### `availableMethods(): array`

```php
public static function availableMethods(): array
```

获取当前系统可用的所有 OpenSSL 加密算法列表。

**返回值**: `string[]`

---

## 使用示例

### 密码安全

```php
use zap\crypto\Hash;
use zap\crypto\Random;

// 注册 —— 哈希密码
$user->password = Hash::password($request->input('password'));

// 登录 —— 验证密码
if (Hash::passwordVerify($inputPassword, $user->password)) {
    // 可选：检查是否需要升级算法
    if (Hash::passwordNeedsRehash($user->password)) {
        $user->password = Hash::password($inputPassword);
        $user->save();
    }
    // 登录成功
}
```

### API 签名

```php
use zap\crypto\Hash;

// 服务端生成签名
$payload = json_encode(['order_id' => '12345', 'amount' => 99.00]);
$sign = Hash::hmac($payload, $apiSecret);

// 客户端验证签名
if (!Hash::hmacVerify($payload, $apiSecret, $sign)) {
    die('签名验证失败');
}
```

### 随机值

```php
use zap\crypto\Random;

// API Token
$apiToken = Random::token(64);

// 短信验证码
$otp = Random::numeric(6);

// 加密密钥
$key = Random::hex(32);

// 用户可见激活码
$activateCode = Random::readable(8);
```

### 数据加密

```php
use zap\crypto\OpenSSL;
use zap\crypto\Random;

// 生成密钥
$key = Random::hex(32);

// 可选：从密码派生密钥
$salt = Random::bytes(16);
$key = OpenSSL::deriveKey('master_password', $salt);

// 认证加密（推荐）
$encrypted = OpenSSL::encryptWithAuthToBase64('敏感内容', $key, $key);
$plain = OpenSSL::decryptWithAuthFromBase64($encrypted, $key, $key);
```
