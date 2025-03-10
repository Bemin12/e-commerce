const router = require('express').Router({ mergeParams: true });
const {
  getSubcategoryValidator,
  createSubcategoryValidator,
  updateSubcategoryValidator,
  deleteSubcategoryValidator,
} = require('../middlewares/validators/subcategoryValidator');

const {
  getSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  setcategoryIdToBody,
} = require('../controllers/subcategoryController');

router
  .route('/')
  .get(getSubcategories)
  .post(setcategoryIdToBody, createSubcategoryValidator, createSubcategory);

router
  .route('/:id')
  .get(getSubcategoryValidator, getSubcategory)
  .patch(updateSubcategoryValidator, updateSubcategory)
  .delete(deleteSubcategoryValidator, deleteSubcategory);

module.exports = router;
