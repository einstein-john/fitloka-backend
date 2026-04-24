import { Sequelize } from "sequelize";
import serverConfig from "../config/server.config";
import { init } from "./models";

class Database {
  private sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize(
      serverConfig.DB.NAME,
      serverConfig.DB.USER,
      serverConfig.DB.PASSWORD,
      {
        host: serverConfig.DB.HOST,
        port: serverConfig.DB.PORT,
        dialect: "postgres",
        logging: false,
      }
    );
  }

  public getSequelize() {
    return this.sequelize;
  }

  public async connect() {
    try {
      await this.sequelize.authenticate();

      init(this.sequelize);
      serverConfig.DEBUG("Database connection has been established successfully.");

      if (serverConfig.DB.SYNC) {
        await this.sequelize.sync();
        serverConfig.DEBUG("Database synchronized successfully.");
      } else {
        serverConfig.DEBUG("Database sync skipped. Use migrations to manage schema.");
      }

      return this.sequelize;
    } catch (error) {
      serverConfig.DEBUG("Unable to connect to the database:", error);
      throw error;
    }
  }

  public async closeConnection() {
    if (this.sequelize) {
      try {
        await this.sequelize.close();
        serverConfig.DEBUG("Connection has been closed successfully.");
      } catch (error) {
        serverConfig.DEBUG("Unable to close the connection:", error);
        throw error;
      }
    }
  }
}

export default new Database();
