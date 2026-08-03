export const siteData = JSON.parse("{\"base\":\"/\",\"lang\":\"zh-CN\",\"title\":\"Zap PHP Framework\",\"description\":\"Zap PHP Framework 文档 — 轻量级、高性能 PHP 开发框架\",\"head\":[[\"meta\",{\"name\":\"theme-color\",\"content\":\"#6366f1\"}],[\"link\",{\"rel\":\"icon\",\"href\":\"/logo.svg\"}]],\"locales\":{\"/\":{\"lang\":\"zh-CN\",\"title\":\"Zap PHP Framework\",\"description\":\"Zap PHP Framework 文档 — 轻量级、高性能 PHP 开发框架\"}}}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  __VUE_HMR_RUNTIME__.updateSiteData?.(siteData)
}

if (import.meta.hot) {
  import.meta.hot.accept((m) => {
    __VUE_HMR_RUNTIME__.updateSiteData?.(m.siteData)
  })
}
