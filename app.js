//jshint esversion:6
const express = require('express');
const body_parser = require('body-parser');
const mongoose = require('mongoose');
const lodash = require('lodash');
// const date = require(__dirname + '/date.js');
const app = express();

app.use(body_parser.urlencoded({
  extended: true
}));

app.use(express.static("public")); //to load css from public basically it will load all files in public

mongoose.connect("mongodb+srv://jainam:jsdjsd2000@cluster0-wy820.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//mongoose connection

const itemSchema = new mongoose.Schema({
  name: String
}); //defining schema of a database

const Item = mongoose.model("Item", itemSchema); //defining model

const item1 = new Item({
  name: "First item"
});

const item2 = new Item({
  name: "Second item"
});

const item3 = new Item({
  name: "Third item"
});

const listSchema = mongoose.Schema({
  name: String, //name of item
  items: [itemSchema] //array list of that item of this type
});

const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");

app.get("/", function(req, res) {
  // const day = date.getDate();
  Item.find({}, function(err, founditems) {
    if (founditems.length === 0) {
      Item.insertMany([item1, item2, item3], function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted 3 things");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        ListTitle: "Today",
        newListItems: founditems
      });
    }
  });

});

app.get("/:customListName", function(req, res) {
  const customListName = lodash.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundlists) {
    if (err)
      console.log(err);
    else {
      if (!foundlists) {
        //create a new list
        const list = new List({
          name: customListName,
          items: [item1, item2, item3]
        });
        list.save();
        res.redirect("/" + customListName);
      } else
        //show the existing list
        res.render("List", {
          ListTitle: foundlists.name,
          newListItems: foundlists.items
        });
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newitem;
  const listName = req.body.list;
  const newitem = new Item({
    name: itemName
  });
  if(listName==="Today"){
    newitem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundlist){
      foundlist.items.push(newitem);
      foundlist.save();
      res.redirect("/"+listName);
    });
  }
});

// app.post("/work", function(req, res) {
//   const workItem = req.body.newitem;
//   workItems.push(workItem);
//   res.redirect("/work");
// });

// app.get("/about", function(req, res) {
//   res.render("about");
// });
//
// app.post("/about", function(req, res) {
//   res.redirect("/about");
// });

app.post("/delete", function(req, res) {
  const listName = req.body.listname;
  if(listName==="Today"){
    Item.deleteOne({
      _id: req.body.check
    }, function(err) {
      if (!err) {
        console.log("Entry deleted");
      }
      res.redirect("/");
    });
  }else{
    List.findOneAndUpdade({name:listName},{$pull:{items:{_id:req.body.check}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.listen(3000 || process.env.PORT);

//
//https://still-coast-26534.herokuapp.com/
