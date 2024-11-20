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
  fetch('./data/concerts_20241120.csv')
    .then(response => response.text())
    .then(csv => {
      concertsData = csvToJson(csv);
      concertsData.forEach(concert => {
        concert.date = parseDate(concert.date);
      });
      sortData('artist_name', 'asc');
      //renderConcerts(concertsData);
      renderConcertGrid(concertsData);
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

  //renderConcerts(concertsData);
  renderConcertGrid(concertsData);
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


function renderConcertGrid(concerts) {
  const concertGrid = document.getElementById('concert-grid');
  concertGrid.innerHTML = '';

  concerts.forEach(concert => {
    const {
      artist_name,
      event_type,
      event_name,
      date,
      img_1,
      img_2,
      img_3,
    } = concert;



    const concertItem = document.createElement('div');
    concertItem.classList.add('concert-item');
    concertItem.setAttribute('tabindex', '0');

    concertItem.innerHTML = `
      ${img_1 ? `<img src="imgs/${img_1}" alt="${artist_name}">` : ''}
      <h3>${artist_name}</h3>
      <p>${event_name ? event_name : ''}</p>
      <p>${date ? date.toLocaleDateString() : 'No date available'}</p>
    `;

    concertItem.addEventListener('click', () => openModal(concert));
    concertItem.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') openModal(concert);
    });

    concertGrid.appendChild(concertItem);
  });
}

function openModal(concert) {
  const modal = document.querySelector('.js-modal');
  const closeModalBtn = document.querySelector('.js-close-modal');
  modal.hidden = false;
  closeModalBtn.addEventListener('click', () => closeModal(modal));
}

function closeModal(modal) {
  modal.hidden = open;
}

/*function openModal(concert) {
  const modal = document.getElementById('concert-modal');
  const {
    artist_name,
    event_name,
    date,
    venue,
    city,
    country,
    img_1,
    img_2,
    img_3,
    description,
    link
  } = concert;

  document.getElementById('modal-title').textContent = artist_name + (event_name ? ` - ${event_name}` : '');
  //document.getElementById('modal-image').src = `imgs/${img_1}`;
  document.getElementById('modal-date').textContent = `Fecha: ${date ? date.toLocaleDateString() : 'No date available'}`;
  document.getElementById('modal-venue').textContent = `Lugar: ${venue}, ${city}, ${country}`;
  document.getElementById('modal-description').textContent = description || 'No description available';
  const modalLink = document.getElementById('modal-link');
  modalLink.href = link || '#';
  modalLink.style.display = link ? 'inline' : 'none';

  modal.hidden = false;
  modal.querySelector('.close-btn').focus();
}

document.getElementById('close-modal').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

function closeModal() {
  const modal = document.getElementById('concert-modal');
  modal.hidden = true;
}*/
