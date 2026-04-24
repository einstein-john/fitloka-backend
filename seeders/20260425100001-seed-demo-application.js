"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const name = "Fitlokal Dev Client";
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM applications WHERE name = :name LIMIT 1`,
      { replacements: { name } }
    );
    if (rows.length) {
      return;
    }
    const apiKey = String(process.env.SEED_DEV_API_KEY || "devdevdevdevdevdevdevdevdevdevdev").slice(0, 32);
    await queryInterface.bulkInsert("applications", [
      {
        name,
        apiKey,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM applications WHERE name = 'Fitlokal Dev Client'`
    );
  },
};
