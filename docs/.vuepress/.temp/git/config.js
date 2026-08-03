import { GitContributors } from "D:/phpstudy_pro/WWW/zap-php-framework-docs/node_modules/@vuepress/plugin-git/dist/client/components/GitContributors.js";
import { GitChangelog } from "D:/phpstudy_pro/WWW/zap-php-framework-docs/node_modules/@vuepress/plugin-git/dist/client/components/GitChangelog.js";

export default {
  enhance: ({ app }) => {
    app.component("GitContributors", GitContributors);
    app.component("GitChangelog", GitChangelog);
  },
};
