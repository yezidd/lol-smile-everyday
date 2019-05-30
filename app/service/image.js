'use strict';
const Service = require('egg').Service;
const cheerio = require('cheerio');
const moment = require('moment');
class ImageService extends Service {
  async getImage(article) {
    try {
      console.log(article.article_url, '===article.url=');
      const result = await this.ctx.curl(article.article_url, {
        dataType: 'text',
      });
      const $ = cheerio.load(result.data);
      const data = [];
      $('.article_content  img').each((index, dom) => {
        // 一直遍历img元素的父级元素知道其为外围div .article_content
        let comment = null;
        let numHierarchy = 0;
        let parentDom = dom;
        let domNeed = null;
        while (!($(parentDom).attr('class') === 'article_content')) {
          numHierarchy++;
          // 如果能找到p标签，则p标签是需要的标签，p标签下一个标签存在着所需要的评论
          if ($(parentDom)[0].tagName.toLowerCase() === 'p') {
            domNeed = $(parentDom).next();
          }
          parentDom = $(parentDom).parent();
        }
        // 如果层级是3，则表示的是上面两种
        // 如果层级是2，则直接取img标签的父元素
        // div p span img
        // div div p img
        // div div img
        if (numHierarchy === 2) {
          domNeed = $(dom).parent().next();
        }
        if (numHierarchy === 3 && domNeed === null) {
          return;
        }
        if ($(domNeed).find('span').length > 0) {
          comment = $(domNeed).find('span').text();
        } else {
          comment = $(domNeed).text();
        }
        comment = comment.replace(/\s*/g, '');
        if (!comment.startsWith('via') && !comment.startsWith('ia') && !comment.startsWith('a。') && !comment.startsWith('a.') && !comment.startsWith('Via') && !comment.startsWith('Vi') && comment !== '') {
          if (comment.startsWith('作者')) {
            comment = 'lol玩家投稿';
          }
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
      if (data.length !== 0) {
        // 存储数据到数据库
        // await this.app.mysql.insert('article_image', data);
      } else {
        // 如果发生错误，存储发生错误的原因和此时的
        await this.app.mysql.insert('py_error', {
          error_message: article.id + '无爬取数据请查看具体信息',
          from_article_id: article.id,
          article_id: article.article_id,
          handle_type: 'ImageService/解析图片和评论',
          current_time: moment().format('YYYY-MM-DD HH:mm:ss'),
          is_result: 0,
          result: '',
        });
      }
      return data;
    } catch (err) {
      // 如果发生错误，存储发生错误的原因和此时的
      await this.app.mysql.insert('py_error', {
        error_message: JSON.stringify(err),
        from_article_id: article.id,
        article_id: article.article_id,
        handle_type: 'ImageService/添加图片进入数据库',
        current_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        is_result: 0,
        result: '',
      });
    }
  }
}

module.exports = ImageService;
