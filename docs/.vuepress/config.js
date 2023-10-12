import { defineUserConfig } from 'vuepress'
import { defaultTheme } from 'vuepress'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'Zap PHP Framework Docs',
  description: '开发文档',
  theme: defaultTheme({
    docsDir: 'docs',
    locales:{
      '/':{
        sidebar:{
            '/' : [
              {
                text: '快速入门',
                children: [
                  '/guide/README.md',
                  '/guide/getting-started.md',
                ],
              },
              {
                text: '数据库',
                children: [
                  '/db/README.md',
                  '/db/DB.md',
                  '/db/query.md',
                  
                ],
              },
            ],
            
        }
      }
    }
  }),
  
})