export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/README.md"), meta: {"title":"Zap PHP Framework"} }],
  ["/api/app.html", { loader: () => import(/* webpackChunkName: "api_app.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/app.md"), meta: {"title":"App"} }],
  ["/api/arr-str.html", { loader: () => import(/* webpackChunkName: "api_arr-str.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/arr-str.md"), meta: {"title":"Arr & Str"} }],
  ["/api/cache-interface.html", { loader: () => import(/* webpackChunkName: "api_cache-interface.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/cache-interface.md"), meta: {"title":"CacheInterface"} }],
  ["/api/config.html", { loader: () => import(/* webpackChunkName: "api_config.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/config.md"), meta: {"title":"Config"} }],
  ["/api/controller.html", { loader: () => import(/* webpackChunkName: "api_controller.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/controller.md"), meta: {"title":"Controller & RestController"} }],
  ["/api/date-uuid.html", { loader: () => import(/* webpackChunkName: "api_date-uuid.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/date-uuid.md"), meta: {"title":"Date & UUID & ZArray"} }],
  ["/api/db.html", { loader: () => import(/* webpackChunkName: "api_db.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/db.md"), meta: {"title":"DB"} }],
  ["/api/error-handler.html", { loader: () => import(/* webpackChunkName: "api_error-handler.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/error-handler.md"), meta: {"title":"ErrorHandler"} }],
  ["/api/exceptions.html", { loader: () => import(/* webpackChunkName: "api_exceptions.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/exceptions.md"), meta: {"title":"Exceptions"} }],
  ["/api/facades.html", { loader: () => import(/* webpackChunkName: "api_facades.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/facades.md"), meta: {"title":"Facades"} }],
  ["/api/file-cache.html", { loader: () => import(/* webpackChunkName: "api_file-cache.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/file-cache.md"), meta: {"title":"FileCache"} }],
  ["/api/image.html", { loader: () => import(/* webpackChunkName: "api_image.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/image.md"), meta: {"title":"Image"} }],
  ["/api/log.html", { loader: () => import(/* webpackChunkName: "api_log.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/log.md"), meta: {"title":"Log"} }],
  ["/api/memcache-cache.html", { loader: () => import(/* webpackChunkName: "api_memcache-cache.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/memcache-cache.md"), meta: {"title":"MemcacheCache"} }],
  ["/api/middleware.html", { loader: () => import(/* webpackChunkName: "api_middleware.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/middleware.md"), meta: {"title":"Middleware"} }],
  ["/api/password-random.html", { loader: () => import(/* webpackChunkName: "api_password-random.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/password-random.md"), meta: {"title":"Password & Random & FileUtils"} }],
  ["/api/", { loader: () => import(/* webpackChunkName: "api_index.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/README.md"), meta: {"title":"API 参考"} }],
  ["/api/redis-cache.html", { loader: () => import(/* webpackChunkName: "api_redis-cache.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/redis-cache.md"), meta: {"title":"RedisCache"} }],
  ["/api/request.html", { loader: () => import(/* webpackChunkName: "api_request.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/request.md"), meta: {"title":"Request"} }],
  ["/api/response.html", { loader: () => import(/* webpackChunkName: "api_response.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/response.md"), meta: {"title":"Response"} }],
  ["/api/route.html", { loader: () => import(/* webpackChunkName: "api_route.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/route.md"), meta: {"title":"Route"} }],
  ["/api/router.html", { loader: () => import(/* webpackChunkName: "api_router.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/router.md"), meta: {"title":"Router"} }],
  ["/api/session.html", { loader: () => import(/* webpackChunkName: "api_session.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/session.md"), meta: {"title":"Session"} }],
  ["/api/view.html", { loader: () => import(/* webpackChunkName: "api_view.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/view.md"), meta: {"title":"View & Renderers"} }],
  ["/api/zpdo.html", { loader: () => import(/* webpackChunkName: "api_zpdo.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/api/zpdo.md"), meta: {"title":"ZPDO & Query & Model"} }],
  ["/guide/caching.html", { loader: () => import(/* webpackChunkName: "guide_caching.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/caching.md"), meta: {"title":"缓存"} }],
  ["/guide/configuration.html", { loader: () => import(/* webpackChunkName: "guide_configuration.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/configuration.md"), meta: {"title":"配置"} }],
  ["/guide/controllers.html", { loader: () => import(/* webpackChunkName: "guide_controllers.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/controllers.md"), meta: {"title":"控制器"} }],
  ["/guide/database.html", { loader: () => import(/* webpackChunkName: "guide_database.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/database.md"), meta: {"title":"数据库"} }],
  ["/guide/error-handling.html", { loader: () => import(/* webpackChunkName: "guide_error-handling.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/error-handling.md"), meta: {"title":"错误处理"} }],
  ["/guide/facades.html", { loader: () => import(/* webpackChunkName: "guide_facades.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/facades.md"), meta: {"title":"外观模式"} }],
  ["/guide/helpers.html", { loader: () => import(/* webpackChunkName: "guide_helpers.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/helpers.md"), meta: {"title":"辅助函数"} }],
  ["/guide/http.html", { loader: () => import(/* webpackChunkName: "guide_http.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/http.md"), meta: {"title":"HTTP 层"} }],
  ["/guide/images.html", { loader: () => import(/* webpackChunkName: "guide_images.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/images.md"), meta: {"title":"图像处理"} }],
  ["/guide/installation.html", { loader: () => import(/* webpackChunkName: "guide_installation.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/installation.md"), meta: {"title":"安装"} }],
  ["/guide/logging.html", { loader: () => import(/* webpackChunkName: "guide_logging.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/logging.md"), meta: {"title":"日志"} }],
  ["/guide/routing.html", { loader: () => import(/* webpackChunkName: "guide_routing.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/routing.md"), meta: {"title":"路由"} }],
  ["/guide/security.html", { loader: () => import(/* webpackChunkName: "guide_security.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/security.md"), meta: {"title":"安全"} }],
  ["/guide/session.html", { loader: () => import(/* webpackChunkName: "guide_session.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/session.md"), meta: {"title":"会话管理"} }],
  ["/guide/structure.html", { loader: () => import(/* webpackChunkName: "guide_structure.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/structure.md"), meta: {"title":"目录结构"} }],
  ["/guide/validation.html", { loader: () => import(/* webpackChunkName: "guide_validation.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/validation.md"), meta: {"title":"验证"} }],
  ["/guide/views.html", { loader: () => import(/* webpackChunkName: "guide_views.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/guide/views.md"), meta: {"title":"视图"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"D:/phpstudy_pro/WWW/zap-php-framework-docs/docs/.vuepress/.temp/pages/404.html.vue"), meta: {"title":""} }],
]);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  __VUE_HMR_RUNTIME__.updateRoutes?.(routes)
  __VUE_HMR_RUNTIME__.updateRedirects?.(redirects)
}

if (import.meta.hot) {
  import.meta.hot.accept((m) => {
    __VUE_HMR_RUNTIME__.updateRoutes?.(m.routes)
    __VUE_HMR_RUNTIME__.updateRedirects?.(m.redirects)
  })
}
