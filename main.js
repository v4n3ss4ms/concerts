let concertsData = [];

function csvToJson(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const data = line.split(',');
    return headers.reduce((obj, header, i) => {
      obj[header.trim()] = data[i]?.trim() || '';
      return obj;
    }, {});
  });
}

function parseDate(dateString) {
  if (!dateString) return null;
  const parts = dateString.split('/');
  if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
  if (parts.length === 1 && parts[0].length === 4) return new Date(parts[0], 0, 1);
  return null;
}

function getData() {
  fetch('./data/concerts_20241023.csv')
    .then(response => response.text())
    .then(csv => {
      concertsData = csvToJson(csv);
      concertsData.forEach(concert => {
        concert.date = parseDate(concert.date);
      });
      sortData('artist_name', 'asc');
      renderConcerts(concertsData);
      document.getElementById('sort-select').disabled = false;
      document.getElementById('order-select').disabled = false;
    })
    .catch(error => console.error('Error loading CSV:', error));
}

function renderConcerts(concerts) {
  const eventList = document.getElementById('concert-list');
  eventList.innerHTML = '';

  concerts.forEach(concert => {
    const {
      artist_name,
      event_type,
      event_name,
      date,
      venue,
      city,
      country,
      img_1,
      img_2,
      img_3,
      link,
      description
    } = concert;

    const concertItem = document.createElement('div');
    concertItem.classList.add('concert-item');

    concertItem.innerHTML = `
            <details>
                <summary>
                    <h2>${artist_name} ${event_name ? `- ${event_name}` : ''}</h2>
                    <p>${date ? date.toLocaleDateString() : 'No date available'}</p>
                </summary>
                ${img_1 ? `<img src="imgs/${img_1}" alt="${artist_name}">` : ''}
                <p><strong>Venue:</strong> ${venue}, ${city}, ${country}</p>
                <p><strong>Description:</strong> ${description || 'No description available'}</p>
                ${link ? `<a href="${link}" target="_blank">More info</a>` : ''}
            </details>
        `;

    eventList.appendChild(concertItem);
  });
}

function sortData(key, order) {
  concertsData.sort((a, b) => {
    let valA, valB;

    if (key === 'date') {
      valA = a.date || new Date(0);
      valB = b.date || new Date(0);
      return order === 'asc' ? valA - valB : valB - valA;
    } else {
      valA = a[key] ? a[key].toLowerCase() : '';
      valB = b[key] ? b[key].toLowerCase() : '';
      return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
  });

  renderConcerts(concertsData);
}

getData();

document.getElementById('sort-select').addEventListener('change', () => {
  const sortKey = document.getElementById('sort-select').value;
  const order = document.getElementById('order-select').value;
  if (sortKey && order) {
    sortData(sortKey, order);
  }
});

document.getElementById('order-select').addEventListener('change', () => {
  const sortKey = document.getElementById('sort-select').value;
  const order = document.getElementById('order-select').value;
  if (sortKey && order) {
    sortData(sortKey, order);
  }
});
