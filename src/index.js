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

const body = {
  text: '',
  page: 1,
  per_page: 40,
};

let countPerPage = 0;

const lightbox = new SimpleLightbox('.gallery img', {
  sourceAttr: 'data-lagre-url',
});

const options = {
  rootMargin: '800px',
};

const observerScroll = new IntersectionObserver(onScroll, options);

async function onSend(e) {
  e.preventDefault();
  body.text = e.target.children.searchQuery.value;
  body.page = 1;
  countPerPage = body.per_page;
  observerScroll.unobserve(refs.guardEl);

  await searchPhoto(body).then(data => {
    const response = data.data;

    if (response.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      refs.galleryEl.innerHTML = '';
      return;
    }
    console.log('object');

    if (response.totalHits >= body.per_page) {
      observerScroll.observe(refs.guardEl);
    }

    refs.galleryEl.innerHTML = createMarkup([...response.hits]);
    lightbox.refresh();
    Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
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
        <img class="img-card" data-lagre-url="${largeImageURL}" src="${webformatURL}" alt="${tags}" loading="lazy" />
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
  return cardMarkup;
}

function onScroll(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      body.page += 1;
      await searchPhoto(body)
        .then(data => {
          const response = data.data;
          countPerPage += body.per_page;

          if (countPerPage >= response.totalHits) {
            observerScroll.unobserve(refs.guardEl);
            Notiflix.Notify.success(`The end😞`);
            return;
          }

          refs.galleryEl.insertAdjacentHTML(
            'beforeend',
            createMarkup([...response.hits])
          );
          lightbox.refresh();
        })
        .catch(err => {
          return;
        });
    }
  });
}
