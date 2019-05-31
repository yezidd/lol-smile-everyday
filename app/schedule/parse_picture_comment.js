'use strict';

const Subscription = require('egg').Subscription;

let id = 1184;

class ParsePictureComment extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '3s', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行,
      immediate: true,
      disable: true,
    };
  }
  // subscribe 是真正定时任务执行时被运行的函数
  // 爬取数据库文章信息，然后解析图片之后转存数据库
  async subscribe() {
    console.log('开始解析数据');
    const { ctx } = this;
    try {
      // 获取到文章的长度
      const article_length = await this.app.mysql.query('SELECT count(id) FROM article');
      if (id <= article_length[0]['count(id)']) {
        const article = await this.app.mysql.get('article', { id });
        await ctx.service.image.getImage(article);
        console.log(`id=>${id}完成存储`);
        id++;
      } else {
        console.log(`${article_length[0]['count(id)']}条文章解析存储完成`);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
module.exports = ParsePictureComment;
