const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const IMAGE_URL = BASE_URL + '/posters/'
const dataPanel = document.querySelector('#data-panel')
const renderModeSwitcher = document.querySelector('#display-switcher')

// variables: display mode functions
const renderCardMode = function (data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
        <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${IMAGE_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

const renderRowMode = function (data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
    <div class="row w-100 mt-3 border-top">
      <div class="col-sm-8 p-2">
        <p>${item.title}</p>
      </div>
      <div class="col-sm-4 p-2">
        <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// variables: mode functions array
const renderMode = [renderRowMode, renderCardMode]

// global execute
// render movie, display mode status 
let favMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
renderMovieList(favMovies)
changeModeBtnStatus()

// eventListener: dataPanel control center
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(event.target.dataset.id))
  }
})

// function: render movie
function renderMovieList(data) {
  renderMode[getRenderModeIndex() - 1](data)
}

// switch display mode
// function: set and get current mode index
function setRenderModeIndex(currentIndex) {
  localStorage.setItem('renderModeIndex', currentIndex)
}

function getRenderModeIndex() {
  const currentIndex = Number(localStorage.getItem('renderModeIndex'))
  return currentIndex
}

// function: switch render mode btn display status
function changeModeBtnStatus() {
  const switchBtns = renderModeSwitcher.children
  for (let i = 0; i < switchBtns.length; i++) {
    const btn = switchBtns[i].firstChild
    if (Number(btn.dataset.index) === getRenderModeIndex()) {
      btn.parentElement.classList.remove('badge-light')
      btn.parentElement.classList.add('badge-primary')
    } else {
      btn.parentElement.classList.remove('badge-primary')
      btn.parentElement.classList.add('badge-light')
    }
  }
}

// eventListener: switch render mode
renderModeSwitcher.addEventListener('click', event => {
  event.preventDefault()
  if (!event.target.dataset.index) return
  const newModeIndex = Number(event.target.dataset.index)
  setRenderModeIndex(newModeIndex)
  renderMovieList(favMovies)
  changeModeBtnStatus()
})

// function: switch render mode btn display status
function changeModeBtnStatus() {
  const switchBtns = renderModeSwitcher.children
  for (let i = 0; i < switchBtns.length; i++) {
    const btn = switchBtns[i].firstChild
    if (Number(btn.dataset.index) === getRenderModeIndex()) {
      btn.parentElement.classList.remove('badge-light')
      btn.parentElement.classList.add('badge-primary')
    } else {
      btn.parentElement.classList.remove('badge-primary')
      btn.parentElement.classList.add('badge-light')
    }
  }
}

// movie modal
// function: show movie modal
function showMovieModal(id) {
  const title = document.querySelector('#movie-modal-title')
  const releaseDate = document.querySelector('#movie-modal-date')
  const description = document.querySelector('#movie-modal-description')
  const image = document.querySelector('#movie-modal-image')

  axios.get(INDEX_URL + id).then(response => {
    const results = response.data.results
    title.innerText = results.title
    releaseDate.innerText = 'Release Date: ' + results.release_date
    description.innerText = results.description
    image.innerHTML = `<img
      src="${IMAGE_URL + results.image}"
      alt="movie-poster" class="img-fluid">`
  })
}

// fav movies list
// function: remove favorite movie
function removeFavorite(id) {
  if (!favMovies) return
  //??????movies??????????????????????????????localStorage????????????favoriteMovies??????????????????????????????

  const movieIndex = favMovies.findIndex((movie) => movie.id === id)
  //???movies??????????????????id?????????????????????id???????????????????????????????????????id?????????????????????????????????????????????index??????????????????movieIndex?????????

  if (movieIndex === -1) return
  //?????????????????????movieIndex??????-1????????????movies??????????????????????????????????????????????????????

  favMovies.splice(movieIndex, 1)
  //??????splice????????????movies???????????????movieIndex???????????????????????????????????????????????????id??????????????????

  localStorage.setItem('favoriteMovies', JSON.stringify(favMovies))
  //???movies??????JSON???????????????????????????localStorage???favoriteMovies???

  renderMovieList(favMovies)
  //???movies????????????????????????renderMovieList??????movies????????????????????????????????????
}