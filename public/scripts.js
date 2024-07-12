document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.button-upvote, .button-downvote').forEach(button => {
      button.addEventListener('click', async (e) => {
        const index = e.target.getAttribute('data-index');
        const action = e.target.classList.contains('button-upvote') ? 'upvote' : 'downvote';
        
        const response = await fetch('/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index, action })
        });
        
        if (response.ok) {
          window.location.reload();
        } else {
          alert('Error updating votes');
        }
      });
    });
  
    const areaSortSelect = document.getElementById('area-sort');
    areaSortSelect.addEventListener('change', (e) => {
      const selectedArea = e.target.value.toLowerCase();
      document.querySelectorAll('.card').forEach(card => {
        const cardArea = card.getAttribute('data-area').toLowerCase();
        if (selectedArea === '' || cardArea === selectedArea) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
  