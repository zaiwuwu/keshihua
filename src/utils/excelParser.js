import * as XLSX from 'xlsx';

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames.find(
          (n) => n.includes('餐盒') || workbook.SheetNames[0]
        ) || workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function mapExcelRows(rawRows) {
  if (rawRows.length < 3) return [];

  // Find header row - look for row containing '序号' or '产品分类'
  let headerIndex = 0;
  for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
    const row = rawRows[i];
    if (row.some(cell => String(cell).includes('序号') || String(cell).includes('产品分类'))) {
      headerIndex = i;
      break;
    }
  }

  const headers = rawRows[headerIndex];
  const dataRows = rawRows.slice(headerIndex + 1);

  // Build column index map from headers
  const colMap = {};
  headers.forEach((h, i) => {
    const key = String(h).trim();
    colMap[key] = i;
  });

  const getVal = (row, keywords) => {
    for (const kw of keywords) {
      const idx = colMap[kw];
      if (idx !== undefined && row[idx] !== undefined && row[idx] !== '') {
        return row[idx];
      }
    }
    // Try partial match
    for (const [key, idx] of Object.entries(colMap)) {
      for (const kw of keywords) {
        if (key.includes(kw) && row[idx] !== undefined && row[idx] !== '') {
          return row[idx];
        }
      }
    }
    return '';
  };

  const products = [];
  let lastCategory = '';

  for (const row of dataRows) {
    // Skip empty rows
    const hasData = row.some(cell => cell !== '' && cell !== undefined);
    if (!hasData) continue;

    const name = String(getVal(row, ['名称', '产品名称', 'name', '品名'])).trim();
    if (!name) continue;

    const category = String(getVal(row, ['产品分类', '分类', 'category'])).trim();
    const currentCategory = category || lastCategory;
    if (category) lastCategory = category;

    const factoryPrice = parseFloat(getVal(row, ['出厂价格', '出厂价', '出厂单价'])) || 0;

    const product = {
      category: currentCategory,
      name: name,
      capacityMl: parseInt(getVal(row, ['容量ml', '容量', 'ml', 'ML'])) || 0,
      spec: String(getVal(row, ['规格/套', '规格', 'spec'])).trim(),
      boxSize: String(getVal(row, ['箱规尺寸', '箱规', 'boxSize'])).trim(),
      weightGrams: parseFloat(getVal(row, ['成套克重/克', '成套克重', '克重', 'weight'])) || 0,
      packLength: parseFloat(getVal(row, ['包装长度', '外箱长', 'packLength', '长度cm'])) || 0,
      packWidth: parseFloat(getVal(row, ['包装宽度', '外箱宽', 'packWidth', '宽度cm'])) || 0,
      packHeight: parseFloat(getVal(row, ['包装高度', '外箱高', 'packHeight', '高度cm'])) || 0,
      pcsPerBox: parseInt(getVal(row, ['每箱套数', 'pcsPerBox', '箱套数'])) || 0,
      color: String(getVal(row, ['颜色', 'color'])).trim(),
      materialPrice: parseFloat(getVal(row, ['当日料价', '料价'])) || 0,
      factoryPrice,
      originalFactoryPrice: factoryPrice,
      updatedAt: new Date().toISOString(),
    };

    products.push(product);
  }

  return products;
}
