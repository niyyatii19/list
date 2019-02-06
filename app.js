//jshint  esversion:6
const express = require("express");

const bodyParser = require("body-parser");

const app = express();

const _= require("lodash");

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-natsy:test123@cluster0-hbdlm.mongodb.net/to--do-listDB", {
  useNewUrlParser: true
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const itemSchema = {
  name: String
};

const Item = mongoose.model(
  "Item", itemSchema
);

const item1 = new Item({
  name: "Welcome to Your To-do-List"
});
const item2 = new Item({
  name: "Hit + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete the item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
             res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.get("/:customListName", function(req, res) {
  const requested = _.capitalize(req.params.customListName);
  List.findOne({name: requested}, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: requested,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + requested);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
      List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkBox;
  const listName= req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItemId}} }, function (err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has Started Successfully");
});
