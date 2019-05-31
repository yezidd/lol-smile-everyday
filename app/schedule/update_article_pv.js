'use strict';

const Subscription = require('egg').Subscription;
const moment = require('moment');
let pageNo = 2;
let articleNum = 0;
let pvAllNum = 0;
let aimDate = moment().format('YYYY-MM-DD');
// 每天抓取 文章列表，然后更新差量数据
class UpdateArticlePv extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '10s',
      type: 'all', // 指定所有的 worker 都需要执行,
      immediate: true,
      disable: false,
    };
  }
  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    // 如果是目标今天，那么就执行任务
    // 如果不是，则不执行
    if (aimDate === moment().format('YYYY-MM-DD')) {
      try {
        const data = await this.ctx.service.article.updateArticlePv(pageNo);
        // 获取一页数据之后，更新总article数量和pv数量
        articleNum = articleNum + data.list.length;
        data.list.forEach(item => {
          pvAllNum = pvAllNum + Number(item.pv);
        });
        if (Number(data.next) === 1) {
          pageNo++;
        } else {
          // 最后一页的时候，存储汇总数据到数据库
          // 今天定时任务完成
          // 然后重置状态
          await this.app.mysql.insert('all_record', {
            article_num: articleNum,
            article_pv_all: pvAllNum,
            all_record_date: moment().format('YYYY-MM-DD'),
          });
          // 目标日期用明天
          // 重置其他状态
          aimDate = moment().add(1, 'days').format('YYYY-MM-DD');
          pageNo = 1;
          articleNum = 0;
          pvAllNum = 0;
        }
      } catch (err) {
        console.log(err, '====');
      }
    } else {
      console.log('---今天的刷新pv数据任务完成');
    }
  }
}
module.exports = UpdateArticlePv;
