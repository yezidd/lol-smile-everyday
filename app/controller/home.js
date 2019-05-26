'use strict';

const Controller = require('egg').Controller;

const PAGE_SIZE = 10;

const url = 'http://qt.qq.com/lua/lol_news/mcn_author_news?author_uuid=59d4872a-461a-47a0-92de-de5c15973b7a&page=12&num=10&type=0&plat=ios&version=9851';

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
}

module.exports = HomeController;
