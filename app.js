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

var orderSchema = new mongoose.Schema({
    neck: String, 
    shoulder: String, 
    chest: String, 
    waist: String, 
    hips: String, 
    arm: String, 
    inseam: String,
    phone: Number,
    name: String
});
var Order = mongoose.model('Order', orderSchema);

var clothingSchema = new mongoose.Schema({
    comment: String,
    image: String,
    price: String,
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Order
        }
    ]
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

app.post('/order/:id', function(req, res){
    var newNeck = req.body.neck
    var newShoulder = req.body.shoulder
    var newChest = req.body.chest
    var newWaist = req.body.waist
    var newHips = req.body.hips
    var newArm = req.body.arm
    var newInseam = req.body.inseam
    var newPhone = req.body.phone
    var newName = req.body.name
    var newOrder = {neck: newNeck, shoulder: newShoulder, chest: newChest, waist: newWaist, hips: newHips, arm: newArm, inseam: newInseam, phone: newPhone, name: newName};

    Order.create(newOrder, function(err, order){
        if(err){
            console.log(err);
        }else{
            Clothing.findById(req.params.id, function(err, clothings){
                if(err){

                }else{
                    clothings.orders.push(order);
                    clothings.save(function(err, clothing){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(clothing);
                        }
                    });
                    console.log(clothings);
                }
            });
        }
    });
    res.redirect('/');
});

app.get('/show/:id', function(req, res){
    Clothing.findById(req.params.id, function(err, clothings){
        if(err){
            console.log(err);
        }else{
            res.render('show', {clothings: clothings});
        }
    });
});

app.post('/remove/:id', function(req, res){
    var id = req.params.id;
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

app.get('/orders', function(req, res){
    Clothing.find().populate('orders').exec(function(err, clothings){
        if(err){
            console.log(err);
        }else{
            res.render('orders', {clothings: clothings});
        }
    });
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

app.post('/delete/:id', function(req, res){
    var id = req.params.id;
    Order.deleteOne({_id: id}, function(err, order){
        if(err){
            console.log(err);
        }else{
            res.redirect('/orders');
        }
    });
});

app.get('*', function(req, res){
    res.send('invalid page');
});

app.listen(3000);