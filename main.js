const CSV_FILE = 'concerts_20250907.csv';

let concertsData = [];
let previouslyFocused = null;

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

function initializeSelects() {
  const sortSelect = document.getElementById('sort-select');
  const orderSelect = document.getElementById('order-select');
  sortSelect.value = 'date';
  orderSelect.value = 'desc';
  sortData('date', 'desc');
}

function getData() {
  fetch(`./data/${CSV_FILE}`)
    .then(response => response.text())
    .then(csv => {
      concertsData = csvToJson(csv);
      concertsData.forEach(concert => {
        concert.date = parseDate(concert.date);
      });
      initializeSelects();
      renderConcertsGrid(concertsData);
      document.getElementById('sort-select').disabled = false;
      document.getElementById('order-select').disabled = false;
      populateArtistSelect();
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
  renderConcertsGrid(concertsData);
}

document.getElementById('sort-select').addEventListener('change', sortDataBy);
document.getElementById('order-select').addEventListener('change',sortDataBy);

function sortDataBy() {
  const sortKey = document.getElementById('sort-select').value;
  const order = document.getElementById('order-select').value;
  resetAll();

  if (sortKey && order) {
    sortData(sortKey, order);
  }
}

document.getElementById('artist-select').addEventListener('change', () => {
  const selectedArtist = document.getElementById('artist-select').value;
  if (selectedArtist === 'all') {
    renderConcertsGrid(concertsData);
  } else {
    const filteredConcerts = concertsData.filter(concert => concert.artist_name === selectedArtist);
    renderConcertsGrid(filteredConcerts);
  }
});

function resetAll() {
  document.getElementById('artist-select').value = 'all';
}

function renderConcertsGrid(concerts) {
  const concertGrid = document.getElementById('concert-grid');
  concertGrid.innerHTML = '';

  concerts.forEach((concert, idx) => {
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

function populateArtistSelect() {
  const artistSelect = document.getElementById('artist-select');
  const artists = [...new Set(concertsData.map(concert => concert.artist_name))];

  artists.sort((a, b) => a.localeCompare(b));
  artistSelect.innerHTML = '<option value="all">All</option>';
  artists.forEach(artist => {
    const option = document.createElement('option');
    option.value = artist;
    option.textContent = artist;
    artistSelect.appendChild(option);
  });
  artistSelect.disabled = false;
}


// Modal
function openModal(concert) {
  const modal = document.querySelector('.js-modal');
  const modalTitle = modal.querySelector('h2');
  const modalEvent = modal.querySelector('h3');
  const modalDate = modal.querySelector('.date');
  const modalVenue = modal.querySelector('.venue');
  const modalLocation = modal.querySelector('.location');
  const modalLink = modal.querySelector('.event-link');
  const carouselContainer = modal.querySelector('.carousel__container');

  modalTitle.textContent = concert.artist_name;
  modalEvent.textContent = concert.event_name || '';
  modalEvent.classList.toggle('hidden', concert.event_name === '');
  modalDate.textContent = concert.date ? concert.date.toLocaleDateString() : 'No date available';
  modalVenue.textContent = `${concert.venue},` || '';
  modalVenue.classList.toggle('hidden', concert.venue === '');
  modalLocation.textContent = `${concert.city}, ${concert.country}`;

  if (concert.link) {
    modalLink.href = concert.link;
    modalLink.style.display = 'inline-block';
  } else {
    modalLink.style.display = 'none';
  }

  // Setup carousel
  const images = [concert.img_1, concert.img_2, concert.img_3].filter(Boolean);
  let currentImageIndex = 0;

  const updateCarousel = () => {
    if (images.length === 0) {
      carouselContainer.innerHTML = '<div class="carousel__no-image">image not available</div>';
    } else {
      carouselContainer.innerHTML = `<img src="imgs/${images[currentImageIndex]}" alt="${concert.artist_name}" onclick="window.open('imgs/${images[currentImageIndex]}', '_blank')">`;
    }
  };

  const prevButton = modal.querySelector('.carousel__prev');
  const nextButton = modal.querySelector('.carousel__next');

  prevButton.style.display = images.length > 1 ? 'block' : 'none';
  nextButton.style.display = images.length > 1 ? 'block' : 'none';

  prevButton.onclick = () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateCarousel();
  };

  nextButton.onclick = () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateCarousel();
  };

  updateCarousel();
  modal.hidden = false;
  previouslyFocused = document.activeElement;
  modal.querySelector('.modal__content').focus();
  createCloseModalListener();
}

function createCloseModalListener() {
  const closeModalBtn = document.querySelector('.js-close-modal');
  document.addEventListener('keydown', handleEscape);
  closeModalBtn.addEventListener('click', closeModal);
}

function removeCloseModalListener() {
  const closeModalBtn = document.querySelector('.js-close-modal');
  document.removeEventListener('keydown', handleEscape);
  closeModalBtn.removeEventListener('click', closeModal);
}

function closeModal() {
  const modal = document.querySelector('.js-modal');
  modal.hidden = true;

  if (previouslyFocused) {
    previouslyFocused.focus();
  }
  removeCloseModalListener();
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  getData();
});
