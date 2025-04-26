from . import db
from flask_login import UserMixin
from sqlalchemy.sql import func


class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(10000))
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Playlists(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    cover = db.Column(db.String(150))
    date_created = db.Column(db.DateTime(timezone=True), default=func.now())
    songlist = db.Column(db.JSON, nullable=True)

class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150))
    artist = db.Column(db.String(150))
    name = db.Column(db.String(150))
    lyrics = db.Column(db.String(10000))
    source = db.Column(db.String(150))
    cover = db.Column(db.String(150))


class Artists(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    image = db.Column(db.String(150))
    description = db.Column(db.String(10000))
    songlist = db.Column(db.JSON, nullable=True)
    

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    liked_songlist = db.Column(db.JSON, nullable=True)
    favorite_artists = db.Column(db.JSON, nullable=True)
    favorite_playlists = db.Column(db.JSON, nullable=True)
    notes = db.relationship('Note')
    
