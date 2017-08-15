'use strict'

var fs = require("fs");
var path = require("path");

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');


function getSong(req, res){
	var songId = req.params.id;
	Song.findById(songId).populate({path: 'album'}).exec((err, song)=>{
		if (err) {
			res.status(500).send({message: 'Error en el servidor'})
		}else{
			if (!song) {
				res.status(404).send({message: 'No se pudo guardar el album'})
			}else{
				res.status(200).send({song})
			}
		}
	})
}

function saveSong(req, res){
	var song = new Song();
	var params = req.body;

	song.number = params.number;
	song.name = params.name;
	song.duration = params.duration;
	song.file = 'null';
	song.album = params.album;

	song.save((err, songStored) => {
		if (err) {
			res.status(500).send({message: 'Error en el servidor'});
		} else {
			if (!songStored) {
				res.status(404).send({message: 'No se pudo guardar la cancion'})
			}else{
				res.status(200).send({song: songStored})
			}
		}
	})

}

function getSongs(req, res){
	var albumId = req.params.album;

	if (!albumId) {
		var find = Song.find({}).sort('title');
	}else{
		var find = Song.find({album: albumId}).sort('title');
	}

	find.populate({path: 'album', populate: {path: 'artist', model: 'Artist'}}).exec((err, songs)=>{
		if (err) {
			res.status(500).send({message: 'Error en el servidor'})
		}else{
			if (!songs) {
				res.status(404).send({message: 'No hay albums'})
			}else{
				res.status(200).send({songs})
			}
		}
	})
}

function updateSong(req, res){
	var songId = req.params.id;
	var update = req.body;

	Song.findByIdAndUpdate(songId, update, (err, songUpdated)=>{
		if (err) {
			res.status(500).send({message: 'Error en el servidor'})
		}else{
			if (!songUpdated) {
				res.status(404).send({message: 'El album no existe'})
			}else{
				res.status(200).send({song: songUpdated})
			}
		}
	});
}

function deleteSong(req, res){
	var songId = req.params.id;

	Song.findByIdAndRemove(songId, function(err, songRemoved){
		if (err) {
			res.status(500).send({
				message: 'Error en la petición'
			})
		}else{
			if (!songRemoved) {
				res.status(404).send({
					message: 'Error al eliminar el album del artista'
				})
			}else{
				res.status(200).send({
					song: songRemoved
				})
			}
		}
	})
}


function uploadFile(req, res){
	var songId = req.params.id;
	var file_name = 'No subido...';
	console.log(req.files);
	if (req.files) {
		var file_path = req.files.file.path;
		var file_split = file_path.split('/');
		var file_name = file_split[2];

		var file_ext = file_name.split('\.');
		var ext = file_ext[1];

		// verificar la extension
		if (ext == 'mp3' || ext == 'ogg') {
			Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdated) =>{
				if (!songUpdated) {
					res.status(404).send({
						message: 'No se ha podido actualizar la cancion'
					});
				}else{
					res.status(200).send({
						song: songUpdated
					});
				}
			});
		}else{
			res.status(200).send({
				message: 'El tipo de extension no es valido'
			});
		}


	}else{
		res.status(200).send({
			message: 'No has subido ninguna imagen...'
		});
	}
}


function getSongFile(req, res){
	var songFile = req.params.songFile;
	var path_file = './uploads/songs/'+songFile ;
	fs.exists(path_file, function(exists){
		if (exists) {
			res.sendFile(path.resolve(path_file))
		}else{
			res.status(200).send({
				message: 'No existe el archivo de audio...'
			});
		}
	});
}

module.exports = {
	getSong,
	saveSong,
	getSongs,
	updateSong,
	deleteSong,
	uploadFile,
	getSongFile
}