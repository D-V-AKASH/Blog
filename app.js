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

const homeContent = "Welcome to your personal sanctuary, My Jounral! Where every thought, dream, and memory finds a home. Here, you can manage your diary, chronicle your experiences, and reflect on the journey of your days. Let this space be a canvas for your inner voice, where each entry is a step towards understanding and growth. This is your story, and you hold the pen. Here, you are free to be honest, unfiltered, and true to yourself. Whether it’s a fleeting thought or a profound revelation, every word matters, because it's yours."
const contactContent = "This is the content. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The Extremes of Good and Evil) by Cicero, written in 45 BC."
const aboutContent = "I created this space because I believe that everyone deserves a corner of the world where they can retreat, reflect, and be with their thoughts. Life moves fast, but our words—our innermost reflections—deserve time to settle and be heard. This blog isn't just a platform; it's a personal diary that invites you to sit down with your mind, your words, and craft your story at your own pace. Here, you can explore the depths of your feelings, celebrate your victories, and navigate through your challenges. Each entry is a step toward understanding yourself better, a chance to capture moments that matter."

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


