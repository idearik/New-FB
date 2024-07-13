// Function to sort places by area
function sortPlaces() {
    const area = document.getElementById('area-sort').value;
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      if (area === 'all' || card.getAttribute('data-area') === area) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  // Function to search places by name
  function searchPlaces() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const name = card.getAttribute('data-name').toLowerCase();
      if (name.includes(query)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  // Function to handle voting
  function vote(index, type) {
    fetch(`/vote/${index}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const card = document.querySelector(`.card[data-index='${index}']`);
        const voteCount = card.querySelector('.vote-count');
        voteCount.textContent = `Votes: ${data.votes}`;
      }
    })
    .catch(error => console.error('Error:', error));
  }
  