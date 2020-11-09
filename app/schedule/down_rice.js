"use strict";

const Subscription = require("egg").Subscription;

const push_url =
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=1c7fa308-f41f-4048-a1d8-d82e5a5f8f71";

class DownRice extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      cron: "0 */15 15 * * *",
      type: "worker",
      immediate: true,
    };
  }
  async subscribe() {
    const { ctx } = this;
    const res = await ctx.curl(push_url, {
      // 必须指定 method
      method: "POST",
      contentType: "json",
      data: {
        "msgtype": "text",
        "text": {
            "content": "点饭警告",
            "mentioned_mobile_list":['@all']
        }
      },
    });
  }
}
module.exports = DownRice;
