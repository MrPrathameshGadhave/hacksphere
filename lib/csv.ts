function escapeCsvValue(value: unknown) {
  const normalized =
    value === null || value === undefined ? "" : String(value).replace(/\r?\n/g, "\n");

  if (
    normalized.includes(",") ||
    normalized.includes('"') ||
    normalized.includes("\n")
  ) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

export function buildCsv(
  headers: string[],
  rows: Array<Record<string, unknown>>
) {
  const headerRow = headers.map(escapeCsvValue).join(",");
  const dataRows = rows.map((row) =>
    headers.map((header) => escapeCsvValue(row[header])).join(",")
  );

  return [headerRow, ...dataRows].join("\r\n");
}
