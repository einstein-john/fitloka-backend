"use strict";

/** Demo products extend catalog seed (categories tops/bottoms may already exist). */

const DEMO_PRODUCT_SKUS = [
  "SKS-001",
  "SND-001",
  "CAP-001",
  "TOT-001",
  "WIN-001",
  "PL-001",
  "SRT-001",
];

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {string} slug
 * @param {{ name: string; description: string }} meta
 * @param {Date} now
 */
async function getOrCreateCategoryId(queryInterface, slug, meta, now) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id FROM categories WHERE slug = :slug LIMIT 1`,
    { replacements: { slug } }
  );
  if (rows.length) {
    return rows[0].id;
  }
  await queryInterface.bulkInsert("categories", [
    {
      name: meta.name,
      slug,
      description: meta.description,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ]);
  const [inserted] = await queryInterface.sequelize.query(
    `SELECT id FROM categories WHERE slug = :slug LIMIT 1`,
    { replacements: { slug } }
  );
  return inserted[0].id;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const footwearId = await getOrCreateCategoryId(
      queryInterface,
      "footwear",
      {
        name: "Footwear",
        description: "Sneakers, sandals, and shoes",
      },
      now
    );

    const accessoriesId = await getOrCreateCategoryId(
      queryInterface,
      "accessories",
      {
        name: "Accessories",
        description: "Caps, bags, and small goods",
      },
      now
    );

    const outerwearId = await getOrCreateCategoryId(
      queryInterface,
      "outerwear",
      {
        name: "Outerwear",
        description: "Jackets and layers",
      },
      now
    );

    const topsId = await getOrCreateCategoryId(
      queryInterface,
      "tops",
      {
        name: "Tops",
        description: "Shirts, tees, and sweaters",
      },
      now
    );

    const bottomsId = await getOrCreateCategoryId(
      queryInterface,
      "bottoms",
      {
        name: "Bottoms",
        description: "Jeans, pants, and shorts",
      },
      now
    );

    const demoProducts = [
      {
        categoryId: footwearId,
        name: "Classic Sneakers",
        sku: "SKS-001",
        price: "94.99",
        description: "Everyday sneakers — demo listing",
        stock: 45,
      },
      {
        categoryId: footwearId,
        name: "Leather Sandals",
        sku: "SND-001",
        price: "54.99",
        description: "Summer sandals — demo listing",
        stock: 30,
      },
      {
        categoryId: accessoriesId,
        name: "Snapback Cap",
        sku: "CAP-001",
        price: "24.99",
        description: "Adjustable cap — demo listing",
        stock: 80,
      },
      {
        categoryId: accessoriesId,
        name: "Canvas Tote",
        sku: "TOT-001",
        price: "34.99",
        description: "Carry-all tote — demo listing",
        stock: 55,
      },
      {
        categoryId: outerwearId,
        name: "Windbreaker",
        sku: "WIN-001",
        price: "99.99",
        description: "Lightweight shell — demo listing",
        stock: 25,
      },
      {
        categoryId: topsId,
        name: "Polo Shirt",
        sku: "PL-001",
        price: "44.99",
        description: "Cotton polo — demo listing",
        stock: 70,
      },
      {
        categoryId: bottomsId,
        name: "Chino Shorts",
        sku: "SRT-001",
        price: "49.99",
        description: "Casual shorts — demo listing",
        stock: 50,
      },
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
    const skuList = DEMO_PRODUCT_SKUS.map((s) => `'${s}'`).join(", ");
    await queryInterface.sequelize.query(
      `DELETE FROM inventories WHERE "productId" IN (SELECT id FROM products WHERE sku IN (${skuList}))`
    );
    await queryInterface.sequelize.query(`DELETE FROM products WHERE sku IN (${skuList})`);
    await queryInterface.sequelize.query(
      `DELETE FROM categories WHERE slug IN ('footwear', 'accessories', 'outerwear')`
    );
  },
};
