import searchPhoto from './js/service_find_photo';
import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  galleryEl: document.querySelector('.gallery'),
  formEl: document.querySelector('.search-form'),
};

refs.formEl.addEventListener('submit', onSend);

async function onSend(e) {
  e.preventDefault();
  const target = e.target.children.searchQuery;
  const resp = await searchPhoto(target.value).then(data => {
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    return [...data.hits];
  });

  if (resp.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  const cardMarkup = resp
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
    <div class="photo-card">
        <a href="${largeImageURL}"><img class="img-card" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
        <div class="info">
            <p class="info-item">
                <span>Likes</span>
                <b>${likes}</b>
            </p>
            <p class="info-item">
                <span>Views</span>
                <b>${views}</b>
            </p>
            <p class="info-item">
                <span>Comments</span>
                <b>${comments}</b>
            </p>
            <p class="info-item">
                <span>Downloads</span>
                <b>${downloads}</b>
            </p>
        </div>
    </div>
    `
    )
    .join('');
  refs.galleryEl.innerHTML = cardMarkup;
  const lightbox = new SimpleLightbox('.gallery a');
}
