'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.getImageComList);
  router.get('/record', controller.home.getPvRecord);
};
