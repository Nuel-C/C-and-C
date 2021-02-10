const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { stringify } = require('querystring');
const { ESRCH } = require('constants');

mongoose.connect('mongodb://localhost/c_and_c');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

var clothingSchema = new mongoose.Schema({
    comment: String,
    image: String,
    price: String
});
var Clothing = mongoose.model('Clothing', clothingSchema);
var login = {
    username: 'Dio', 
    password: 'Speedwagon'
};

app.get('/', function(req, res){
    Clothing.find({}, function(err, clothings){
        if(err){
            console.log(err);
        }else{
            res.render('app', {clothings: clothings});
        }
    });
});

app.post('/post', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    if(password === login.password && username === login.username){
        Clothing.find({}, function(err, clothings){
            if(err){
                console.log(err);
            }else{
                res.render('post', {clothings: clothings});
            }
        });
    }else{
        res.redirect('/admin');
    }
});

app.post('/remove/:id', function(req, res){
    Clothing.findByIdAndDelete(req.params.id, function(err, clothings){
        if(err){
            console.log('error');
        }else{
            res.redirect('/');
        }
    });
});

app.get('/admin', function(req, res){

    res.render('admin');
});

app.post('/add', function(req, res){
    var newComment = req.body.comment;
    var newImage = req.body.image;
    var newPrice = req.body.price;
    var newPost = {comment:newComment, image:newImage, price: newPrice};

    Clothing.create(newPost, function(err, post){
        if(err){
            console.log(err);
        }else{
            console.log(post);
        }
    });

    res.redirect('/');
});

app.get('*', function(req, res){
    res.send('invalid page');
});

app.listen(3000);