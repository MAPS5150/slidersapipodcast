// programacion del carusel dinamico
function printslides(tracks) {
    var slidetrack = '';
    tracks.forEach(function (element, index){
        console.log(index);
        
            slidetrack = slidetrack + `
            
                    <div class=" cardCarrusel">
                        <div class="contImg"><img class="imgPodcast" src="${element.track.album.images[0].url}" alt=""></div>
                        <div class="contTexto">
                            <div>
                                <p id="artist">
                                        ${element.track.artists[0].name}
                                    </p>
                                    <p id="track" >
                                        ${element.track.name}
                                    </p>
                                <a href="${element.track.external_urls.spotify}" target="_blank">
                                <img style="width: 20px; height: 30px;" src="play-outline.svg" alt="">
                                </a>
                            </div>
                            
                        </div>
                    </div> `

                    
        
        
        document.getElementById('slidescarrusel').innerHTML = slidetrack;
        const carrusel = document.querySelector(".carrusel"),
            firstImg = carrusel.querySelectorAll(".cardCarrusel")[0],
            arrowIcons = document.querySelectorAll(".contCasrrusel i");
        const showHideIcons = () => {
            let scrollWidth = carrusel.scrollWidth - carrusel.clientWidth;
            arrowIcons[0].style.display = carrusel.scrollLeft == 0 ? "none" : "block";
            arrowIcons[1].style.display = carrusel.scrollLeft == scrollWidth ? "none" : "block";
        }
        arrowIcons.forEach(icon => {
            icon.addEventListener("click", () => {
                let firstImgWidth = firstImg.clientWidth + 14;
                carrusel.scrollLeft += icon.id == "left" ? -firstImgWidth : firstImgWidth;
                setTimeout(() => showHideIcons(), 60);
            });
        });
    });
    
}

// programacion API Spotify
const APIController = (function() {
    
    const clientId = 'c695b8740ba94cc6b627c5beb47c459e';
    const clientSecret = '326802405c264347a40b73aff2057992';

    // metodos privados
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }
    
    const _getGenres = async (token) => {

        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_MX`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreId) => {

        const limit = 6;
        
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {

        const limit = 6;

        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    const _getTrack = async (token, trackEndPoint) => {

        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    }
})();


// Modulo UI
const UIController = (function() {

    //objeto que mantiene las referencias al selector html
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSonglist: '.song-list'
    }

    //metodos publicos
    return {

        //metodo para obtener los campos de entrada
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },

        // metodos para crear la lista de opcion de seleccion
        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        }, 

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        // metodo para crear una lista de tracks
        createTrack(id, name) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

        // metodo para crear los detalles de la cancion seleccionada
        createTrackDetail(img, title, artist) {

            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            // cada que se de click a una nueva cancion limpiamos los detalles de esta(actualizacion)
            detailDiv.innerHTML = '';

            const html = 
            `
            <div class="row col-sm-12 px-0">
                <img src="${img}" alt="">        
            </div>
            <div class="row col-sm-12 px-0">
                <label for="Genre" class="form-label col-sm-12">${title}:</label>
            </div>
            <div class="row col-sm-12 px-0">
                <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
            </div> 
            `;

            detailDiv.insertAdjacentHTML('beforeend', html)
        },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },
        
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    // obtenemos la entrada de los campos del objeto ref
    const DOMInputs = UICtrl.inputField();

    // obtenemos los generos en la pagina load
    const loadGenres = async () => {
        // obtenemos el token
        const token = await APICtrl.getToken();           
        //guardamos el token de la pagina
        UICtrl.storeToken(token);
        //obtenemos los generos
        const genres = await APICtrl.getGenres(token);
        // llenamos nuestro elemento de selección de géneros
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

    // crear un detector de eventos de cambio de género
    DOMInputs.genre.addEventListener('change', async () => {
        // reiniciamos/actualizamos el playlist
        UICtrl.resetPlaylist();
        // obtener el token que está almacenado en la página
        const token = UICtrl.getStoredToken().token;        
        // obtener el genero del campo seleccionado
        const genreSelect = UICtrl.inputField().genre;       
        // obtener el ID asociado con el género seleccionado
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;             
        // obtener la lista de reproducción basada en un género
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
        console.log(playlist);    
        // crear un elemento de lista de reproducción para cada lista de reproducción devuelta
        playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
        
    });
     

    // crear el botón de envío y hacer clic en el detector de eventos
    DOMInputs.submit.addEventListener('click', async (e) => {
        // prevenimos el reseteo de la pagina
        e.preventDefault();
        // limpiamos tracks
        UICtrl.resetTracks();
        // guardamos el token
        const token = UICtrl.getStoredToken().token;        
        // obtener el campo de la lista de reproducción
        const playlistSelect = UICtrl.inputField().playlist;
        // obtener el punto final de la pista en función de la lista de reproducción seleccionada
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        // obtener la lista de pistas
        const tracks = await APICtrl.getTracks(token, tracksEndPoint);
        console.log(tracks);
        printslides(tracks);
        // crear un elemento de la lista de pistas
        tracks.forEach(el => UICtrl.createTrack(el.track.href, el.track.name));
        
    });

    // crear una selección de canciones al hacer clic en un detector de eventos
    DOMInputs.tracks.addEventListener('click', async (e) => {
        // prevenimos el reseteo de la pagina
        e.preventDefault();
        UICtrl.resetTrackDetail();
        // obtenemos el token
        const token = UICtrl.getStoredToken().token;
        // obtenemos el punto final de la cancion
        const trackEndpoint = e.target.id;
        // obtenemos el objeto de la cancion
        const track = await APICtrl.getTrack(token, trackEndpoint);
        // cargamos los detalles de la cancion
        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);
    });    

    return {
        init() {
            console.log('App is starting');
            loadGenres();
        }
    }

})(UIController, APIController);

// llamamos a un método para cargar los géneros en la carga de la página
APPController.init();