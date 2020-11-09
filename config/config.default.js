/* eslint valid-jsdoc: "off" */

"use strict";

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1558433549612_1337";

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    mysql: {
      // 单数据库信息配置
      client: {
        // host
        host: "47.98.158.20 ",
        // 端口号
        port: "3306",
        // 用户名
        user: "root",
        // 密码
        password: "Yjs868991123456",
        // 数据库名
        database: "lol_smile_every",
      },
      // 是否加载到 app 上，默认开启
      app: true,
      // 是否加载到 agent 上，默认关闭
      agent: false,
    },
  };

  return {
    ...config,
    ...userConfig,
    httpclient: {},
  };
};
