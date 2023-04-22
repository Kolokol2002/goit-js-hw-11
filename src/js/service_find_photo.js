import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35607218-be1597ef8954b4d0df325c6b7';

async function searchPhoto(target) {
  const params = new URLSearchParams({
    key: API_KEY,
    q: target.text,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: target.page,
    per_page: target.per_page,
  });

  const URL = `${BASE_URL}?${params}`;
  return axios.get(URL, params).then(respose => respose);
}

export default searchPhoto;
