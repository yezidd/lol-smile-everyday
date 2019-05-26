'use strict';
const Service = require('egg').Service;
class ArticleService extends Service {
  async getArticleData(pageNo) {
    const res = await this.ctx.curl(`http://qt.qq.com/lua/lol_news/mcn_author_news?author_uuid=59d4872a-461a-47a0-92de-de5c15973b7a&page=${pageNo}&num=5&type=0&plat=ios&version=9851`, {
      dataType: 'json',
    });
    return res.data;
  }
}

module.exports = ArticleService;
