#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const inputIndex = process.argv.indexOf("--input-dir");
const outputIndex = process.argv.indexOf("--output");
const inputDir = inputIndex >= 0 ? process.argv[inputIndex + 1] : "";
const outputPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : "";

if (!inputDir || !outputPath) {
  console.error("Usage: node scripts/generate-mysql-legacy-import.mjs --input-dir <dir> --output <file>");
  process.exit(1);
}

const fileOrder = [
  "cities_rows.sql",
  "trip_categories_rows.sql",
  "trips_rows.sql",
  "stays_rows.sql",
  "vehicles_rows.sql",
  "products_rows.sql",
  "inquiries_rows.sql",
  "car_bookings_rows.sql",
];

function fail(message) {
  console.error(`Migration generation failed: ${message}`);
  process.exit(1);
}

function splitTopLevel(input, separator = ",") {
  const values = [];
  let start = 0;
  let depth = 0;
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === "'" && input[index + 1] === "'") {
        index += 1;
      } else if (char === "'") {
        quoted = false;
      }
      continue;
    }
    if (char === "'") {
      quoted = true;
    } else if (char === "(" || char === "[" || char === "{") {
      depth += 1;
    } else if (char === ")" || char === "]" || char === "}") {
      depth -= 1;
    } else if (char === separator && depth === 0) {
      values.push(input.slice(start, index).trim());
      start = index + 1;
    }
  }
  values.push(input.slice(start).trim());
  return values.filter(Boolean);
}

function parseRows(valuesText) {
  const rows = [];
  let rowStart = -1;
  let depth = 0;
  let quoted = false;

  for (let index = 0; index < valuesText.length; index += 1) {
    const char = valuesText[index];
    if (quoted) {
      if (char === "'" && valuesText[index + 1] === "'") {
        index += 1;
      } else if (char === "'") {
        quoted = false;
      }
      continue;
    }
    if (char === "'") {
      quoted = true;
    } else if (char === "(") {
      if (depth === 0) rowStart = index + 1;
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
      if (depth === 0 && rowStart >= 0) {
        rows.push(splitTopLevel(valuesText.slice(rowStart, index)));
        rowStart = -1;
      }
    }
  }
  return rows;
}

function decodePgString(token) {
  const trimmed = token.trim();
  if (!/^'.*'$/.test(trimmed)) return trimmed;
  return trimmed.slice(1, -1).replaceAll("''", "'");
}

function parseArray(token) {
  const inner = token.trim().replace(/^ARRAY\[/i, "").replace(/\]$/, "");
  if (!inner) return "[]";
  return JSON.stringify(splitTopLevel(inner).map(decodePgString));
}

function mysqlQuote(value) {
  return `'${String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "''")}'`;
}

function mysqlValue(token, column) {
  const trimmed = token.trim();
  if (/^null$/i.test(trimmed)) return "NULL";
  if (/^true$/i.test(trimmed)) return "1";
  if (/^false$/i.test(trimmed)) return "0";
  if (/^ARRAY\[/i.test(trimmed)) return mysqlQuote(parseArray(trimmed));

  const value = decodePgString(trimmed)
    .replace(/\.png$/i, ".webp")
    .replace(/(\.\d{1,6})\+00$/, "$1");

  if (column === "details" && value) {
    try {
      return mysqlQuote(JSON.stringify(JSON.parse(value)));
    } catch {
      fail(`Invalid JSON in ${column}: ${value}`);
    }
  }
  return mysqlQuote(value);
}

function parseInsert(fileName, source) {
  const match = source.match(/INSERT\s+INTO\s+public\.([a-z0-9_]+)\s*\(([^)]+)\)\s+VALUES\s+([\s\S]*);/i);
  if (!match) fail(`Could not parse INSERT statement in ${fileName}`);
  const table = match[1];
  const columns = match[2].split(",").map((column) => column.trim());
  const rows = parseRows(match[3]);
  if (!rows.length || rows.some((row) => row.length !== columns.length)) {
    fail(`Column/value count mismatch in ${fileName}`);
  }
  return { table, columns, rows };
}

function buildUpsert({ table, columns, rows }) {
  const quotedColumns = columns.map((column) => `\`${column}\``).join(", ");
  const values = rows
    .map((row) => `(${row.map((value, index) => mysqlValue(value, columns[index])).join(", ")})`)
    .join(",\n");
  const updates = columns
    .filter((column) => column !== "id")
    .map((column) => `\`${column}\` = VALUES(\`${column}\`)`)
    .join(",\n  ");
  return `INSERT INTO \`${table}\` (${quotedColumns}) VALUES\n${values}\nON DUPLICATE KEY UPDATE\n  ${updates};`;
}

const statements = [
  "-- Generated locally from the supplied PostgreSQL row exports.",
  "-- Review this file before importing it into Hostinger.",
  "SET NAMES utf8mb4;",
  "SET time_zone = '+00:00';",
];
let totalRows = 0;

for (const fileName of fileOrder) {
  const filePath = path.join(inputDir, fileName);
  if (!fs.existsSync(filePath)) fail(`Missing input file: ${filePath}`);
  const parsed = parseInsert(fileName, fs.readFileSync(filePath, "utf8"));
  statements.push(`\n-- ${fileName}: ${parsed.rows.length} rows`);
  statements.push(buildUpsert(parsed));
  totalRows += parsed.rows.length;
}

statements.push("\nINSERT INTO schema_migrations (version) VALUES ('legacy_rows') ON DUPLICATE KEY UPDATE version = VALUES(version);");
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
console.log(`Generated ${totalRows} rows across ${fileOrder.length} tables: ${path.resolve(outputPath)}`);
