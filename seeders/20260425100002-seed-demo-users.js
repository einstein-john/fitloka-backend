"use strict";

const { hashPassword } = require("./lib/password-hash");

const ADMIN_EMAIL = "admin@fitlokal.dev";
const SHOPPER_EMAIL = "shopper@fitlokal.dev";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
    const shopperPassword = process.env.SEED_SHOPPER_PASSWORD || "ChangeMe123!";

    const [adminRows] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = :email LIMIT 1`,
      { replacements: { email: ADMIN_EMAIL } }
    );
    if (!adminRows.length) {
      await queryInterface.bulkInsert("users", [
        {
          username: "admin",
          firstName: "Admin",
          lastName: "User",
          email: ADMIN_EMAIL,
          password: hashPassword(adminPassword),
          enabled: true,
          isAdmin: true,
          profilePicture: null,
          lastLogin: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ]);
    }

    const [shopperRows] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = :email LIMIT 1`,
      { replacements: { email: SHOPPER_EMAIL } }
    );
    if (!shopperRows.length) {
      await queryInterface.bulkInsert("users", [
        {
          username: "shopper",
          firstName: "Demo",
          lastName: "Shopper",
          email: SHOPPER_EMAIL,
          password: hashPassword(shopperPassword),
          enabled: true,
          isAdmin: false,
          profilePicture: null,
          lastLogin: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ]);
    }
  },

  async down(queryInterface) {
    const [idRows] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email IN ('${ADMIN_EMAIL}', '${SHOPPER_EMAIL}')`
    );
    const userIds = idRows.map((r) => r.id);
    if (!userIds.length) return;

    const idList = userIds.join(",");

    await queryInterface.sequelize.query(
      `DELETE FROM payments WHERE "orderId" IN (SELECT id FROM orders WHERE "userId" IN (${idList}))`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM "order_items" WHERE "orderId" IN (SELECT id FROM orders WHERE "userId" IN (${idList}))`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM orders WHERE "userId" IN (${idList})`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM "cart_items" WHERE "cartId" IN (SELECT id FROM carts WHERE "userId" IN (${idList}))`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM carts WHERE "userId" IN (${idList})`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE id IN (${idList})`
    );
  },
};
