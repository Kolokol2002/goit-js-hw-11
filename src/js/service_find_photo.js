const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35607218-be1597ef8954b4d0df325c6b7';

async function searchPhoto(text) {
  const params = new URLSearchParams({
    key: API_KEY,
    q: text,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: 1,
    per_page: 40,
  });

  const URL = `${BASE_URL}?${params}`;

  return fetch(URL)
    .then(respose => {
      if (!respose.ok) {
        throw new Error(respose.message);
      }
      return respose.json();
    })
    .then(data => data)
    .catch(err => err);
}

export default searchPhoto;
