'use strict';
const Service = require('egg').Service;
const async = require('async');
const moment = require('moment');

class ArticleService extends Service {
  // 获取article数据
  async getArticleData(pageNo) {
    const res = await this.ctx.curl(`http://qt.qq.com/lua/lol_news/mcn_author_news?author_uuid=59d4872a-461a-47a0-92de-de5c15973b7a&page=${pageNo}&num=5&type=0&plat=ios&version=9851`, {
      dataType: 'json',
    });
    return res.data;
  }
  // 更新article pv
  async updateArticlePv(pageNo) {
    const data = await this.getArticleData(pageNo);
    const list = data.list;
    // 使用aysnc库来异步执行
    async.every(list, async item => {
      try {
        // 首先查询此条数据有没有存在article表中
        // 如果不为null则比较pv量，如果没有则转存article和文章
        const result = await this.app.mysql.get('article', { article_id: item.article_id });
        const data = JSON.parse(JSON.stringify(result));
        if (data) {
          // 如果存在则更新
          const updateResult = await this.app.mysql.update('article', { pv: item.pv, id: data.id });
          console.log('---更新数据库', updateResult);
          // 如果同一天已经有一条pv数据了,那么就不添加了
          const searchData = await this.app.mysql.get('pv_record', { pv_record_date: moment().format('YYYY-MM-DD'), article_id: item.article_id });
          if (searchData === null) {
            // 然后查询pv_record表，看看是否已经有存在的数据了，
            // 如果有则进行pv对比，如果pv没有更新，则直接更新日期
            // 如果pv更新，则转存此条pv数据
            if (Number(result.pv) === Number(item.pv)) {
              await this.app.mysql.update('pv_record', { pv_record_date: moment().format('YYYY-MM-DD') }, { where: { article_id: item.article_id, pv_record_date: moment().subtract(1, 'days').format('YYYY-MM-DD') } });
            } else {
            // 添加数据到pv表中
              await this.app.mysql.insert('pv_record', { article_id: item.article_id, pv: item.pv, pv_record_date: moment().format('YYYY-MM-DD') });
            }
          }
        } else {
          // 如果不存在添加数据到文章表中
          const addResult = await this.app.mysql.insert('article', item);
          console.log('---添加数据库', addResult);
          // 如果同一天已经有一条pv数据了,那么就不添加了
          const searchData = await this.app.mysql.get('pv_record', { pv_record_date: moment().format('YYYY-MM-DD'), article_id: item.article_id });
          if (searchData === null) {
            // 添加数据到pv表中
            await this.app.mysql.insert('pv_record', { article_id: item.article_id, pv: item.pv, pv_record_date: moment().format('YYYY-MM-DD') });
          }
        }
      } catch (err) {
        console.log(err, '-');
        // 如果发生错误，存储发生错误的原因和此时的时间
        await this.app.mysql.insert('py_error', {
          error_message: JSON.stringify(err),
          article_id: item.article_id,
          handle_type: 'ImageService/每日更新pv量',
          current_time: moment().format('YYYY-MM-DD HH:mm:ss'),
          is_result: 0,
          result: '',
        });
      }
    }, function(err) {
      if (err === null) {
        console.log(`一次接口数据pv刷新完成-->第${pageNo}页`);
      }
    });
    return data;
  }
}

module.exports = ArticleService;
