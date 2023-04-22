import searchPhoto from './js/service_find_photo';
import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  galleryEl: document.querySelector('.gallery'),
  formEl: document.querySelector('.search-form'),
  guardEl: document.querySelector('.guard'),
};

refs.formEl.addEventListener('submit', onSend);

const target = {
  text: '',
  page: 1,
  per_page: 40,
};

let totalHits = 0;
let countPerPage = 0;

const options = {
  rootMargin: '800px',
};
const observerScroll = new IntersectionObserver(onScroll, options);

async function onSend(e) {
  e.preventDefault();
  target.page = 1;
  target.text = e.target.children.searchQuery.value;

  await searchPhoto(target).then(data => {
    const response = data.data;
    totalHits = response.totalHits;

    if (totalHits >= target.per_page) {
      observerScroll.observe(refs.guardEl);
      countPerPage += target.per_page;
    }

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    if (response.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    refs.galleryEl.innerHTML = createMarkup([...response.hits]);
  });
}

function createMarkup(arr) {
  const cardMarkup = arr
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

  const lightbox = new SimpleLightbox('.gallery a');
  return cardMarkup;
}

function onScroll(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      countPerPage += target.per_page;

      await searchPhoto(target)
        .then(data => {
          if (countPerPage >= totalHits) {
            observerScroll.unobserve(refs.guardEl);
          }

          refs.galleryEl.insertAdjacentHTML(
            'beforeend',
            createMarkup([...data.data.hits])
          );

          target.page += 1;
        })
        .catch(err => {
          return;
        });
    }
  });
}
