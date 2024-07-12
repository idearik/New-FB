async function vote(index, action) {
    try {
      const response = await fetch('/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ index, action })
      });
  
      const result = await response.json();
  
      if (result.success) {
        location.reload();
      } else {
        alert('Error voting');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error voting');
    }
  }
  
  function sortPlaces() {
    const area = document.getElementById('area-sort').value;
    const cards = document.querySelectorAll('.card');
  
    cards.forEach(card => {
      if (area === 'all' || card.dataset.area === area) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
  