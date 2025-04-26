from flask import Blueprint, render_template, request, flash, jsonify
import requests
from flask_login import login_required, current_user
from .models import Note, Song, Playlists, Artists, User
from . import db
import json
from datetime import datetime

views = Blueprint('views', __name__)

# Genius API Token
GENIUS_API_TOKEN = "mIx7GZgRWon1MnSjO5mVK-b5zBy2o_T36O8i_aX3QTWCQg-PpA1EgtWrcavWEszT"

# Function to search songs by lyrics using Genius API
def search_songs_by_lyrics(lyrics):
    genius_url = "https://api.genius.com/search"
    headers = {"Authorization": f"Bearer {GENIUS_API_TOKEN}"}
    params = {"q": lyrics}
    response = requests.get(genius_url, headers=headers, params=params)
    results = []

    if response.status_code == 200:
        hits = response.json()['response']['hits'][:5]
        for hit in hits:
            song = hit['result']
            # Fetch Deezer preview for each song
            deezer_results = search_deezer_track(song['title'] + " " + song['primary_artist']['name'])
            preview = deezer_results[0]['preview'] if deezer_results else None
            results.append({
                "title": song['title'],
                "artist": song['primary_artist']['name'],
                "url": song['url'],
                "thumbnail": song['song_art_image_thumbnail_url'],
                "preview": preview  # Add preview from Deezer
            })
    return results

# Function to search tracks using Deezer API
def search_deezer_track(query):
    url = f"https://api.deezer.com/search?q={query}"
    response = requests.get(url)

    results = []
    if response.status_code == 200:
        data = response.json()
        for track in data['data'][:5]:  # Limit to top 5
            results.append({
                "title": track['title'],
                "artist": track['artist']['name'],
                "album": track['album']['title'],
                "url": track['link'],
                "thumbnail": track['album']['cover_medium'],
                "preview": track['preview']  # 30s mp3
            })
    return results

# Updated route for the homepage
@views.route("/", methods=["GET", "POST"])
@login_required
def home():
    songs = []
    if request.method == "POST":
        if 'lyrics' in request.form and request.form['lyrics']:
            lyrics = request.form['lyrics']
            songs = search_songs_by_lyrics(lyrics)
            print("Songs found:", songs)  # Debugging line to check the songs found
        elif 'query' in request.form and request.form['query']:
            query = request.form['query']
            songs = search_deezer_track(query)
    return render_template("home.html", user=current_user, songs=songs)

@views.route('/delete-note', methods=['POST'])
def delete_note():  
    note = json.loads(request.data)  # This function expects a JSON from the INDEX.js file 
    noteId = note['noteId']
    note = Note.query.get(noteId)
    if note:
        if note.user_id == current_user.id:
            db.session.delete(note)
            db.session.commit()

    return jsonify({})

@views.route('/api/songs')
def get_songs():
    songs = Song.query.all()
    song_list = [
        {
            "index": i + 1,
            "title": song.title or "title",
            "name": song.name or "name",
            "artist": song.artist or "artist",
            "lyrics": song.lyrics or "lyrics",
            "source": song.source or "source",
            "cover": song.cover or "cover",
        }
        for i, song in enumerate(songs)
        
    ]
    return jsonify(song_list)

@views.route('/api/playlists')
def get_playlists():
    try:
        playlists = Playlists.query.all()
        playlist_list = [
            {
                "index": i + 1,
                "name": pl.name or "name",
                "cover": pl.cover or "cover",
                "songlist": list(pl.songlist) if pl.songlist else [],
                "date_created": pl.date_created.isoformat() if isinstance(pl.date_created, datetime) else None,
            }
            for i, pl in enumerate(playlists)
        ]
        return jsonify(playlist_list)
    except Exception as e:
        print("Error in /api/playlists:", e)
        return jsonify({"error": str(e)}), 500


@views.route('/api/artists')
def get_artists():
    artists = Artists.query.all()
    artist_list = [
        {
            "index": i + 1,
            "name": artist.name or "name",
            "image": artist.image or "image",
            "description": artist.description or "description",
            "songlist": list(artist.songlist) if artist.songlist else [],
        }
        for i, artist in enumerate(artists)
    ]
    return jsonify(artist_list)

@views.route('/liked-list', methods=['POST'])
def save_likedlist():
    data = request.get_json()
    songlist = data.get('likedSongs')  # 👈 Receive the array here
    print("Received songlist:", songlist)

    if  not isinstance(songlist, list):
        return jsonify({'error': 'Invalid data'}), 400

    # Update the liked songlist of the user
    current_user.liked_songlist = songlist 
    db.session.commit()

    return jsonify({'message': 'likedlist saved successfully'})

@views.route('/get-liked-list')
def get_likedlist():
    # Fetch the liked songlist from the current user
    print("Fetching liked songlist for user:", current_user.id)
    liked_songlist = current_user.liked_songlist if current_user.liked_songlist else []
    print("Sending liked songlist to frontend:", liked_songlist)
    return jsonify(liked_songlist)


@views.route('/favorite-artists', methods=['POST'])
def save_favorite_artists():
    data = request.get_json()
    artist_list = data.get('favoriteArtists')  # 👈 Receive the array here
    print("Received artist list:", artist_list)

    if not isinstance(artist_list, list):
        return jsonify({'error': 'Invalid data'}), 400

    # Update the favorite artists of the user
    current_user.favorite_artists = artist_list
    db.session.commit()

    return jsonify({'message': 'Favorite artists saved successfully'})


@views.route('/get-favorite-artists')
def get_favorite_artists():
    # Fetch the favorite artists from the current user
    print("Fetching favorite artists for user:", current_user.id)
    favorite_artists = current_user.favorite_artists if current_user.favorite_artists else []
    print("Sending favorite artists to frontend:", favorite_artists)
    return jsonify(favorite_artists)

@views.route('/favorite-playlists', methods=['POST'])
def save_favorite_playlists():
        data = request.get_json()
        playlist_list = data.get('favoritePlaylists')  # 👈 Receive the array here
        print("Received playlist list:", playlist_list)

        if not isinstance(playlist_list, list):
            return jsonify({'error': 'Invalid data'}), 400

        # Update the favorite playlists of the user
        current_user.favorite_playlists = playlist_list
        db.session.commit()

        return jsonify({'message': 'Favorite playlists saved successfully'})


@views.route('/get-favorite-playlists')
def get_favorite_playlists():
        # Fetch the favorite playlists from the current user
        print("Fetching favorite playlists for user:", current_user.id)
        favorite_playlists = current_user.favorite_playlists if current_user.favorite_playlists else []
        print("Sending favorite playlists to frontend:", favorite_playlists)
        return jsonify(favorite_playlists)

@views.route('/search-lyrics', methods=['POST'])
def search_lyrics():
    data = request.get_json()
    lyrics = data.get('lyrics')

    if not lyrics:
        return jsonify({'error': 'Lyrics are required'}), 400

    # Use the Genius API to search for songs by lyrics
    try:
        results = search_songs_by_lyrics(lyrics)  # Call the `search_genius` function
        if results:
            # Return all results
            return jsonify({'songs': results})
        else:
            return jsonify({'songs': []})  # No match found
    except Exception as e:
        print("Error searching lyrics:", e)
        return jsonify({'error': 'An error occurred while searching lyrics'}), 500



