'use strict'

var fs = require('fs');
var path = require('path');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

var mongoosePaginate = require('mongoose-pagination')

function getArtist(req, res){
	var artistId = req.params.id;
	Artist.findById(artistId, (err, artist) => {
		if (err) {
			res.status(500).send({
				message: 'Error en la peticion'
			})
		}else {
			if (!artist) {
				res.status(404).send({
					message: 'El artista no existe'
				})
			}else{
				res.status(200).send({
					artist: artist
				})
			}
		}
	})

	
}

function saveArtist(req, res){
	var artist = new Artist();
	var params = req.body;

	artist.name = params.name;
	artist.description = params.description;
	artist.image = 'null';

	artist.save((err, artistStored)=>{
		if (err) {
			res.status(500).send({
				message: 'error al guardar el usuario'
			})
		}else{
			if (!artistStored) {
				res.status(404).send({
					message: 'el artista no ha sido guardado'
				})
			}else{
				res.status(200).send({
				artist: artistStored
			})
			}
		}
	})
}


function getArtists(req, res){
	if (req.params.page) {
		var page = req.params.page;	
	}else{
		var page = 1;
	}
	
	var itemsPerPage = 4;

	Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, total){
		if (err){
			res.status(500).send({
				message: 'error en la petición'
			})
		}else{
			if (!artists) {
				res.status(404).send({
					message: 'no hay artistas'
				})
			}else{
				return res.status(200).send({
					total_items: total,
					artists: artists
				})
			}
		}
	})
}

function updateArtist(req, res){
	var artistId = req.params.id;
	var params = req.body;

	Artist.findByIdAndUpdate(artistId, params, function(err, artistUpdated){
		if (err) {
			res.status(500).send({
					message: 'Error en la petición'
			})
		}else{
			if (!artistUpdated) {
				res.status(404).send({
					message: 'Error al editar el artista'
				})
			}else{
				res.status(200).send({
					artist: artistUpdated
				})
			}
		}
	})
}


function deleteArtist(req, res){
	var artistId = req.params.id;

	Artist.findByIdAndRemove(artistId, function(err, artistRemoved){
		if (err) {
			res.status(500).send({
					message: 'Error en la petición'
			})
		}else{
			if (!artistRemoved) {
				res.status(404).send({
					message: 'Error al editar el artista'
				})
			}else{
	
				Album.find({artist: artistRemoved._id}).remove(function(err, albumRemoved){
					if (err) {
						res.status(500).send({
							message: 'Error en la petición'
						})
					}else{
						if (!albumRemoved) {
							res.status(404).send({
								message: 'Error al eliminar el album del artista'
							})
						}else{
							Song.find({album:albumRemoved._id}).remove((err, songRemoved)=>{
								if (err) {
									res.status(500).send({	
										message: 'Error en la petición al intentar borrar las canciones'
									});
								}else{
									if (!songRemoved) {
										res.status(404).send({
											message: 'La cancion no ha sido eliminada'
										});
									}else{
										res.status(200).send({
											artist: artistRemoved
										});
									}
								}
							})

						}
					}
				})
			}
		}
	})
}

function uploadImage(req, res){
    var artistId = req.params.id;
    var file_name = 'No subido...';
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];

        var file_ext = file_name.split('\.');
        var ext = file_ext[1];

        // verificar la extension
        if (ext == 'png' || ext == 'jpg' || ext == 'gif' || ext == 'jpeg') {
            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated) => {
                if (!artistUpdated) {
                res.status(404).send({
                    message: 'No se ha podido actualizar el usuario'
                });
            }else{
                res.status(200).send({
                    image: file_name,
                    artist: artistUpdated
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


function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/artists/' + imageFile;
    fs.exists(path_file, function(exists){
        if (exists) {
            res.sendFile(path.resolve(path_file))
        }else{
            res.status(200).send({
                message: 'No existe la imagen.'
            });
        }
    });
}

module.exports = {
	getArtist,
	saveArtist,
	getArtists,
	updateArtist,
	deleteArtist,
	uploadImage,
	getImageFile
}