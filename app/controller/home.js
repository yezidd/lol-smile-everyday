'use strict';

const Controller = require('egg').Controller;
const async = require('async');
const moment = require('moment');
const PAGE_SIZE = 10;

const url = 'http://qt.qq.com/lua/lol_news/mcn_author_news?author_uuid=59d4872a-461a-47a0-92de-de5c15973b7a&page=1&num=10&type=0&plat=ios&version=9851';

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
  // 获取文章地址
  async getArticleList() {
    const { ctx } = this;
    const result = await ctx.curl(url, {
      dataType: 'json',
    });
    console.log(result.data);
    ctx.body = result.data;
  }
  // 获取文章列表，然后根据文章地址解析图片，并缓存本地
  async getImageComList() {
    const { ctx } = this;
    const article = await this.app.mysql.get('article', { id: 1 });
    const image_data = await this.ctx.service.image.getImage(article);
    ctx.body = image_data;
  }
  // 获取一串文章列表，然后查询是否存在与当前文章数据库中，如果存在，
  // 则比较pv量，如果相同则直接转存此次pv量，如果不相同，将文章数据库pv更新，然后转存此次pv
  async getPvRecord() {
    const { ctx } = this;
    const result = await ctx.curl(url, {
      dataType: 'json',
    });
    const list = result.data.list;
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
          // 添加数据到pv表中
            await this.app.mysql.insert('pv_record', { article_id: item.article_id, pv: item.pv, pv_record_date: moment().format('YYYY-MM-DD') });
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
        console.log('一次接口数据pv刷新完成');
      }
    });
    ctx.body = result.data;
  }
}

module.exports = HomeController;
