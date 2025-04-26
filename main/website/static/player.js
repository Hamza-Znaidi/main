let currentPlaylistSongIndices = null;
// DOM elements
const mainContent = document.getElementById("main-content");
const sidebarItems = document.querySelectorAll(".sidebar li");

// Audio player functionality
// Music player functionality

const progress = document.getElementById("progress");
const song = document.getElementById("song");
const controlIcon = document.getElementById("controlIcon");
const playPauseButton = document.querySelector(".play-pause-btn");
const forwardButton = document.querySelector(".controls button.forward");
const backwardButton = document.querySelector(".controls button.backward");
const rotatingImage = document.getElementById("rotatingImage");
const songName = document.querySelector(".music-player h2");
const artistName = document.querySelector(".music-player p");

let rotating = false;
let currentRotation = 0;
let rotationInterval;

// Declare songs as a global variable

let songs = []; // Declare songs as a global variable

fetch('/api/songs')
  .then((res) => res.json())
  .then((data) => {
    songs = data; // Update the global songs variable
    console.log('Fetched songs:', songs); // Debugging: Log the fetched songs

    // Initialize the application only after songs are fetched
    renderHome(); // Render the home page
    updateSongInfo(); // Update the song info for the first song

// Sidebar navigation
sidebarItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Remove 'active' class from all sidebar items
    sidebarItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");

    // Get the section to render
    const section = item.dataset.section;

    // Add slide-out animation to the current main content
    mainContent.classList.add("main-slide-out");

    // Wait for the slide-out animation to complete
    setTimeout(() => {
      // Clear the current main content
      mainContent.innerHTML = "";

      // Remove the slide-out class
      mainContent.classList.remove("main-slide-out");

      // Render the new section
      if (section === "home") renderHome();
      else if (section === "search") renderSearch();
      else if (section === "library") renderLibrary();
      else if (section === "lyrics") renderSearchLyrics(); // Handle "Search by Lyrics"

      // Add slide-in animation to the new main content

      // Remove the slide-in class after the animation completes
      setTimeout(() => {
        mainContent.classList.remove("main-slide-in");
      }, 900); // Match the duration of the slide-in animation
    }, 900); // Match the duration of the slide-out animation
  });
});

  })
  .catch((err) => console.error('Error fetching songs:', err));
let playlists = []; // Declare playlists as a global variable
fetch('/api/playlists')
  .then((res) => res.json())
  .then((data) => {
    playlists = data; // Update the global songs variable
    console.log('Fetched playlists:', playlists);
    console.log(playlists[2].songlist) // Debugging: Log the fetched songs
    renderHome(); // Render the home page
  })
  .catch((err) => console.error('Error fetching playlist:', err));

let artists = []; // Declare artists as a global variable
fetch('/api/artists')
  .then((res) => res.json())
  .then((data) => {
    artists = data; // Update the global songs variable 
    renderHome(); // Render the home page
    console.log('Fetched artists:', artists); // Debugging: Log the fetched songs
  })
  .catch((err) => console.error('Error fetching artists:', err));

let currentSongIndex = 0;

function startRotation() {
  if (!rotating) {
    rotating = true;
    rotationInterval = setInterval(rotateImage, 50);
  }
}

function pauseRotation() {
  clearInterval(rotationInterval);
  rotating = false;
}

function rotateImage() {
  currentRotation += 1;
  rotatingImage.style.transform = `rotate(${currentRotation}deg)`;
}

function updateSongInfo() {
  songName.textContent = songs[currentSongIndex].title;
  artistName.textContent = songs[currentSongIndex].artist;
  song.src = songs[currentSongIndex].source;
  rotatingImage.src = songs[currentSongIndex].cover;

  song.addEventListener("loadeddata", function () {});
}

song.addEventListener("loadedmetadata", function () {
  progress.max = song.duration;
  progress.value = song.currentTime;
});

song.addEventListener("ended", function () {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
  playPause();
});

song.addEventListener("timeupdate", function () {
  if (!song.paused) {
    progress.value = song.currentTime;
  }
});

function playPause() {
  if (song.paused) {
    song.play();
    controlIcon.classList.add("fa-pause");
    controlIcon.classList.remove("fa-play");
    startRotation();
  } else {
    song.pause();
    controlIcon.classList.remove("fa-pause");
    controlIcon.classList.add("fa-play");
    pauseRotation();
  }
}

