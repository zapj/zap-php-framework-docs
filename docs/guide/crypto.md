# 加密与安全

## 概述

`zap\crypto` 命名空间提供了一套完整的密码学工具，涵盖密码哈希、HMAC 签名、安全随机数生成、Base64 编解码及对称加解密。所有类使用简单直观的静态方法调用，无需实例化即可使用。

主要组件：

| 组件 | 说明 |
|------|------|
| `Hash` | 密码哈希（Argon2id/bcrypt）、HMAC 签名验证、快速哈希 |
| `Random` | 基于 `random_bytes()` 的安全随机数生成 |
| `Base64` | URL 安全的 Base64 编解码 |
| `OpenSSL` | AES 对称加解密、认证加密、密钥派生 |

```php
use zap\crypto\Hash;
use zap\crypto\Random;
use zap\crypto\Base64;
use zap\crypto\OpenSSL;
```

---

## 密码安全

### 哈希与存储

始终哈希密码存储，绝不明文存储。`Hash::password()` 自动选择最佳算法：

```php
use zap\crypto\Hash;

// 注册用户
$user = [
    'name'     => '张三',
    'email'    => 'zhangsan@example.com',
    'password' => Hash::password($_POST['password']),
];

DB::table('users')->insert($user);
```

Argon2id 在 PHP 7.3+ 可用时自动使用；在低版本 PHP 中回退到 bcrypt。两者都内置盐值（salt），**无需手动生成盐值**。

### 登录验证

```php
use zap\crypto\Hash;
use zap\http\Session;

$user = DB::table('users')->where('email', $email)->first();

if (!$user || !Hash::passwordVerify($password, $user['password'])) {
    // 密码错误 —— 返回通用提示防枚举
    return response()->json(['error' => '邮箱或密码错误'], 401);
}

// 可选：升级旧密码算法
if (Hash::passwordNeedsRehash($user['password'])) {
    DB::table('users')
        ->where('id', $user['id'])
        ->update(['password' => Hash::password($password)]);
}

// 登录成功
Session::regenerate(true);
Session::set('user_id', $user['id']);
```

### 算法升级与 cost 调整

当部署环境从 bcrypt 升级到 Argon2id，或调整 bcrypt 的 cost 时，无需批量重哈希——在用户下次登录时渐进式更新：

```php
// 调整 bcrypt cost
$options = ['cost' => 14];

if (Hash::passwordNeedsRehash($user['password'], $options)) {
    $newHash = Hash::password($plainPassword, $options);
    DB::table('users')->where('id', $user['id'])->update(['password' => $newHash]);
}
```

---

## HMAC 签名

### API 请求验证

使用 HMAC 对 API 请求进行签名，防止请求被篡改：

```php
use zap\crypto\Hash;

// 服务端 —— 生成签名
$payload = json_encode([
    'user_id' => 123,
    'action'  => 'transfer',
    'amount'  => 100.00,
    'timestamp' => time(),  // 防重放攻击
]);
$signature = Hash::hmac($payload, $apiSecret);

// 将 payload + signature 发给客户端
```

```php
// 客户端 —— 验证签名
$payload = $_POST['payload'];
$signature = $_POST['signature'];

// 防重放：检查时间戳是否在合理范围内
$data = json_decode($payload, true);
if (abs(time() - ($data['timestamp'] ?? 0)) > 300) {
    die('请求已过期');
}

// 验证签名
if (!Hash::hmacVerify($payload, $apiSecret, $signature)) {
    die('签名验证失败');
}

// 签名有效，处理请求...
```

### Webhook 回调验证

```php
// 接收第三方 Webhook
$body = file_get_contents('php://input');
$headerSig = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';

if (!Hash::hmacVerify($body, $webhookSecret, $headerSig)) {
    http_response_code(403);
    exit;
}
```

---

## 随机数生成

### Token 与标识符

```php
use zap\crypto\Random;

// API 密钥
$apiKey = 'sk_' . Random::token(48);

// 会话 Token（URL 友好）
$sessionToken = Random::token(64);

// UUID v4
$uuid = Random::uuid();  // '550e8400-e29b-41d4-a716-446655440000'

// 纯数字验证码
$otp = Random::numeric(6);  // '482915'
```

### 加密密钥

```php
use zap\crypto\Random;

// 对称加密密钥（256-bit）
$key = Random::bytes(32);
// 或十六进制存储
$hexKey = Random::hex(64);

// 盐值
$salt = Random::bytes(16);
```

### 用户可见标识

```php
use zap\crypto\Random;

// 激活码、邀请码（排除易混淆字符）
$code = Random::readable(8);   // 'XK9HM2QD'
$code = Random::readable(16);  // 'P3S9BK-LN46XZ-QM82FJ'

// 自定义字符集
$strongPassword = Random::fromCharset(
    20,
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
);
```

