const API_KEY = "AIzaSyBkevpO9i47UG3eZKbn4tfkxOz1neNqUFc";
const SHEET_ID = "195GtYWh-fiT-gn0tK3Z4d_dPDycubvv5VG-oLGdliOQ";
const RANGE = "Drug Formulary PKD Gombak";
const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(RANGE)}?key=${API_KEY}`;

let sheetData = [];

async function fetchSheetData() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    const [headers, ...rows] = json.values;

    // Convert rows into objects with column headers
    sheetData = rows.map(row =>
      headers.reduce((obj, key, i) => {
        obj[key] = row[i] || ""; // Fill missing cells with empty string
        return obj;
      }, {})
    );
  } catch (error) {
    document.getElementById("results").innerHTML = `<p>Failed to load data: ${error.message}</p>`;
  }
}

function matchesQuery(item, field, query) {
  query = query.toLowerCase();

  // Always use free-text search across all fields
  return Object.values(item).some(val =>
    (val || "").toLowerCase().includes(query)
  );
}

async function searchDrug() {
  const searchInput = document.getElementById("search");
  const resultsContainer = document.getElementById("results");

  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    resultsContainer.innerHTML = "<p>Please enter a keyword.</p>";
    return;
  }

  // Fetch sheet data only once
  if (sheetData.length === 0) {
    await fetchSheetData();
  }

  const filtered = sheetData.filter(item => matchesQuery(item, "", query));
  displayResults(filtered);
}

function displayResults(data) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p>No matching drug found.</p>";
    return;
  }

  const table = document.createElement("table");
  const headerRow = document.createElement("tr");

  Object.keys(data[0]).forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  data.forEach(row => {
    const tr = document.createElement("tr");
    Object.values(row).forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  container.appendChild(table);
}
