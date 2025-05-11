import Joi from 'joi'

export const validationOptions = {
  abortEarly: true,
  allowUnknown: true
}

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .trim()
    .valid('development', 'testing', 'staging', 'production')
    .default('development'),
  DATABASE_URL: Joi.string().trim().empty(false).required(),
  ACCESS_TOKEN_SECRET: Joi.string().trim().empty(false).required(),
  ACCESS_TOKEN_TTL: Joi.string().trim().empty(false).required(),
  REFRESH_TOKEN_SECRET: Joi.string().trim().empty(false).required(),
  REFRESH_TOKEN_TTL: Joi.string().trim().empty(false).required(),
  API_KEY: Joi.string().trim().empty(false).required(),
  VPAY_API_KEY: Joi.string().trim().empty(false).required(),
  VPAY_URL: Joi.string().trim().empty(false).required(),
  CALLBACK_SECRET_KEY: Joi.string().trim().empty(false).required(),
  TELEGRAM_TOKEN: Joi.string().trim().empty(false).required(),
  TELEGRAM_CHATID: Joi.string().trim().empty(false).required(),
  TELEGRAM_PENDING_WITHDRAWAL_CHATID: Joi.string()
    .trim()
    .empty(false)
    .required(),
  PREFIX_CODE: Joi.string().trim().empty(false).required(),
  WHITELIST_IP: Joi.string().trim().empty(''),
  MERCHANT_ID: Joi.string().trim().empty(false).required(),
  ENCRYPT_KEY: Joi.string().trim().empty(false).required()
})
