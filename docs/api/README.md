# API 参考

完整的 Zap PHP Framework API 参考，按命名空间组织。

## 所有类

| 命名空间 | 类 |
|---------|-----|
| `zap` | [App](/api/app) · [Config](/api/config) · [DB](/api/db) · [Log](/api/log) · [ErrorHandler](/api/error-handler) |
| `zap\http` | [Router](/api/router) · [Route](/api/route) · [Controller](/api/controller) · [Request](/api/request) · [Response](/api/response) · [Session](/api/session) · [Middleware](/api/middleware) |
| `zap\cache` | [CacheInterface](/api/cache-interface) · [FileCache](/api/file-cache) · [RedisCache](/api/redis-cache) · [MemcacheCache](/api/memcache-cache) |
| `zap\view` | [View](/api/view) · [PHPRenderer](/api/php-renderer) · [TwigViewRenderer](/api/twig-renderer) |
| `zap\db` | [ZPDO](/api/zpdo) · [Query](/api/query) · [Model](/api/model) |
| `zap\util` | [Arr & Str](/api/arr-str) · [Date & UUID](/api/date-uuid) · [FileUtils](/api/password-random) |
| `zap\crypto` | [Base64](/api/crypto#base64) · [Hash](/api/crypto#hash) · [Random](/api/crypto#random) · [OpenSSL](/api/crypto#openssl) |
| `zap\image` | [Image](/api/image) |
| `zap\fileupload` | [FileUpload](/api/file-upload) · [UploadedFile](/api/file-upload#uploadedfile) · [FileUploadException](/api/file-upload#fileuploadexception) |
| `zap\facades` | [Facades](/api/facades) |
| `zap\exception` | [Exceptions](/api/exceptions) |

## 快速搜索

- 想找路由相关？→ [Router](/api/router) · [Route](/api/route)
- 想找数据库操作？→ [DB](/api/db) · [ZPDO](/api/zpdo) · [Query](/api/query)
- 想找缓存操作？→ [CacheInterface](/api/cache-interface)
- 想找图像处理？→ [Image](/api/image)
- 想找文件上传处理？→ [FileUpload](/api/file-upload)
- 想找加密与安全？→ [Crypto](/api/crypto)
- 想找 HTTP 请求处理？→ [Request](/api/request) · [Response](/api/response)
