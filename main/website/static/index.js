// Function to delete a note
function deleteNote(noteId) {
    fetch("/delete-note", {
        method: "POST",
        body: JSON.stringify({ noteId: noteId }),
    }).then((_res) => {
        window.location.href = "/";
    });
}

// Function to delete a song
function deleteSong(songId) {
    fetch("/delete-song", {
        method: "POST",
        body: JSON.stringify({ songId: songId }),
    }).then((_res) => {
        window.location.href = "/";
    });
}

// Function to delete a playlist
function deletePlaylist(playlistId) {
    fetch("/delete-playlist", {
        method: "POST",
        body: JSON.stringify({ playlistId: playlistId }),
    }).then((_res) => {
        window.location.href = "/";
    });
}

// Function to add a song to a playlist
function addSongToPlaylist(songId, playlistId) {
    fetch("/add-song-to-playlist", {
        method: "POST",
        body: JSON.stringify({ songId: songId, playlistId: playlistId }),
    }).then((_res) => {
        window.location.href = "/";
    });
}
