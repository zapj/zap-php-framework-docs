import { CodeTabs } from "D:/phpstudy_pro/WWW/zap-php-framework-docs/node_modules/@vuepress/plugin-markdown-tab/dist/client/components/CodeTabs.js";
import { Tabs } from "D:/phpstudy_pro/WWW/zap-php-framework-docs/node_modules/@vuepress/plugin-markdown-tab/dist/client/components/Tabs.js";

export default {
  enhance: ({ app }) => {
    app.component("CodeTabs", CodeTabs);
    app.component("Tabs", Tabs);
  },
};
