const express = require('express');

const closetController = require('../controllers/closetController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);

router
  .route('/')
  .get(closetController.getClosets)
  .post(closetController.uploadUserCloset, closetController.createCloset);

router.get('/image/:filename', closetController.serveClosetImage);

router
  .route('/:id')
  .get(closetController.getCloset)
  .patch(closetController.uploadUserCloset, closetController.updateCloset)
  .delete(closetController.deleteCloset);

module.exports = router;