playPauseButton.addEventListener("click", playPause);

progress.addEventListener("input", function () {
  song.currentTime = progress.value;
});

progress.addEventListener("change", function () {
  song.play();
  controlIcon.classList.add("fa-pause");
  controlIcon.classList.remove("fa-play");
  startRotation();
});

forwardButton.addEventListener("click", function () {
  if (currentPlaylistSongIndices) {
    // Navigate through the current playlist
    const currentIndexInPlaylist = currentPlaylistSongIndices.indexOf(currentSongIndex);
    const nextIndexInPlaylist = (currentIndexInPlaylist + 1) % currentPlaylistSongIndices.length;
    currentSongIndex = currentPlaylistSongIndices[nextIndexInPlaylist];
  } else {
    // Navigate through all songs
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }
  updateSongInfo();
  playPause();
});

backwardButton.addEventListener("click", function () {
  if (currentPlaylistSongIndices) {
    // Navigate through the current playlist
    const currentIndexInPlaylist = currentPlaylistSongIndices.indexOf(currentSongIndex);
    const prevIndexInPlaylist = (currentIndexInPlaylist - 1 + currentPlaylistSongIndices.length) % currentPlaylistSongIndices.length;
    currentSongIndex = currentPlaylistSongIndices[prevIndexInPlaylist];
  } else {
    // Navigate through all songs
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  }
  updateSongInfo();
  playPause();
});
updateSongInfo();

