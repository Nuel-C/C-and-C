const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { stringify } = require('querystring');
const { ESRCH } = require('constants');
const path = require('path');
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const multer = require('multer');
const storage = multer.diskStorage({destination: (req, file, cb) =>{cb(null, 'x/img/uploads')}, filename: (req, file, cb) => {console.log(file); cb(null, Date.now() + path.extname(file.originalname));}});
const fileFilter = (req, file, cb) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}
const upload = multer({storage: storage, fileFilter: fileFilter});
const fs = require('fs');
const User = require('./models/user');


mongoose.connect('mongodb://localhost/c_and_c', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(require('express-session')({
    secret: 'damn',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static('x'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var orderSchema = new mongoose.Schema({
    neck: String, 
    shoulder: String, 
    chest: String, 
    waist: String, 
    hips: String, 
    arm: String, 
    inseam: String,
    phone: Number,
    name: String,
    clothings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clothing'
        }
    ]
});
var Order = mongoose.model('Order', orderSchema);

var clothingSchema = new mongoose.Schema({
    comment: String,
    image: String,
    price: String,
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

app.get('/post', isLoggedIn, function(req, res){
        Clothing.find({}, function(err, clothings){
            if(err){
                console.log(err);
            }else{
                res.render('post', {clothings: clothings});
            }
        });
});

app.get('/logout', (req, res)=>{
    req.logout();
    res.redirect('/');
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

    Order.create(newOrder, function(err, orders){
        if(err){
            console.log(err);
        }else{
            Clothing.findById(req.params.id, function(err, clothings){
                if(err){

                }else{
                    orders.clothings.push(clothings);
                    orders.save(function(err, order){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(order);
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
        var clothing = 'x' + clothings.image;
        if(err){
            console.log('error');
        }else{
            fs.unlinkSync(clothing);
            Order.deleteMany({clothings}, function(err, orders){
                if(err){
                    console.log(err);
                }else{
                    console.log(orders);
                }
            });
            res.redirect('/');
        }
    });
});


app.get('/register', (req,res)=>{
    res.render('register');
});

app.post('/register', (req, res)=>{
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }else{
            passport.authenticate('local')(req, res, function(){
                res.redirect('/post');
            });
        }
    });
});

app.get('/orders', isLoggedIn, function(req, res){
        Order.find().populate('clothings').exec(function(err, orders){
            if(err){
                console.log(err);
            }else{
                res.render('orders', {orders: orders});
            }
        });
});

app.post('/add', upload.single('image'), function(req, res){
    var newComment = req.body.comment;
    var newImages = req.file.path.replace(/[\\]/g, '/');
    var newImage = newImages.replace(/[x]/, '');
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

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login',passport.authenticate('local', {successRedirect: '/post', failureRedirect: '/login'}), (req, res)=>{
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

app.get('*', function(req, res){
    res.send('invalid page');
});

app.listen(3000, (err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('server connected');
    }
});