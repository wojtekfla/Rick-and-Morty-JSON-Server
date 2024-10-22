
const baseLocalUrl = "http://localhost:3000/results"
let localUrl = "http://localhost:3000/results"
const itemLimit = 5
let currentPage = 1
let totalPages = 0
let characterName = ''
let currentStatus = "Alive"
let totalCharacters 

const container = document.querySelector('#container')
const nextPageBtn = document.querySelector('#arrow-right')
nextPageBtn.addEventListener('click', (e) => nextPage(e, localUrl))
const prevPageBtn = document.querySelector('#arrow-left')
prevPageBtn.addEventListener('click', (e) => prevPage(e, localUrl))
const nameInput = document.querySelector('#filter')
nameInput.addEventListener('input', filterByName)
const radioInput = document.querySelector('#radio')
const radioInputStatus = radioInput.querySelectorAll('[type="radio"]')
radioInputStatus.forEach( element => element.addEventListener('click', filterByStatus))
const createCharacterForm = document.querySelector("#form")
createCharacterForm.addEventListener('submit', (e)=> createCharacter(e))

document.addEventListener('DOMContentLoaded', () => init())

function init () {
  fetchCharacters()
}

const fetchCharacters = async function () {
  fetchAllCharacters()

  let localUrl = `${baseLocalUrl}?_page=${currentPage}&_limit=${itemLimit}&name_like=${characterName}&status=${currentStatus}`

  try {
    const res = await fetch(localUrl)
    const data = await res.json()
    if (totalCharacters === 0) {
      return printAlert()
    } else {
      createCharacterEl(data,container)
      paginationControl()
    }
    
  } catch (error) {
    console.error("Error", error)
  }
}

async function fetchAllCharacters () {
  try {
   const res = await fetch(`${baseLocalUrl}?&name_like=${characterName}&status=${currentStatus}`)
   const data = await res.json()
   totalPages = Math.ceil(data.length / itemLimit)
   if (data.length === 0) {
     totalCharacters = 0 
   } else totalCharacters = data.length
   resetButtons()
   paginationControl()
 
  } catch (error) {
   console.log(error)
  }
  return totalPages
 }

 const createCharacterEl = (characters, ulEl=container) => {
	if (ulEl) {
		ulEl.innerHTML = "";
	} else {
		ulEl = document.createElement("ul");
	}

	characters.forEach((character) => {
		const liEl = document.createElement("li");
    liEl.setAttribute('data-id', `${character.id}`)
		const imageContainer = document.createElement("div");
		const imageEl = document.createElement("img");
		imageEl.src = character.image;
		imageContainer.append(imageEl);

		const divWrapper = document.createElement("div");
		divWrapper.classList.add("wrapper")

		const nameEl = document.createElement("div");
		nameEl.classList.add("character__name");
		nameEl.innerText = character.name;
		const speciesEl = document.createElement("div");
		speciesEl.classList.add("character__species");
		speciesEl.innerText = `gatunek: ${character.species}`;
		const statusEl = document.createElement("div");
		statusEl.classList.add("character__status");
		statusEl.innerText = `status: ${character.status}`;

		divWrapper.append(nameEl)
		divWrapper.append(statusEl)
    divWrapper.append(speciesEl)
		liEl.append(imageContainer);
		liEl.append(divWrapper);

    const delBtn = createDeleteBtn()
    liEl.append(delBtn)

		ulEl.append(liEl);
	});
	return ulEl;
};

function createDeleteBtn () {
  const deleteBtn = document.createElement('button')
  deleteBtn.id = "deleteCharacter"
  deleteBtn.classList.add('delete-character')
  deleteBtn.innerText = "Usuń postać"
  deleteBtn.addEventListener("click", (e)=> {
    e.preventDefault()
    const liEl = e.target.closest('li')
    const liId = liEl.dataset.id
    deleteCharacter(liId)
  })
  return(deleteBtn)
}

function paginationControl () {
  nextPageBtn.disabled = currentPage >= totalPages ? true : false
  prevPageBtn.disabled = currentPage <= 1 ? true : false
}

function resetButtons () {
  nextPageBtn.disabled = false
  prevPageBtn.disabled = false
}

async function nextPage(e, localUrl) {
  e.preventDefault()
  currentPage ++
  localUrl = `${localUrl}?_page=${currentPage}&_limit=${itemLimit}`

  try {
   const res = await fetch(`${localUrl}`) 
   const data = await res.json()
   updateCharacters(currentPage)

  } catch (err) {
    console.log('Error', err)
  }
}

function prevPage(e) {
  e.preventDefault()
  currentPage--
  updateCharacters(currentPage)
}

async function updateCharacters () {
  fetchAllCharacters()
  
  let url = `${baseLocalUrl}?_page=${currentPage}&_limit=${itemLimit}&name_like=${characterName}&status=${currentStatus}`

  try {
    const res = await fetch (url)
    const data = await res.json()
    createCharacterEl(data)
    updatePage(currentPage)
    paginationControl()
    return(localUrl)
    
  } catch(error) {
    console.log("Error", error)
  }
}

function updatePage (pageToUpdate) {
  return pageToUpdate++
}

function filterByStatus (radio) {
  currentStatus = radio.target.value
  currentPage = 1
  fetchCharacters()
  paginationControl()
  if (totalCharacters === 0) {
    printAlert()
  }
}

function filterByName () {
    characterName = nameInput.value
    currentPage = 1
    fetchCharacters()
    paginationControl()   
}

async function deleteCharacter (id) {
  let url = `${baseLocalUrl}/${id}`
  console.log(url)
  await fetch(`${baseLocalUrl}/${id}`, {
    method: 'DELETE',   
  }) 
  updateCharacters()
}

async function createCharacter (e) {
  e.preventDefault()
  console.log(e)
  const form = e.target.closest('#form')
  const name = form.querySelector('#name-newChar').value
  const status = form.querySelector('#status-newChar').value
  const species = form.querySelector('#species-newChar').value
  const image = "https://rickandmortyapi.com/api/character/avatar/361.jpeg"

  const character = { name, status, species, image }
  
  await fetch(`${baseLocalUrl}`, {
    method: "POST",
    body: JSON.stringify( character ),
    headers: {'Content-Type': 'application/json'}
  })

  fetchCharacters()
}

function printAlert () {
  const messageEl = document.createElement('p')
  messageEl.classList.add('message-error')
  messageEl.innerText = "Nie znaleziono postaci spełniających kryteria wyszukiwania"
  container.innerHTML = ''
  container.append(messageEl)
}
