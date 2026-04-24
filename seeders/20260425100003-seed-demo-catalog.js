"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [topsRows] = await queryInterface.sequelize.query(
      `SELECT id FROM categories WHERE slug = 'tops' LIMIT 1`
    );
    let topsId;
    if (topsRows.length) {
      topsId = topsRows[0].id;
    } else {
      await queryInterface.bulkInsert("categories", [
        {
          name: "Tops",
          slug: "tops",
          description: "Shirts, tees, and sweaters",
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ]);
      const [inserted] = await queryInterface.sequelize.query(
        `SELECT id FROM categories WHERE slug = 'tops' LIMIT 1`
      );
      topsId = inserted[0].id;
    }

    const [bottomsRows] = await queryInterface.sequelize.query(
      `SELECT id FROM categories WHERE slug = 'bottoms' LIMIT 1`
    );
    let bottomsId;
    if (bottomsRows.length) {
      bottomsId = bottomsRows[0].id;
    } else {
      await queryInterface.bulkInsert("categories", [
        {
          name: "Bottoms",
          slug: "bottoms",
          description: "Jeans, pants, and shorts",
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ]);
      const [inserted] = await queryInterface.sequelize.query(
        `SELECT id FROM categories WHERE slug = 'bottoms' LIMIT 1`
      );
      bottomsId = inserted[0].id;
    }

    const demoProducts = [
      { categoryId: topsId, name: "Classic Tee", sku: "TEE-001", price: "29.99", description: "Classic Tee — demo listing", stock: 100 },
      { categoryId: topsId, name: "Hoodie", sku: "HOD-001", price: "79.99", description: "Hoodie — demo listing", stock: 40 },
      { categoryId: bottomsId, name: "Slim Jeans", sku: "JNS-001", price: "89.99", description: "Slim Jeans — demo listing", stock: 60 },
    ];

    for (const p of demoProducts) {
      const [skuRows] = await queryInterface.sequelize.query(
        `SELECT id FROM products WHERE sku = :sku LIMIT 1`,
        { replacements: { sku: p.sku } }
      );
      if (skuRows.length) continue;

      await queryInterface.bulkInsert("products", [
        {
          categoryId: p.categoryId,
          name: p.name,
          sku: p.sku,
          description: p.description,
          price: p.price,
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ]);

      const [prodRows] = await queryInterface.sequelize.query(
        `SELECT id FROM products WHERE sku = :sku LIMIT 1`,
        { replacements: { sku: p.sku } }
      );
      const productId = prodRows[0].id;

      await queryInterface.bulkInsert("inventories", [
        {
          productId,
          stock: p.stock,
          reservedStock: 0,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM inventories WHERE "productId" IN (SELECT id FROM products WHERE sku IN ('TEE-001', 'HOD-001', 'JNS-001'))`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM products WHERE sku IN ('TEE-001', 'HOD-001', 'JNS-001')`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM categories WHERE slug IN ('tops', 'bottoms')`
    );
  },
};
