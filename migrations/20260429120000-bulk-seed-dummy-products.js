"use strict";

/**
 * Inserts 100 dummy catalog rows for development/staging.
 * Uses existing categories when present; otherwise creates one placeholder category
 * (so this migration works when `db:migrate` runs before seeders, e.g. Docker).
 *
 * SKUs: DUM-2026-001 … DUM-2026-100
 * Each row gets inventory and one placeholder image (picsum + marker altText for clean rollback).
 */

const SKU_PREFIX = "DUM-2026-";
const BULK_COUNT = 100;
const DUMMY_IMAGE_ALT = "__fitloka_dummy_bulk__";
const FALLBACK_CATEGORY_SLUG = "__fitloka_bulk_products__";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    let [categories] = await queryInterface.sequelize.query(
      `SELECT id FROM categories WHERE "deletedAt" IS NULL ORDER BY id ASC`
    );

    if (!categories.length) {
      await queryInterface.bulkInsert("categories", [
        {
          name: "Bulk demo (migration)",
          slug: FALLBACK_CATEGORY_SLUG,
          description: "Placeholder category for 100 dummy products migration",
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ]);
      [categories] = await queryInterface.sequelize.query(
        `SELECT id FROM categories WHERE "deletedAt" IS NULL ORDER BY id ASC`
      );
    }

    const categoryIds = categories.map((c) => c.id);

    for (let i = 1; i <= BULK_COUNT; i += 1) {
      const padded = String(i).padStart(3, "0");
      const sku = `${SKU_PREFIX}${padded}`;

      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM products WHERE sku = :sku LIMIT 1`,
        { replacements: { sku } }
      );
      if (existing.length) continue;

      const categoryId = categoryIds[(i - 1) % categoryIds.length];
      const price = (10 + (i % 90) + (i % 7) * 0.99).toFixed(2);

      await queryInterface.bulkInsert("products", [
        {
          categoryId,
          name: `Demo garment ${padded}`,
          sku,
          description: `Auto-generated demo product ${padded} for load testing and UI dev.`,
          price,
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ]);

      const [prodRows] = await queryInterface.sequelize.query(
        `SELECT id FROM products WHERE sku = :sku LIMIT 1`,
        { replacements: { sku } }
      );
      const productId = prodRows[0].id;

      await queryInterface.bulkInsert("inventories", [
        {
          productId,
          stock: 10 + (i % 50),
          reservedStock: 0,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      const imageUrl = `https://picsum.photos/seed/fitloka-${sku}/600/800`;

      await queryInterface.bulkInsert("images", [
        {
          url: imageUrl,
          altText: DUMMY_IMAGE_ALT,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      const [imgRows] = await queryInterface.sequelize.query(
        `SELECT id FROM images WHERE url = :url LIMIT 1`,
        { replacements: { url: imageUrl } }
      );
      const imageId = imgRows[0].id;

      await queryInterface.bulkInsert("product_images", [
        {
          productId,
          imageId,
          sortOrder: 0,
          isPrimary: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM product_images WHERE "productId" IN (SELECT id FROM products WHERE sku LIKE :pattern)`,
      { replacements: { pattern: `${SKU_PREFIX}%` } }
    );
    await queryInterface.sequelize.query(
      `DELETE FROM inventories WHERE "productId" IN (SELECT id FROM products WHERE sku LIKE :pattern)`,
      { replacements: { pattern: `${SKU_PREFIX}%` } }
    );
    await queryInterface.sequelize.query(`DELETE FROM products WHERE sku LIKE :pattern`, {
      replacements: { pattern: `${SKU_PREFIX}%` },
    });
    await queryInterface.sequelize.query(`DELETE FROM images WHERE "altText" = :alt`, {
      replacements: { alt: DUMMY_IMAGE_ALT },
    });
    await queryInterface.sequelize.query(`DELETE FROM categories WHERE slug = :slug`, {
      replacements: { slug: FALLBACK_CATEGORY_SLUG },
    });
  },
};
