//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://piyush:pcpcpc123@firstcluster.lanvn.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});
// mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

const todolistSchema = {         // for all items in every list.
  name: String
};
const listSchema = {                   /// for all lists
  name: {
    type:String,
    unique: true
},
  listitem: [todolistSchema]
};
const Item = mongoose.model("Item",todolistSchema);
const List = mongoose.model("List",listSchema);

const breakfast = new Item({
  name: "Breakfast"
});
const study = new Item({
  name: "Study"
});
const lunch = new Item({
  name: "Lunch"
});
const array = [breakfast,study,lunch];

app.get("/", function(req, res) {
  Item.find({},function(err,results){
    if(results.length === 0){
      Item.insertMany(array,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully entered the details.");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle:"Today", newListItems: results});
    }
  });
});

// add a new item in an exixting list
app.post("/", function(req, res){
   const newlistitem = req.body.newItem;
   const listname = req.body.list;
   const newitem = new Item ({
    name: newlistitem
  });

    if(listname === "Today"){
      newitem.save();
      res.redirect("/");
    }else{
      List.findOne({name: listname},function(err,foundlist){
        // console.log(foundlist);
        foundlist.listitem.push(newitem);
        foundlist.save();
        res.redirect("/newlist/"+ listname);
      });
    }

});

// delete an existing item from their respective list
app.post("/delete",function(req,res){
  const checkboxid = req.body.checkbox;
  const listname = req.body.listname;
  if(listname === "Today"){
    Item.findByIdAndRemove(req.body.checkbox,function(err){
      if(!err){
        console.log("Item deleted successfully.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listname},{$pull:{listitem:{_id: checkboxid}}},function(err,foundlist){
      if(!err){
        console.log("Item deleted successfully.");
        res.redirect("/newlist/" + listname);
      }
    });
    }
});

// create newl ist button
app.post("/createlist",function(req,res){
  const newlisttitle = _.capitalize(req.body.newlisttitle);
  // console.log(newlisttitle);
  List.findOne({name: newlisttitle},function(err,findlist){
    if(!err){
      if(!findlist){
        const list = new List({
          name: newlisttitle,
          listitem: array
        });
          list.save();
          res.redirect("/newlist/"+ newlisttitle);
      }else{
        res.render("list",{listTitle:findlist.name, newListItems: findlist.listitem});
      }
    }
  });
});
// adding new lists dynamically
app.get("/newlist/:parameter", function(req,res){
  // console.log(req.params);
  const path = _.capitalize(req.params.parameter);
  // console.log(path);
  List.findOne({name: path},function(err,findlist){
    if(!err){
      if(!findlist){
        const list = new List({
          name: path,
          listitem: array
        });
          list.save();
          res.redirect("/newlist/"+ path);
      }else{
        res.render("list",{listTitle:findlist.name, newListItems: findlist.listitem});
      }
    }
  });

});

// listning to port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully.");
});



// rm -rf .git
