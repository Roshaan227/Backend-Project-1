const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const postModel = require('./models/post');
const upload = require('./config/multerconfig');



app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', function (req, res) {
    res.render('index');
});
app.get('/profile/upload', function (req, res) {
    res.render('profileupload');

});
app.post('/upload',isLoggedIn,upload.single("image"), async function (req, res) {
      let user = await userModel.findOne({email:req.user.email})
      user.profilepic = req.file.filename;
      await user.save();
      res.redirect('/profile')
});

app.get('/login', function (req, res) {
    res.render('login');
});
app.get('/profile',isLoggedIn , async (req, res)=> {
   let user =   await userModel.findOne({email:req.user.email}).populate("posts")
     res.render('profile',{user});
});
app.get('/like/:id',isLoggedIn , async (req, res)=> {
   let post = await postModel.findOne({_id:req.params.id}).populate('user');
   if(post.likes.indexOf(req.user.userid) ===-1){
    post.likes.push(req.user.userid)
   }
   else{
    post.likes.splice(post.likes.indexOf(req.user.userid),1)
   }
   await post.save();
   res.redirect('/profile')
     
});
app.get('/edit/:id',isLoggedIn , async (req, res)=> {
   let post = await postModel.findOne({_id:req.params.id}).populate('user');
   
   res.render('edit',{post})
     
});
app.post('/update/:id',isLoggedIn , async (req, res)=> {
   let post = await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content})
   
   res.redirect('/profile')
     
});
app.post('/post',isLoggedIn , async (req, res)=> {
   let user =   await userModel.findOne({email:req.user.email})
      let {content} = req.body 
      let post = await postModel.create({
        user: user._id,
        content    
      });
      console.log(post)
      user.posts.push(post._id);
      await user.save();
      res.redirect('/profile')
});


app.get('/logout', function (req, res) {
    res.cookie('token', '', { expires: new Date(0) });
    res.redirect('/login');
});



app.post('/register', async function (req, res) {
    let { name, userName, email, age, password } = req.body;
    let user = await userModel.findOne({ email });
    if (user) return res.status(500).send('User already registered');

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(500).send('Server error');
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) return res.status(500).send('Server error');
            let newUser = await userModel.create({
                name,
                userName,
                email,
                age,
                password: hash
            });
            let token = jwt.sign({ email: email, userid: newUser._id }, 'shh');
            res.cookie('token', token);
            res.send('Your account is registered');
        });
    });
});

app.post('/login', async function (req, res) {
    let { password, email } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) return res.status(500).send('User not found');

    bcrypt.compare(password, user.password, function (err, result) {
        if (err) return res.status(500).send('Server error');
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, 'shh');
            res.cookie('token', token);
            return res.status(200).redirect('/profile');
        } else {
            return res.status(401).send('Invalid credentials');
        }
    });
});
function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).redirect('/login');
    }

    try {
        let data = jwt.verify(token, "shh");
        req.user = data;
        next();
    } catch (err) {
        return res.status(401).send('Invalid token');
    }
}


app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
