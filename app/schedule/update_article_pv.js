'use strict';

const Subscription = require('egg').Subscription;

// 每天抓取 文章列表，然后更新差量数据
class UpdateArticlePv extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '10s',
      type: 'all', // 指定所有的 worker 都需要执行,
      immediate: true,
      disable: true,
    };
  }
  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    console.log('----');
  }
}
module.exports = UpdateArticlePv;
