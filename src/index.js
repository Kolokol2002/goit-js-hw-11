import searchPhoto from './js/service_find_photo';
import searchTerms from './js/array_start';
import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  galleryEl: document.querySelector('.gallery'),
  formEl: document.querySelector('.search-form'),
  guardEl: document.querySelector('.guard'),
  loaderEl: document.querySelector('.loader'),
};

refs.formEl.addEventListener('submit', onSend);

const randomText = Math.floor(Math.random() * 100);

const body = {
  text: searchTerms[randomText],
  page: 1,
  per_page: 40,
};

start(body);

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
  const value = e.target.children.searchQuery.value;
  if (!value) {
    Notiflix.Notify.failure('You have not entered anything!!!');
    return;
  }
  body.text = value;
  body.page = 1;
  countPerPage = body.per_page;
  observerScroll.unobserve(refs.guardEl);
  refs.loaderEl.classList.toggle('disable');
  refs.galleryEl.innerHTML = '';

  await searchPhoto(body)
    .then(data => {
      const response = data.data;

      if (response.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        refs.galleryEl.innerHTML = '';
        return;
      }

      if (response.totalHits >= body.per_page) {
        observerScroll.observe(refs.guardEl);
      }

      refs.galleryEl.innerHTML = createMarkup([...response.hits]);
      lightbox.refresh();
      Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
    })
    .finally(() => {
      refs.loaderEl.classList.toggle('disable');
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
        <img class="img-card" data-lagre-url="${
          largeImageURL
            ? largeImageURL
            : 'https://img.freepik.com/premium-vector/error-404-page-found-vector-concept-icon-internet-website-down-simple-flat-design_570429-4168.jpg'
        }" src="${
        webformatURL
          ? webformatURL
          : 'https://img.freepik.com/premium-vector/error-404-page-found-vector-concept-icon-internet-website-down-simple-flat-design_570429-4168.jpg'
      }" alt="${tags}" loading="lazy" />
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

async function start(body) {
  refs.loaderEl.classList.toggle('disable');
  await searchPhoto(body)
    .then(data => {
      const response = data.data;

      if (response.totalHits >= body.per_page) {
        observerScroll.observe(refs.guardEl);
      }

      refs.galleryEl.innerHTML = createMarkup([...response.hits]);
      lightbox.refresh();
    })
    .finally(() => {
      refs.loaderEl.classList.toggle('disable');
    });
}
