const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use( express.static( 'public'));

mongoose.connect('mongodb://localhost:27017/journalDb');

const journalSchema = mongoose.Schema({
    composeTitle: {
        type : String,
        required:[true, 'give it a title']
    },

    composeContent:{ 
        type : String,
        required:[true, 'write how you feel!']
    },

    todayDate : String,

    currentPostId : Number

});

const Post = mongoose.model('post', journalSchema);

const homeContent = "This is home page starting content. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. last line"
const contactContent = "This is the content. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The Extremes of Good and Evil) by Cicero, written in 45 BC."
const aboutContent = "This is the about content. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures."

// const blogContent = []; 

let date = new Date();
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
let postDate = date.toLocaleDateString("en-US", options);

let postId;
let triggeredPost;
let displayPost;


Post.find().then((result)=>{
    if(result.length === 0){
     postId = 0;
    }
    else{
     postId = result.length;
    }
 });
 

app.get('/', function(req,res){

    Post.find().then((result)=>{ 
        res.render('home.ejs', {firstPara:homeContent, posts:result});
        console.log(result);
    
    }).catch((err)=>{
        console.log(err)
    })


})

app.get('/about', function(req,res){

    res.render('about.ejs', { aboutPara: aboutContent});
})

app.get('/contact', function(req,res){

    res.render('contact.ejs', { contactPara:contactContent});
})

app.get('/compose', function(req,res){

    res.render('compose.ejs');
})

app.get("/posts/:testing", function(req,res){
    const requestParameter = _.lowerCase(req.params.testing); 
    
    //req.params returns an object to we are targetting which key-value pair we want by that key name
    // here testing is a placeholder

    Post.find().then((result)=>{

        result.forEach((blog) => {

            if(requestParameter === _.lowerCase(blog.composeTitle)){
                if(blog.currentPostId ===0 && result.length ===1){
                    res.render("post.ejs", {composeTitlePost:blog.composeTitle, composeContentPost:blog.composeContent, currentPostDate:blog.todayDate, selectedPostId:blog.currentPostId,previousStatus : "hidden",nextStatus:"hidden"})
                }
                else if(blog.currentPostId ===0){
                    res.render("post.ejs", {composeTitlePost:blog.composeTitle, composeContentPost:blog.composeContent, currentPostDate:blog.todayDate, selectedPostId:blog.currentPostId,previousStatus : "hidden",nextStatus:"visible"})
                }
                else if(blog.currentPostId === (result.length -1)){
    
                    res.render("post.ejs", {composeTitlePost:blog.composeTitle, composeContentPost:blog.composeContent, currentPostDate:blog.todayDate, selectedPostId:blog.currentPostId,previousStatus : "visible", nextStatus:"hidden"})
                }
                else{
                    res.render("post.ejs", {composeTitlePost:blog.composeTitle, composeContentPost:blog.composeContent, currentPostDate:blog.todayDate, selectedPostId:blog.currentPostId,previousStatus : "visible", nextStatus:"visible"})
                }
            }
        })
    });

    
});


app.post("/", function(req,res){

    let composeContents =  new Post({
        composeTitle : req.body.todayTitle,
        composeContent :req.body.todayContent,
        todayDate :postDate,
        currentPostId : postId
    });

    // blogContent.push(composeContents);
    composeContents.save().then(()=>{
        res.redirect('/');
    }).catch((err)=>{console.log(err)});

    postId++;

})


app.post("/previous", function(req,res){

    triggeredPost = req.body.inputPrevious;

    Post.find().then((result)=>{

        displayPost = result.find((obj) => obj.currentPostId === (Number(triggeredPost)-1));

        console.log("current : " + triggeredPost);
        console.log("previous : "+ (Number(triggeredPost)-1));
    
        console.log(displayPost);
    
    }).then(()=>{
        
        res.redirect("/posts/" + displayPost.composeTitle);   
    });


})

app.post("/next", function(req,res){

    triggeredPost = req.body.inputNext;

    Post.find().then((result)=>{
        displayPost = result.find((obj) => obj.currentPostId === (Number(triggeredPost)+1));


        console.log("current : " + triggeredPost);
        console.log( "next : " + (Number(triggeredPost)+1));
    
        console.log(displayPost);
        
    }).then(()=>{

        res.redirect("/posts/" + displayPost.composeTitle);
    })
    

})




app.listen(3000, function(){
    console.log("port listens");
});


