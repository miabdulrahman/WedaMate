import Category from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getCategories = async (req, res, next) => {
  try {
    const { featured } = req.query;
    const filter = {};
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
    return sendSuccess(res, 'Categories retrieved successfully', { categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return sendError(res, 'Category not found', [], 404);
    }
    return sendSuccess(res, 'Category details retrieved', { category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, image, featured, sortOrder, subcategories } = req.body;
    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      icon,
      image,
      featured,
      sortOrder,
      subcategories: subcategories || []
    });
    return sendSuccess(res, 'Category created successfully', { category }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) {
      return sendError(res, 'Category not found', [], 404);
    }
    return sendSuccess(res, 'Category updated successfully', { category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return sendError(res, 'Category not found', [], 404);
    }
    return sendSuccess(res, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
