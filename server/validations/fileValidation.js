const Joi = require("@hapi/joi");

const fileValidationSchema = Joi.object({
  id: Joi.string().required(),
  file: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }),
});

const getAllFilesValidationSchema = Joi.object({
  id: Joi.string().required(),
});

module.exports = {
  fileValidationSchema,
  getAllFilesValidationSchema,
};