// Render sections
function renderHome() {

  let likedSongIndices = []; // Array to store liked song indices
fetch('/get-liked-list')
  .then((res) => res.json())
  .then((data) => {
    likedSongIndices = data // Update the likedSongIndices array with the fetched data
    console.log('Fetched liked songs:', likedSongIndices); // Debugging: Log the fetched liked songs

function toggleLikedSong(songIndex, heartIcon) {
  const indexPosition = likedSongIndices.indexOf(songIndex);

  if (indexPosition === -1) {
    // Add the song index to the likedSongIndices array
    likedSongIndices.push(songIndex);
    heartIcon.classList.add("liked"); // Add a visual indicator
  } else {
    // Remove the song index from the likedSongIndices array
    likedSongIndices.splice(indexPosition, 1);
    heartIcon.classList.remove("liked"); // Remove the visual indicator
  }

  fetch('/liked-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      likedSongs: likedSongIndices  // 👈 Sending the array here
    }),
  })
  .then(res => res.json())
  .then(data => {
    console.log('Server response:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

  mainContent.innerHTML = `
    <h1>Featured Songs</h1>
    <div class="song-list">
      ${songs
        .slice(0, 6) // Limit to the first 6 songs
        .map(
          (song, index) => `
          <div class="song" data-index="${index}" style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <div class="song-img">
                <img src="${song.cover}" alt="${song.title} cover" />
                <div class="overlay">
                  <i class="fa-solid fa-play"></i>
                </div>
              </div>
              <div style="margin-left: 10px;">
                <h2 class="song-title">${song.title}</h2>
                <p class="song-artist">${song.artist}</p>
              </div>
            </div>
            <i class="fa-solid fa-heart heart-icon ${likedSongIndices.includes(index) ? 'liked' : ''}" data-index="${index}" style="margin-left: auto; cursor: pointer;"></i> <!-- Heart icon -->
          </div>
        `
        )
        .join("")}
    </div>
        
    <h1>Famous Artists</h1>
    <div class="artists-list">
      ${artists
        .map(
          (artist, index) => `
          <div class="artist" data-index="${index}">
            <img src="${artist.image}" alt="${artist.name}" />
            <p class="artist-name">${artist.name}</p>
          </div>
        `
        )
        .join("")}
    </div>

    <h1>Popular Playlists</h1>
    <div class="playlist-list">
      ${playlists
        .map(
          (playlist, index) => `
          <div class="playlist" data-index="${index}">
            <img src="${playlist.cover}" alt="${playlist.name}" />
            <p class="playlist-name">${playlist.name}</p>
          </div>
        `
        )
        .join("")}
    </div>
  `;

  // Add click event listeners to each song
  const songElements = document.querySelectorAll(".song");
  songElements.forEach((songElement) => {
    songElement.addEventListener("click", () => {
      // Remove 'active' class from all songs
      songElements.forEach((el) => el.classList.remove("active"));

      // Add 'active' class to the clicked song
      songElement.classList.add("active");

      // Update the current song index and play the song
      const songIndex = parseInt(songElement.dataset.index);
      currentSongIndex = songIndex;
      updateSongInfo();
      playPause();
    });
  });

  // Add click event listeners to each artist
  const artistElements = document.querySelectorAll(".artist");
  artistElements.forEach((artistElement) => {
    artistElement.addEventListener("click", () => {
      const artistIndex = parseInt(artistElement.dataset.index);
      const artist = artists[artistIndex];
      renderArtistDetails(artist); // Render the artist details page
    });
  });

  // Add click event listeners to each playlist
  const playlistElements = document.querySelectorAll(".playlist");
  playlistElements.forEach((playlistElement) => {
    playlistElement.addEventListener("click", () => {
      const playlistIndex = parseInt(playlistElement.dataset.index);
      const playlist = playlists[playlistIndex]; // Retrieve the actual playlist data
      renderPlaylistDetails(playlist); // Render the playlist details page
    });
  });
   // Add click event listeners to heart icons
   const heartIcons = document.querySelectorAll(".heart-icon");
   heartIcons.forEach((heartIcon) => {
     heartIcon.addEventListener("click", (event) => {
       event.stopPropagation(); // Prevent triggering the song click event
       const songIndex = parseInt(heartIcon.dataset.index);
       toggleLikedSong(songIndex, heartIcon);
     });
   });

  }).catch((err) => console.error('Error fetching liked songs:', err));
}

function renderSearch() {
  mainContent.innerHTML = `
    <div class="search-options">
        
      <div class="search-block" data-section="artist">

        <img src="https://celebrityaccess.com/wp-content/uploads/2021/12/BAM.png" alt="Search for an artist" class="search-image" />
        <h2>Search for an Artist</h2>
      </div>
      
      <div class="search-block" data-section="song">
        <img src="https://routenote.com/blog/wp-content/uploads/2022/02/Top-10-most-streamed-2023.jpg" alt="Search for a song" class="search-image" />
        <h2>Search for a Song</h2>
        
      </div>
      
       
      <div class="search-block" data-section="playlist">
        <img src="https://www.elicitmagazine.com/wp-content/uploads/2021/06/Spotify-Playlists-How-Do-They-Work.jpg" alt="Search for a playlist" class="search-image" />
         <h2>Search for a Playlist</h2>
      </div>

      
    </div>
  `;

  // Add click event listeners to each search block
  const searchBlocks = document.querySelectorAll(".search-block");
  searchBlocks.forEach((block) => {
    block.addEventListener("click", () => {
      const section = block.dataset.section;
      if (section === "playlist") renderSearchPlaylist();
      else if (section === "song") renderSearchSong();
      else if (section === "lyrics") renderSearchLyrics();
      else if (section === "artist") {
        renderSearchArtist();
      }
    });
  });
}

function renderLibrary() {
  // Fetch the liked song list from the backend
  fetch('/get-liked-list')
    .then((res) => res.json())
    .then((likedSongIndices) => {
      console.log('Fetched liked songs:', likedSongIndices); // Debugging: Log the liked song indices

      // Filter the liked songs from the global `songs` array
      const likedSongs = likedSongIndices.map((index) => songs[index]);

      // Fetch the favorite artists from the backend
      fetch('/get-favorite-artists')
        .then((res) => res.json())
        .then((favoriteArtistIndices) => {
          console.log('Fetched favorite artists:', favoriteArtistIndices); // Debugging: Log the favorite artist indices

          // Filter the favorite artists from the global `artists` array
          const favoriteArtists = favoriteArtistIndices.map((index) => artists[index]);

          // Fetch the favorite playlists from the backend
          fetch('/get-favorite-playlists')
            .then((res) => res.json())
            .then((favoritePlaylistIndices) => {
              console.log('Fetched favorite playlists:', favoritePlaylistIndices); // Debugging: Log the favorite playlist indices

              // Filter the favorite playlists from the global `playlists` array
              const favoritePlaylists = favoritePlaylistIndices.map((index) => playlists[index]);

              // Render the library content
              mainContent.innerHTML = `
                <h1>Your Library</h1>
                <div class="library-section">
                  <h2>Liked Songs</h2>
                  <div class="song-list">
                    ${likedSongs
                      .map(
                        (song, index) => `
                      <div class="song" data-song-index="${likedSongIndices[index]}">
                        <div class="song-img">
                          <img src="${song.cover}" alt="${song.title} cover" />
                          <div class="overlay">
                            <i class="fa-solid fa-play"></i>
                          </div>
                        </div>
                        <h2 class="song-title">${song.title}</h2>
                        <p class="song-artist">${song.artist}</p>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
                <div class="library-section">
                  <h2>Favorite Artists</h2>
                  <div class="artists-list">
                    ${favoriteArtists
                      .map(
                        (artist, index) => `
                      <div class="artist" data-index="${favoriteArtistIndices[index]}">
                        <img src="${artist.image}" alt="${artist.name}" />
                        <p class="artist-name">${artist.name}</p>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
                <div class="library-section">
                  <h2>Favorite Playlists</h2>
                  <div class="playlist-list">
                    ${favoritePlaylists
                      .map(
                        (playlist, index) => `
                      <div class="playlist" data-index="${favoritePlaylistIndices[index]}">
                        <img src="${playlist.cover}" alt="${playlist.name}" />
                        <p class="playlist-name">${playlist.name}</p>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              `;

              // Add click event listeners to liked songs
              const likedSongElements = document.querySelectorAll(".song");
              likedSongElements.forEach((songElement) => {
                songElement.addEventListener("click", () => {
                  const songIndex = parseInt(songElement.dataset.songIndex); // Use the correct index from the `songs` array
                  currentSongIndex = songIndex;
                  updateSongInfo(); // Update the music player with the selected song
                  playPause(); // Start playing the song
                });
              });

              // Add click event listeners to favorite artists
              const artistElements = document.querySelectorAll(".artist");
              artistElements.forEach((artistElement) => {
                artistElement.addEventListener("click", () => {
                  const artistIndex = parseInt(artistElement.dataset.index);
                  const artist = artists[artistIndex];
                  renderArtistDetails(artist); // Render the artist details page
                });
              });

              // Add click event listeners to favorite playlists
              const playlistElements = document.querySelectorAll(".playlist");
              playlistElements.forEach((playlistElement) => {
                playlistElement.addEventListener("click", () => {
                  const playlistIndex = parseInt(playlistElement.dataset.index);
                  const playlist = playlists[playlistIndex];
                  renderPlaylistDetails(playlist); // Render the playlist details page
                });
              });
            })
            .catch((err) => console.error('Error fetching favorite playlists:', err));
        })
        .catch((err) => console.error('Error fetching favorite artists:', err));
    })
    .catch((err) => console.error('Error fetching liked songs:', err));
}

function renderArtistDetails(artist) {
  let favorite_Artists = []; // Array to store favorite artist indices
  fetch('/get-favorite-artists')
    .then((res) => res.json())
    .then((data) => {
      favorite_Artists = data; // Update the favorite_Artists array with the fetched data
      console.log('Fetched favorite artists:', favorite_Artists); // Debugging: Log the fetched favorite artists

      const artistIndex = artists.indexOf(artist); // Get the index of the artist
      function toggleFavoriteArtist(artistIndex, button) {
        const indexPosition = favorite_Artists.indexOf(artistIndex);

        if (indexPosition === -1) {
          // Add the artist index to the favoriteArtists array
          favorite_Artists.push(artistIndex);
          button.innerHTML = `<i class="fa-solid fa-check"></i> Favorited`; // Update button to show "Favorited"
        } else {
          // Remove the artist index from the favoriteArtists array
          favorite_Artists.splice(indexPosition, 1);
          button.innerHTML = `<i class="fa-solid fa-plus"></i> Add to Favorite`; // Update button to show "Add to Favorite"
        }

        console.log('Favorite Artists:', favorite_Artists); // Debugging: Log the favorite artist indices

        fetch('/favorite-artists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            favoriteArtists: favorite_Artists, // 👈 Sending the array here
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('Server response:', data);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }

      let likedSongIndices = []; // Array to store liked song indices
      fetch('/get-liked-list')
        .then((res) => res.json())
        .then((data) => {
          likedSongIndices = data; // Update the likedSongIndices array with the fetched data
          console.log('Fetched liked songs:', likedSongIndices); // Debugging: Log the fetched liked songs

          function toggleLikedSong(songIndex, heartIcon) {
            const indexPosition = likedSongIndices.indexOf(songIndex);

            if (indexPosition === -1) {
              // Add the song index to the likedSongIndices array
              likedSongIndices.push(songIndex);
              heartIcon.classList.add("liked"); // Add a visual indicator
            } else {
              // Remove the song index from the likedSongIndices array
              likedSongIndices.splice(indexPosition, 1);
              heartIcon.classList.remove("liked"); // Remove the visual indicator
            }

            fetch('/liked-list', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                likedSongs: likedSongIndices, // 👈 Sending the array here
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log('Server response:', data);
              })
              .catch((error) => {
                console.error('Error:', error);
              });
          }
          currentPlaylistSongIndices = artist.songlist; // Update the current playlist song indices
          // This will be used for navigation in the forward and backward buttons
          mainContent.innerHTML = `
            <div class="artist-details">
              <img src="${artist.image}" alt="${artist.name}" class="artist-details-image" />
              <h1 class="artist-details-name">${artist.name}</h1>
              <p class="artist-details-description">${artist.description}</p>
              <button class="favorite-button" data-index="${artistIndex}">
                <i class="fa-solid ${
                  favorite_Artists.includes(artistIndex) ? 'fa-check' : 'fa-plus'
                }"></i>
                ${
                  favorite_Artists.includes(artistIndex)
                    ? 'Favorited'
                    : 'Add to Favorite'
                }
              </button>
              <h2>Songs by ${artist.name}:</h2>
              <ul class="playlist-songs">
                ${artist.songlist
                  .map(
                    (songIndex) => `
                <li class="playlist-song" data-index="${songIndex}">
                  <div class="song-img">
                    <img src="${songs[songIndex].cover}" alt="${songs[songIndex].title} cover" />
                    <div class="overlay">
                      <i class="fa-solid fa-play"></i>
                    </div>
                  </div>
                  <div class="song-info">
                    <h3>${songs[songIndex].title}</h3>
                    <p>${songs[songIndex].artist}</p>
                  </div>
                  <i class="fa-solid fa-heart heart-icon ${
                    likedSongIndices.includes(songIndex) ? 'liked' : ''
                  }" data-index="${songIndex}" style="margin-left: auto; cursor: pointer;"></i>
                </li>
                  `
                  )
                  .join('')}
              </ul>
              <button class="back-button">Back to Home</button>
            </div>
          `;

          // Add event listener to the back button
          const backButton = document.querySelector('.back-button');
          backButton.addEventListener('click', () => {
            renderHome(); // Navigate back to the home page
          });

          // Add click event listener to the "Add to Favorite" button
          const favoriteButton = document.querySelector('.favorite-button');
          favoriteButton.addEventListener('click', () => {
            toggleFavoriteArtist(artistIndex, favoriteButton);
          });

          // Add click event listeners to each song in the playlist
          const playlistSongs = document.querySelectorAll('.playlist-song');
          playlistSongs.forEach((songElement) => {
            songElement.addEventListener('click', () => {
              const songIndex = parseInt(songElement.dataset.index);
              currentSongIndex = songIndex;
              updateSongInfo(); // Update the music player with the selected song
              playPause(); // Start playing the song
            });
          });

          // Add click event listeners to heart icons
          const heartIcons = document.querySelectorAll('.heart-icon');
          heartIcons.forEach((heartIcon) => {
            heartIcon.addEventListener('click', (event) => {
              event.stopPropagation(); // Prevent triggering the song click event
              const songIndex = parseInt(heartIcon.dataset.index);
              toggleLikedSong(songIndex, heartIcon);
            });
          });
        })
        .catch((err) => console.error('Error fetching liked songs:', err));
    })
    .catch((err) => console.error('Error fetching favorite artists:', err));
}
function renderPlaylistDetails(playlist) {
  
  let favorite_playlist = []; // Array to store favorite artist indices
  fetch('/get-favorite-playlists')
    .then((res) => res.json())
    .then((data) => {
      favorite_playlist = data; // Update the favorite_Artists array with the fetched data
      console.log('Fetched favorite playlist:', favorite_playlist); // Debugging: Log the fetched favorite artists

      const playlistIndex = playlists.indexOf(playlist); // Get the index of the artist
      function toggleFavoritePlaylist(playlistIndex, button) {
        const indexPosition = favorite_playlist.indexOf(playlistIndex);

        if (indexPosition === -1) {
          // Add the artist index to the favoriteArtists array
          favorite_playlist.push(playlistIndex);
          button.innerHTML = `<i class="fa-solid fa-check"></i> Favorited`; // Update button to show "Favorited"
        } else {
          // Remove the artist index from the favoriteArtists array
          favorite_playlist.splice(indexPosition, 1);
          button.innerHTML = `<i class="fa-solid fa-plus"></i> Add to Favorite`; // Update button to show "Add to Favorite"
        }

        console.log('Favorite Playlists:', favorite_playlist); // Debugging: Log the favorite artist indices

        fetch('/favorite-playlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            favoritePlaylists: favorite_playlist, // 👈 Sending the array here
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('Server response:', data);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }

      let likedSongIndices = []; // Array to store liked song indices
      fetch('/get-liked-list')
        .then((res) => res.json())
        .then((data) => {
          likedSongIndices = data; // Update the likedSongIndices array with the fetched data
          console.log('Fetched liked songs:', likedSongIndices); // Debugging: Log the fetched liked songs

          function toggleLikedSong(songIndex, heartIcon) {
            const indexPosition = likedSongIndices.indexOf(songIndex);

            if (indexPosition === -1) {
              // Add the song index to the likedSongIndices array
              likedSongIndices.push(songIndex);
              heartIcon.classList.add("liked"); // Add a visual indicator
            } else {
              // Remove the song index from the likedSongIndices array
              likedSongIndices.splice(indexPosition, 1);
              heartIcon.classList.remove("liked"); // Remove the visual indicator
            }

            fetch('/liked-list', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                likedSongs: likedSongIndices, // 👈 Sending the array here
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log('Server response:', data);
              })
              .catch((error) => {
                console.error('Error:', error);
              });
          }

  // Update the current playlist song indices
  // This will be used for navigation in the forward and backward buttons
  currentPlaylistSongIndices = playlist.songlist;


  mainContent.innerHTML = `
    <div class="playlist-details">
      <img src="${playlist.cover}" alt="${playlist.name}" class="playlist-details-image" />
      <h1 class="playlist-details-name">${playlist.name}</h1>
      <p class="playlist-details-description">${playlist.description || "No description available."}</p>
       <button class="favorite-button" data-index="${playlistIndex}">
                <i class="fa-solid ${
                  favorite_playlist.includes(playlistIndex) ? 'fa-check' : 'fa-plus'
                }"></i>
                ${
                  favorite_playlist.includes(playlistIndex)
                    ? 'Favorited'
                    : 'Add to Favorite'
                }
              </button>
      <h2>Songs in this playlist:</h2>
      <ul class="playlist-songs">
        ${playlist.songlist
          .map(
            (songIndex) => `
        <li class="playlist-song" data-index="${songIndex}">

        <div class="song-img">
              <img src="${songs[songIndex].cover}" alt="${songs[songIndex].title} cover" />
              <div class="overlay">
                <i class="fa-solid fa-play"></i>
              </div>
            </div>
          
          <div class="song-info">
            <h3>${songs[songIndex].title}</h3>
            <p>${songs[songIndex].name}</p>
          </div>
          <i class="fa-solid fa-heart heart-icon ${
                    likedSongIndices.includes(songIndex) ? 'liked' : ''
                  }" data-index="${songIndex}" style="margin-left: auto; cursor: pointer;"></i>
        </li>
          `
          )
          .join("")}
      </ul>
      <button class="back-button">Back to Home</button>
    </div>
  `;

  // Add event listener to the back button
  const backButton = document.querySelector(".back-button");
  backButton.addEventListener("click", () => {
    renderHome(); // Navigate back to the home page
  });
  // Add click event listener to the "Add to Favorite" button
  const favoriteButton = document.querySelector('.favorite-button');
  favoriteButton.addEventListener('click', () => {
    toggleFavoritePlaylist(playlistIndex, favoriteButton);
  });

  // Add click event listeners to each song in the playlist
  const playlistSongs = document.querySelectorAll(".playlist-song");
  playlistSongs.forEach((songElement) => {
    songElement.addEventListener("click", () => {
      const songIndex = parseInt(songElement.dataset.index);
      currentSongIndex = songIndex;
      updateSongInfo(); // Update the music player with the selected song
      playPause(); // Start playing the song
    });
  });
          // Add click event listeners to heart icons
          const heartIcons = document.querySelectorAll('.heart-icon');
          heartIcons.forEach((heartIcon) => {
            heartIcon.addEventListener('click', (event) => {
              event.stopPropagation(); // Prevent triggering the song click event
              const songIndex = parseInt(heartIcon.dataset.index);
              toggleLikedSong(songIndex, heartIcon);
            });
          });
        })
        .catch((err) => console.error('Error fetching liked songs:', err));
    })
    .catch((err) => console.error('Error fetching favorite playlist:', err));
}

function renderSearchPlaylist() {
  mainContent.innerHTML = `
    <h1>Search for a Playlist</h1>
    <p>Search functionality for playlists will go here.</p>
    <button class="back-button">Back to Search</button>
  `;

  // Add event listener to the back button
  const backButton = document.querySelector(".back-button");
  backButton.addEventListener("click", () => {
    renderSearch(); // Navigate back to the search page
  });
}

function renderSearchSong() {
  mainContent.innerHTML = `
    <h1>Search for a Song</h1>
    <p>Search functionality for songs will go here.</p>
    <button class="back-button">Back to Search</button>
  `;

  // Add event listener to the back button
  const backButton = document.querySelector(".back-button");
  backButton.addEventListener("click", () => {
    renderSearch(); // Navigate back to the search page
  });
}


function renderSearchLyrics() {
  mainContent.innerHTML = `
    <div class="lyrics-search-container">
        <h1>Search for a Song by Lyrics</h1>
        <form method="POST">
            <input type="text" name="lyrics" placeholder="Type song lyrics..." required>
            <button type="submit">Find Song</button>
        </form>

        <div id="lyrics-result"></div>
    </div>
  `;

  // Add event listener to the form
  const form = mainContent.querySelector("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const lyrics = form.querySelector('input[name="lyrics"]').value;

    // Add animation to the container
    const container = document.querySelector(".lyrics-search-container");
    container.classList.add("expand");

    // Fetch the songs based on lyrics
    fetch('/search-lyrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lyrics }),
    })
      .then((res) => res.json())
      .then((data) => {
        const resultDiv = document.getElementById("lyrics-result");
        currentPlaylistSongIndices = data.songs; // Update the current playlist song indices
        if (data.songs && data.songs.length > 0) {
          resultDiv.innerHTML = `
            <div class="result">
                <h2>🎶 Found ${data.songs.length} result${data.songs.length > 1 ? 's' : ''}</h2>
                <ul class="song-list">
                    ${data.songs
                      .map(
                        (song, index) => `
                        <li class="song-item" data-index="${index}" style="opacity: 0; animation-delay: ${index * 0.2}s;">
                          <img src="${song.thumbnail}" alt="Album Art" width="80" style="border-radius: 10px;"><br>
                          <strong>${song.title}</strong> by ${song.artist}<br>
                          <a href="${song.url}" target="_blank">View on Genius</a>
                        </li>
                      `
                      )
                      .join('')}
                </ul>
            </div>
          `;

          // Add animation class to each song item
          const songItems = document.querySelectorAll(".song-item");
          songItems.forEach((item, index) => {
            item.classList.add("fade-in");

            // Add click event listener to play the song
            item.addEventListener("click", () => {
              const selectedSong = data.songs[index];

              if (selectedSong.preview) {
                // Update the music player with the selected song
                song.src = selectedSong.preview; // Use the preview URL from Deezer
                songName.textContent = selectedSong.title;
                artistName.textContent = selectedSong.artist;
                rotatingImage.src = selectedSong.thumbnail;

                // Play the song
                
              } else {
                // If preview is not found, update the title
                songName.textContent = "Preview Not Found";
                artistName.textContent = "";
                rotatingImage.src = selectedSong.thumbnail;
                song.src = ""; // Clear the audio source
                song.pause(); // Ensure the player is paused
                controlIcon.classList.remove("fa-pause");
                controlIcon.classList.add("fa-play");
                playPause();
              }
              // Play the song
              playPause();
            });
          });
        } else {
          resultDiv.innerHTML = `<p>No match found 😞</p>`;
        }
      })
      .catch((err) => {
        console.error("Error searching lyrics:", err);
      });
  });
}
function renderSearchArtist() {
  mainContent.innerHTML = `
    <h1>Search for an artist</h1>
    <p>Search functionality for an artist will go here.</p>
    <button class="back-button">Back to Search</button>
  `;

  // Add event listener to the back button
  const backButton = document.querySelector(".back-button");
  backButton.addEventListener("click", () => {
    renderSearch(); // Navigate back to the search page
  });
}







