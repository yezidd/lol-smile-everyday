'use strict';

const Subscription = require('egg').Subscription;
let pageNo = 1;
let end = true;
class UpdateSmileData extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '10s', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx } = this;
    if (end === false) {
      console.log('----开始执行', pageNo);
      const data = await ctx.service.article.getArticleData(pageNo);
      try {
        // 执行爬虫函数存储到数据库
        await this.app.mysql.insert('article', data.list);
        if (data.next === 1) {
          pageNo = pageNo + 1;
        } else {
          end = true;
          console.log('到底了');
        }
      } catch (err) {
        throw err;
      }
    } else {
      console.log('到底了');
    }
  }
}

module.exports = UpdateSmileData;
