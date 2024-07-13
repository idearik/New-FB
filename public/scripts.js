let currentIndex = 5; // Initial number of cards to show

// Function to show initial set of cards
function showInitialCards() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    if (index < currentIndex) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Function to load more cards
function loadMore() {
  const cards = document.querySelectorAll('.card');
  for (let i = currentIndex; i < currentIndex + 5 && i < cards.length; i++) {
    cards[i].style.display = 'block';
  }
  currentIndex += 5;
  if (currentIndex >= cards.length) {
    document.getElementById('load-more').style.display = 'none';
  }
}

// Function to sort places by area
function sortPlaces() {
  const area = document.getElementById('area-sort').value;
  const cards = document.querySelectorAll('.card');
  let count = 0;
  cards.forEach(card => {
    if (area === 'all' || card.getAttribute('data-area') === area) {
      card.style.display = 'block';
      if (count < currentIndex) {
        card.style.display = 'block';
        count++;
      } else {
        card.style.display = 'none';
      }
    } else {
      card.style.display = 'none';
    }
  });
  if (count < currentIndex) {
    document.getElementById('load-more').style.display = 'none';
  } else {
    document.getElementById('load-more').style.display = 'block';
  }
}

// Function to search places by name
function searchPlaces() {
  const query = document.getElementById('search-bar').value.toLowerCase();
  const cards = document.querySelectorAll('.card');
  let count = 0;
  cards.forEach(card => {
    const name = card.getAttribute('data-name').toLowerCase();
    if (name.includes(query)) {
      if (count < currentIndex) {
        card.style.display = 'block';
        count++;
      } else {
        card.style.display = 'none';
      }
    } else {
      card.style.display = 'none';
    }
  });
  if (count < currentIndex) {
    document.getElementById('load-more').style.display = 'none';
  } else {
    document.getElementById('load-more').style.display = 'block';
  }
}

// Function to handle voting
function vote(index, type) {
  fetch('/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ index, action: type })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const card = document.querySelector(`.card[data-index='${index}']`);
      const voteCount = card.querySelector('.vote-count');
      voteCount.textContent = `Votes: ${data.votes}`;
    } else {
      console.error('Failed to update votes:', data.message);
    }
  })
  .catch(error => console.error('Error:', error));
}

// Initial call to show the first set of cards
document.addEventListener('DOMContentLoaded', () => {
  showInitialCards();
});
