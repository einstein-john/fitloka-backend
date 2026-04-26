import { NodeEnvOptions } from "./constants";
import { config } from "dotenv";
import debug from "debug";
import Joi from "joi";

config();

const envSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .default(NodeEnvOptions.DEVELOPMENT)
      .valid(...Object.values(NodeEnvOptions)),
    VERSION: Joi.string().default("1.0.0"),
    SERVICE: Joi.string().default("fitlokal-api"),
    PORT: Joi.number().default(3000),
    ALLOWED_ORIGINS: Joi.string().default("*"),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(3306),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_SYNC: Joi.boolean().default(false),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default("7d"),
    TRUST_PROXY: Joi.alternatives().try(Joi.boolean(), Joi.number().integer().min(0), Joi.string()),
    RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(300),
    AUTH_RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
    AUTH_RATE_LIMIT_MAX_REQUESTS: Joi.number().default(20),
  })
  .unknown();

const { error, value: environmentConfig } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

class ServerConfig {
  public NODE = {
    ENV: environmentConfig.NODE_ENV,
    PORT: environmentConfig.PORT,
    VERSION: environmentConfig.VERSION,
    SERVICE: environmentConfig.SERVICE,
  };

  public DEBUG = this.NODE.ENV === NodeEnvOptions.DEVELOPMENT ? debug("dev") : () => {};

  public ALLOWED_ORIGINS = environmentConfig.ALLOWED_ORIGINS.split(",").map((origin) =>
    origin.trim()
  );

  public DB = {
    HOST: environmentConfig.DB_HOST,
    PORT: environmentConfig.DB_PORT,
    USER: environmentConfig.DB_USER,
    PASSWORD: environmentConfig.DB_PASSWORD,
    NAME: environmentConfig.DB_NAME,
    SYNC: environmentConfig.DB_SYNC,
  };

  public JWT = {
    SECRET: environmentConfig.JWT_SECRET,
    EXPIRES_IN: environmentConfig.JWT_EXPIRES_IN,
  };

  public RATE_LIMIT = {
    WINDOW_MS: environmentConfig.RATE_LIMIT_WINDOW_MS,
    MAX_REQUESTS: environmentConfig.RATE_LIMIT_MAX_REQUESTS,
    AUTH_WINDOW_MS: environmentConfig.AUTH_RATE_LIMIT_WINDOW_MS,
    AUTH_MAX_REQUESTS: environmentConfig.AUTH_RATE_LIMIT_MAX_REQUESTS,
  };

  public TRUST_PROXY = environmentConfig.TRUST_PROXY ?? false;
}

export default new ServerConfig();
