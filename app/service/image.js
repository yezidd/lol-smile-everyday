'use strict';
const Service = require('egg').Service;
const cheerio = require('cheerio');
class ImageService extends Service {
  async getImage(article) {
    try {
      console.log(article.article_url, '===article.url=');
      const result = await this.ctx.curl(article.article_url, {
        dataType: 'text',
      });
      const $ = cheerio.load(result.data);
      const data = [];
      $('.article_content p img').each((index, dom) => {
        const parentDom = $(dom).parent().parent()
          .next();
        const comment = $(parentDom).find('span').text();
        if (!comment.startsWith('via.')) {
          console.log($(dom).attr('src'));
          console.log(comment);
          data.push({
            from_article_id: article.id,
            article_id: article.article_id,
            image_url: $(dom).attr('src'),
            comment,
            article_url: article.article_url,
          });
        }
      });
      // 存储数据到数据库
      await this.app.mysql.insert('article_image', data);
      return data;
    } catch (err) {
      console.log(err.message, '-====');
      // 如果发生错误，存储发生错误的原因和此时的
      await this.app.mysql.insert('py_error', {
        error_massage: err.message,
        from_article_id: article.id,
        article_id: article.article_id,
      });
    }
  }
}

module.exports = ImageService;
