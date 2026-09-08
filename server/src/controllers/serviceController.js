import Service from '../models/Service.js';
import Category from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getServices = async (req, res, next) => {
  try {
    const { category, search, popular, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        filter.category = category;
      }
    }

    if (popular !== undefined) {
      filter.popular = popular === 'true';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter)
      .populate('category', 'name slug icon')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ popular: -1, title: 1 });

    return sendSuccess(res, 'Services retrieved successfully', {
      services,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug }).populate('category', 'name slug icon');
    if (!service) {
      return sendError(res, 'Service not found', [], 404);
    }
    return sendSuccess(res, 'Service details retrieved', { service });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const { title, slug, category, subcategory, description, pricingType, basePrice, estimatedDurationMinutes, icon, image, popular } = req.body;
    const service = await Service.create({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      subcategory,
      description,
      pricingType,
      basePrice,
      estimatedDurationMinutes,
      icon,
      image,
      popular: popular || false
    });
    return sendSuccess(res, 'Service created successfully', { service }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!service) {
      return sendError(res, 'Service not found', [], 404);
    }
    return sendSuccess(res, 'Service updated successfully', { service });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return sendError(res, 'Service not found', [], 404);
    }
    return sendSuccess(res, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};
