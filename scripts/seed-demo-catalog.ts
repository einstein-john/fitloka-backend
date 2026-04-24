#!/usr/bin/env node
/**
 * Thin wrapper: runs the same data as Sequelize seeders (`npm run seed`).
 * Prefer: `npm run migrate` then `npm run seed`.
 */
import { execSync } from "child_process";
import path from "path";

const root = path.resolve(__dirname, "..");
execSync("npm run seed", { stdio: "inherit", cwd: root, env: process.env });
