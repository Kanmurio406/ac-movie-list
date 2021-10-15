// vars: api links 
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const IMAGE_URL = BASE_URL + '/posters/'

// vars: dataPanel display
const dataPanel = document.querySelector('#data-panel')

// vars: search 
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
let filteredMovies = []

// vars: paginator
const paginator = document.querySelector('#paginator')
const MOVIES_PER_PAGE = 12
let currentPage = 1

// vars: render mode switch
const renderModeSwitcher = document.querySelector('#display-switcher')

const renderCardMode = function (currentPageMovies) {
  let rawHTML = ''
  currentPageMovies.forEach(item => {
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
            ${favFunctionButtonHTML(item.id)}          
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

const renderRowMode = function (currentPageMovies) {
  let rawHTML = ''
  currentPageMovies.forEach(item => {
    rawHTML += `
    <div class="row w-100 mt-3 border-top">
      <div class="col-sm-8 p-2">
        <p>${item.title}</p>
      </div>
      <div class="col-sm-4 p-2">
        <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
        ${favFunctionButtonHTML(item.id)}
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

const renderMode = [renderRowMode, renderCardMode]

// global execute
// first time render movie after page loading
const movies = []
axios
  .get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    if (!getRenderModeIndex()) { setRenderModeIndex(2) }
    changeModeBtnStatus()
    pagesDisplay(movies.length)
    renderMovieList(getPageMovies(currentPage))
  })
  .catch(error => console.log(error))

// function: render movie in dataPanel
function renderMovieList(displayMovies) {
  renderMode[getRenderModeIndex() - 1](displayMovies)
}

// render mode switch
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

// eventListener: click switch mode buttons
renderModeSwitcher.addEventListener('click', event => {
  event.preventDefault()
  if (!event.target.dataset.index) return
  const newModeIndex = Number(event.target.dataset.index)
  setRenderModeIndex(newModeIndex)
  renderMovieList(getPageMovies(currentPage))
  changeModeBtnStatus()
})

// modal
// function: show modal
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

// favorite movies
// function: add favorite movie
function addFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('Already in favorite lists!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// function: remove favorite movie
function removeFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies'))
  const movieIndex = list.findIndex((movie) => movie.id === id)
  list.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// function: get add or remove fav movies btn HTML
function favFunctionButtonHTML(id) { //set add or remove fav btn according to localStorage favMovies
  const favMovies = JSON.parse(localStorage.getItem('favoriteMovies'))
  let btnHTML = ''
  if (!favMovies) {
    btnHTML = `<button type="button" class="btn btn-info btn-add-favorite" data-id="${id}">+</button>`
  } else if (!favMovies.some(movie => movie.id === id)) {
    btnHTML = `<button type="button" class="btn btn-info btn-add-favorite" data-id="${id}">+</button>`
  } else {
    btnHTML = `<button type="button" class="btn btn-danger btn-remove-favorite" data-id="${id}">x</button>`
  }
  return btnHTML
}

// eventListener: click movie modal & add/remove favorite
dataPanel.addEventListener('click', function onPanelClicked(event) {
  const id = event.target.dataset.id
  const parent = event.target.parentElement
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addFavorite(Number(id))
    parent.removeChild(parent.lastElementChild)
    parent.innerHTML += favFunctionButtonHTML(Number(id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(id))
    parent.removeChild(parent.lastElementChild)
    parent.innerHTML += favFunctionButtonHTML(Number(id))
  }
})

// page 
// function: pagination button display
function pagesDisplay(NumberOfmovies) {
  const numberOfPage = Math.ceil(NumberOfmovies / MOVIES_PER_PAGE)
  paginator.innerHTML = ''
  for (let page = 1; page < numberOfPage + 1; page++) {
    paginator.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
}

// function: page button highlight
function currentPageBtnHighlight(event) {
  const pageBtns = paginator.children
  for (let i = 0; i < pageBtns.length; i++) { // clear the previous active page
    pageBtns[i].classList.remove('active')
  }
  event.target.parentElement.classList.add('active') // add the new active page
}

// function: get page movie
function getPageMovies(thisPage) {
  const data = filteredMovies.length ? filteredMovies : movies
  let thisPageMovies = []
  const startIndex = MOVIES_PER_PAGE * (thisPage - 1)
  thisPageMovies = data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
  return thisPageMovies
}

// eventListener: click paginator
paginator.addEventListener('click', event => {
  if (!event.target.dataset.page) return
  currentPageBtnHighlight(event)
  let clickPage = Number(event.target.dataset.page)
  renderMovieList(getPageMovies(clickPage))
  currentPage = clickPage
})

// keyword search
// eventListener: submit search form
searchForm.addEventListener('submit', function OnSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  // if (!keyword.length) {
  //   return alert('Invalid Input')
  // }
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  if (!filteredMovies.length) {
    dataPanel.textContent = "Sorry! Cannot find movie with keyword: " + keyword
  } else {
    pagesDisplay(filteredMovies.length)
    renderMovieList(getPageMovies(1))
  }
})