---

## 数据加密

### 快速加密

```php
use zap\crypto\OpenSSL;
use zap\crypto\Random;

// 生成密钥（妥善保管！）
$key = Random::hex(32);

// 加密
$encrypted = OpenSSL::encryptToBase64('要保护的敏感数据', $key);

// 解密
$plain = OpenSSL::decryptFromBase64($encrypted, $key);
```

### 认证加密（推荐）

基本加密不提供完整性校验，攻击者可能篡改密文。使用认证加密防止篡改：

```php
use zap\crypto\OpenSSL;
use zap\crypto\Random;

$key = Random::hex(32);
$hmacKey = Random::hex(32);  // 独立 HMAC 密钥更安全

// 认证加密
$encrypted = OpenSSL::encryptWithAuthToBase64('敏感数据', $key, $hmacKey);

// 认证解密 —— 篡改数据返回 null
$plain = OpenSSL::decryptWithAuthFromBase64($encrypted, $key, $hmacKey);

if ($plain === null) {
    // 数据被篡改或无效
}
```

### JSON 数据加密

适合加密结构化数据（如 Token 载荷、配置信息等）：

```php
use zap\crypto\OpenSSL;

// 加密
$payload = [
    'user_id' => 1001,
    'expires' => time() + 86400,
    'scopes'  => ['profile', 'settings'],
];
$token = OpenSSL::encryptJson($payload, $appKey);

// 解密
$payload = OpenSSL::decryptJson($token, $appKey);
```

### 密钥派生

用户密码不适合直接作为加密密钥。使用 PBKDF2 派生密钥：

```php
use zap\crypto\OpenSSL;
use zap\crypto\Random;

// 派生密钥
$salt = Random::bytes(16);
$key = OpenSSL::deriveKey('user_master_password', $salt);

// 将 $salt 与密文一同存储
$encrypted = OpenSSL::encryptWithAuthToBase64($data, $key);
// 存储: $salt . ':' . $encrypted
```

### 选择算法

根据场景选择合适的密码套件：

| 场景 | 推荐算法 | 常量 |
|------|---------|------|
| 通用场景 | AES-256-CBC | `CIPHER_AES_256_CBC` |
| 需要认证 | AES-256-GCM | `CIPHER_AES_256_GCM` |
| 大数据流 | AES-256-CTR | `CIPHER_AES_256_CTR` |
| 低功耗设备 | AES-128-CBC | `CIPHER_AES_128_CBC` |

```php
// 使用 GCM 模式（内置认证）
$ssl = (new OpenSSL($key, OpenSSL::CIPHER_AES_256_GCM));

// 或静态调用
$encrypted = OpenSSL::encryptToBase64($data, $key, OpenSSL::CIPHER_AES_256_GCM);
```

---

## URL 安全 Base64

标准 Base64 包含 `+` `/` `=` 字符，直接放入 URL、Cookie 或文件名时会产生问题：

```php
use zap\crypto\Base64;

// 标准 Base64 在 URL 中可能出现问题
$raw = base64_encode(binary_data); // 含 +/= 字符

// URL 安全版本
$safe = Base64::encodeUrlSafe(binary_data);
// 可直接放入: /api?token=$safe

// 解码
$binary = Base64::decodeUrlSafe($safe);
```

常见场景：在 URL 参数中传递加密数据、Cookie 值编码、文件名安全编码。

---

## 文件哈希校验

```php
use zap\crypto\Hash;

// 计算文件哈希用于完整性校验
$hash = Hash::sha256File('/path/to/download.zip');
$md5  = Hash::md5File('/path/to/download.zip');

// 文件不存在时返回 null
if ($hash === null) {
    // 文件不可读
}
```

---

## 安全检查清单

- [ ] 密码使用 `Hash::password()` 哈希存储，绝不存明文
- [ ] 密码验证使用 `Hash::passwordVerify()`，不使用 `==` / `===`
- [ ] 登录后检查和渐进式升级旧密码哈希算法
- [ ] API 签名使用 `Hash::hmac()` + `Hash::hmacVerify()`（constant-time 比较）
- [ ] Token 和密钥使用 `Random::token()` 或 `Random::bytes()`（密码学安全随机）
- [ ] 动态验证码使用 `Random::numeric()` 或 `Random::int()`
- [ ] 加密敏感数据使用 `encryptWithAuth*`（含完整性校验）
- [ ] 从用户密码派生密钥使用 `OpenSSL::deriveKey()`
- [ ] URL 中传输二进制数据使用 `Base64::encodeUrlSafe()`
- [ ] **妥善保管加密密钥，不要提交到版本控制系统**
