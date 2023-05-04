const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const multer = require('multer');
const Product = require('./Model/addProduct')
const StoreApplication = require('./Model/storeApplication')
const RequestCenter = require('./Model/requestCenter')
const Geneology = require('./Model/geneology')
const Node = require('./Model/node')
const axios = require('axios');
const { countReset } = require('console');
require('dotenv').config();
app.use('/addproduct', express.static(path.join(__dirname, 'uploads')));
const upload = multer({

  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  // fileFilter: (req, file, cb) => {
  //   // const allowedMimeTypes = ['image/jpeg', 'image/png','image/jpg'];
  //   if (!allowedMimeTypes.includes(file.mimetype)) {
  //     const error = new Error('Invalid file type. Only JPEG and PNG images are allowed.');
  //     error.status = 400;
  //     console.log(error);
  //     return cb(error);
  //   }
  //   cb(null, true);
  // }
});
const treeSchema = new mongoose.Schema({
  name: String,
  parent: mongoose.Types.ObjectId,
  leftChild: mongoose.Types.ObjectId,
  rightChild: mongoose.Types.ObjectId,
  level: Number,
  fcm : String,
  uniqueid : {type : Number , unique : true},
  email : {type : String , unique : true},
  password : String,
  country : String
});

const Tree = mongoose.model('Tree', treeSchema);
// Tree.collection.aggregate
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/getlength' , async(req,res)=>{
  const query = { parent: "641ec7737a67d4ef922eb0c0" };

// Find all the records that match the query object
const result = await Tree.find({parent : "641ec7737a67d4ef922eb0c0"});
console.log(result.length)
})

const levels = (length)=>{
  if(length < 2){
    console.log("level 1")
    return 1
  }
  else if(length < (2**2)+2){
    console.log("level 2")
    return 2
  }
  else if (length < (2**3)+6){
    console.log("level 3")
    return 3
  }
  else if(length < (2**4)+14){
    console.log("level 4")
    return 4
  }
  else if(length < (2**5)+30){
    console.log("level 5")
    return 5
  }
  else if(length < (2**6)+62){
    console.log("level 6")
    return 6
  }
}


var count = 0;
app.post('/addchild', async (req, res) => {
 
  const parent = req.body.parent;
  const childName = req.body.childName;
  const fcm = req.body.fcm;
  const result = await Tree.find({parent : parent});
  let parentNode = await Tree.findOne({ _id: parent });

  if (!parentNode) {
    parentNode = new Tree({ name: "Parent", level: 0 , fcm :"sdasd" , uniqueid : 1 });
    await parentNode.save();
    return res.status(200).send("Parent Created")
  }
  var count = await Tree.countDocuments({});
 count = count + 1;
const level =await levels(result.length)
  let newChild = new Tree({ name: childName, parent: parent, level: level , fcm : "4324324" , uniqueid : count  });

  if (!parentNode.leftChild) {
    parentNode.leftChild = newChild._id;
  } else if (!parentNode.rightChild) {
    parentNode.rightChild = newChild._id;
  } else {
   
    let leftChild = await Tree.findOne({ _id: parentNode.leftChild });
    let rightChild = await Tree.findOne({ _id: parentNode.rightChild });
    //console.log("Right child "+rightChild)

    const setChild = async (leftChild , rightChild)=>{

    if (!leftChild.leftChild) {
     // console.log("Hurrah1")
      leftChild.leftChild = newChild._id;
      leftChild.save();
    } else if (!leftChild.rightChild) {
     // console.log("Hurrah2")
      leftChild.rightChild = newChild._id;
      leftChild.save();
    }
    else if(!rightChild.leftChild){
    //  console.log("Hurrah3")
      rightChild.leftChild = newChild._id;
      rightChild.save()
    }
    else if(!rightChild.rightChild){
     // console.log("Hurrah4")
      rightChild.rightChild = newChild._id;
      rightChild.save();
    }
    else {
    //  console.log("Hurrah5")
      var grandChildLeft 
      var grandChildRight 
      if(count < 2){
      //  console.log("count "+count)
        grandChildLeft = await Tree.findOne({ _id: leftChild.leftChild });
        grandChildRight = await Tree.findOne({ _id: leftChild.rightChild });
        count++;
        setChild(grandChildLeft , grandChildRight)
      }
      else{
       // console.log("count "+count)
       // console.log("right grand child")
        grandChildLeft = await Tree.findOne({ _id: rightChild.leftChild });
        grandChildRight = await Tree.findOne({ _id: rightChild.rightChild });
        setChild(grandChildLeft , grandChildRight)
      }
      // grandChildLeft.leftChild = newChild._id;
      // grandChildLeft.save();
    }
  }
  setChild(leftChild, rightChild)
  }

  await newChild.save();
  await parentNode.save();

  return res.status(200).json({ message: "Child added successfully" });
});


app.post('/addNode', async (req, res) => {
 
  const parent = req.body.parent;
  const fcm = req.body.fcm;
  const email = req.body.email;
  const password = req.body.password;
  const country = req.body.country;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (emailRegex.test(email)) {
} else {
  return res.status(400).send("Email is not valid")
}

if(password.length < 8){
  return res.status(400).send("Password Too Short")
}
  // const result = await Tree.find({parent : parent});
  let parentNode = await Tree.findOne({ email: email });
  var count = await Tree.countDocuments({});

  count = count + 1;
  if (!parentNode) {
    parentNode = new Tree({ name: parent, level: 0 , fcm : fcm , uniqueid : count , email : email.toLowerCase() , password : password , country : country });
    await parentNode.save();
    if(count === 1){
      await axios.post('http://localhost:5000/addNodeOnTree', {
        value: count,
        parent: parentNode._id
      })
        .then(response => {
          console.log(response.data);
        })
        .catch(error => {
          console.log(error);
        })
    }
    return res.status(200).send("Parent Created")
  }
  else{
    return res.status(400).send("Email already exists")
  }
  



});

app.post('/login', async (req, res) => {
  // Get username and password from request body
  const { email, password , token } = req.body;

  // Find user in users collection
  try {
    // Find user in users collection
    const user = await Tree.findOne({ email, password });

    if (user) {
      // Create and sign a JWT token
      user.fcm = token;
      await user.save()
      return res.status(200).send(user);
      // Return the token to the client

    } else {
      // Return an error message if the login fails
      return res.status(401).send('Invalid login credentials' );
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
  });


  app.post('/updatecountry', async (req, res) => {
  // Get username and password from request body
  const { uniqueid , country } = req.body;

  // Find user in users collection
  try {
    // Find user in users collection
    const user = await Tree.findOne({ uniqueid });

    if (user) {
      // Create and sign a JWT token
      user.country = country;
      await user.save()
      return res.status(200).send(user);
      // Return the token to the client

    } else {
      // Return an error message if the login fails
      return res.status(401).send('Not Update' );
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
  });



  app.post('/sendrequest', async (req, res) => {
    // Get username and password from request body
    const { uniqueid , senderUniqueid , position , placementId } = req.body;
    // Find user in users collection
    const exitsOrNotInGeneology = await Geneology.findOne({
placementnode : senderUniqueid })
if(!exitsOrNotInGeneology){
  return res.status(405).send("Not exist in geneology")
}
    try {
      if(uniqueid === senderUniqueid){
        return res.status(403).send("You can't send request to your own account")
      }
      const exitsOrNot = await RequestCenter.findOne({requestSenderUniqueId : senderUniqueid , requestReceiverUniqueId : uniqueid })
      // Find user in users collection
      const user = await Tree.findOne({ uniqueid });
      const user2 = await Tree.findOne({uniqueid : senderUniqueid})
      if(exitsOrNot){
        return res.status(402).send("Request Already Exist")
      }
      else{
      if (user) {
        // Create and sign a JWT token
        const fcm = {
          token : user.fcm
        }
        console.log("User2 "+user2)
        const newrequest = new RequestCenter({ requestSenderUniqueId : senderUniqueid, requestSenderObjectId: user2._id, requestReceiverUniqueId : uniqueid , requestReceiverObjectId: user._id, position : position , placementId : placementId , accept: 0 });
        await newrequest.save()
        return res.status(200).send(fcm);
        // Return the token to the client
      } else {
        // Return an error message if the login fails
        return res.status(401).send('User Not Exist' );
      }
    }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
    });


    app.post('/getrequest', async (req, res) => {
    const { receiverId } = req.body;
    console.log(receiverId)
    try {
      const user = await RequestCenter.find({ requestReceiverObjectId : receiverId , accept:0 });
      if (user) {
        return res.status(200).send(user);
      } else {
        // Return an error message if the login fails
        return res.status(401).send('No Request' );
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
    });

    app.post('/deleterequest', async (req, res) => {
      const { receiverId , value } = req.body;
      try {
        const user = await RequestCenter.deleteOne({ requestSenderObjectId : receiverId , requestReceiverUniqueId:value});
        if (user) {
          return res.status(200).send(user);
        } else {
          // Return an error message if the login fails
          return res.status(401).send('No Request' );
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
      });


    app.post('/addproduct', upload.array('images', 5), async (req, res) => {
      try {
        const { productname,f3Price,capital,price,f3prices,usdtprices,qty,totalfiatprice,unit,contactnumber,housenumber,description , seller } = req.body;
        const images = req.files.map(file => file.filename);
        const product = new Product({productname,f3Price,capital,price,f3prices,usdtprices,qty,totalfiatprice,unit,contactnumber,housenumber,description, images , seller });
        await product.save();
        return res.status(200).send("Product Add Successfuly");
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error creating product' });
      }
    });


    app.post('/storeapplication', async (req, res) => {
      console.log("rrr");
      try {
        const { storename,city,localpalace,street,building,seller } = req.body;
        var approve = 0
        const storeapplication = new StoreApplication({storename,city,localpalace,street,building,approve,building,seller });
        await storeapplication.save();
        return res.status(200).send("Store Application Submit");
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error Submit Store Application' });
      }
    });

    app.post('/getallproducts', async (req, res) => {
      const {seller} = req.body
      try {
        // Find user in users collection
        const products = await Product.find({ seller });
    
        if (products) {
          // Create and sign a JWT token
          return res.status(200).send(products);
          // Return the token to the client
        } else {
          // Return an error message if the login fails
          return res.status(401).send('No Product Available' );
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });



    const findEmptyChildPosition = async (node) => {
      if (!node.left) {
        return { node, position: 'left' };
      }
      if (!node.right) {
        return { node, position: 'right' };
      }
    
      for (let i = 1; i <= 15; i++) {
        const nodes = await Node.find({ level: i }).populate('left right');
        for (const currentNode of nodes) {
          if (!currentNode.left) {
            return { node: currentNode, position: 'left' };
          }
          if (!currentNode.right) {
            return { node: currentNode, position: 'right' };
          }
        }
      }
    
      return null;
    };

// Add a node to the tree
app.post('/addNodeOnTree', async (req, res) => {
  try {
    const { value , parent , parentid , position } = req.body;
    console.log("value "+value)
    const rootNode = await Node.findOne({ level: 0 });
    const existOrNot = await Node.findOne({ value : value})
    const requestExist = await RequestCenter.findOne({requestReceiverUniqueId:value,requestSenderObjectId:parent})
if(existOrNot){
  return res.status(402).send("Node Already exists")
}
else{
 

    if (!rootNode) {
      const newNode = new Node({ value, level: 0 });
      const newTree = new Geneology({placementnode : value , level : 0})
      await newNode.save();
      await newTree.save();
      return res.json({ msg: 'Root node created successfully', node: newNode });
    }

    const emptyPosition = await findEmptyChildPosition(rootNode);

    if (!emptyPosition) {
      return res.status(400).json({ msg: 'The tree has reached its maximum depth of 5 levels' });
    }

    if(position === "Left"){
      const geneNode = await Geneology.findOne({ placementnode: parentid });
      if(geneNode){
        if(!geneNode.leftnode){
          geneNode.leftnode = value
          await geneNode.save()
        }
        else{
          return res.status(403).send("Left position is already assigned")
        }
      }
    }
    else if(position === "Right"){
      const geneNode = await Geneology.findOne({ placementnode: parentid });
      if(geneNode){
        if(!geneNode.rightnode){
          geneNode.rightnode = value
          await geneNode.save()
        }
        else{
          return res.status(403).send("Right position is already assigned")
        }
      }
    }
    else{
     return res.status(500).send('Server error');
    }

    if(requestExist){
      requestExist.accept = 1;
      await requestExist.save();
    }

    const newNode = new Node({ value, level: emptyPosition.node.level + 1 , parent : parent});
    const newTree = new Geneology({placementnode:value, parentnode:parentid ,  level: emptyPosition.node.level + 1 })
    await newNode.save();
    await newTree.save();

    if (emptyPosition.position === 'left') {
      emptyPosition.node.left = newNode._id;
    } else {
      emptyPosition.node.right = newNode._id;
    }
    await emptyPosition.node.save();

    res.json({ msg: 'Node added successfully', node: newNode });
  ///////////////
  } }
  catch (err) {
    console.error(err.message)
      res.status(500).send('Server error'+err.message);
    }
    });


    app.get('/alltree', async (req, res) => {
      try {
        const rootNode = await Node.findOne({ level: 0 })
          .populate('left right')
          .exec();
    
        if (!rootNode) {
          return res.status(404).json({ msg: 'Root node not found' });
        }
    
        const getTree = async (node) => {
          if (!node) return null;
    
          const left = node.left ? await getTree(await Node.findById(node.left).populate('left right').exec()) : null;
          const right = node.right ? await getTree(await Node.findById(node.right).populate('left right').exec()) : null;
    
          return {
            value: node.value,
            level: node.level,
            left,
            right,
          };
        };
    
        const tree = await getTree(rootNode);
        res.json(tree);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    });



    app.post('/getchilds', async (req, res) => {
      const {parent} = req.body
      try {
        // Find user in users collection
        const childs = await Node.find({ parent }).limit(14);
    
        if (childs) {
          // Create and sign a JWT token
          return res.status(200).send(childs);
          // Return the token to the client
        } else {
          // Return an error message if the login fails
          return res.status(401).send('No Child Exist' );
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });



    app.post('/updatequantity', async (req, res) => {
      // Get username and password from request body
      const { productid , sellerid , quantity } = req.body;
    
      // Find user in users collection
      try {
        // Find user in users collection
        const product = await Product.findOne({ _id : productid , seller : sellerid });
    
        if (product) {
          // Create and sign a JWT token
          const previousQuantity = parseInt(product.qty);
          const amountInt = parseInt(quantity)
          product.qty = previousQuantity+amountInt;
          await product.save()
          return res.status(200).send(product);
          // Return the token to the client
    
        } else {
          // Return an error message if the login fails
          return res.status(401).send('Not Update' );
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
      });



      app.post('/deleteproduct', async (req, res) => {
        // Get username and password from request body
        const { productid , sellerid} = req.body;
      
        // Find user in users collection
        try {
          // Find user in users collection
          const product = await Product.deleteOne({ _id : productid , seller : sellerid });
      
          if (product) {
            // Create and sign a JWT token
            return res.status(200).send(product);
            // Return the token to the client
      
          } else {
            // Return an error message if the login fails
            return res.status(401).send('Product not found' );
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        }
        });
        
        
        app.post('/getChildsOfGeneology', async (req, res) => {
          const uniqueId = req.body.placementId
          try {
            const result = await Geneology.find({
              placementnode : uniqueId
            }).exec();
        if(result){
          try{
          const leftNode = result[0].leftnode
          if(leftNode){
            const result2 = await Geneology.find({
              placementnode : leftNode
            }).exec();
             result.push(...result2)
          }
          else{
            result.push(...[{placementnode:0}])
          }
        }
        catch(error){
        }
        try{
          const rightNode = result[0].rightnode
          if(rightNode){
            const result2 = await Geneology.find({
              placementnode : rightNode
            }).exec();
             result.push(...result2)
          }
          else{
            result.push(...[{placementnode:0}])
          }
        }
        catch(error){

        }
        }
        else{
          console.log("Id not found")
        }
//////////////for left node
if(result.length > 0){
        if(result[1].placementnode === 0){
          console.log("Not exist on left")
        }
        else{
          ///left node
          try{
            const leftNode = result[1].leftnode
            if(leftNode){
              const result2 = await Geneology.find({
                placementnode : leftNode
              }).exec();
               result.push(...result2)
            }
            else{
              result.push(...[{placementnode:0}])
            }
          }
          catch(error){

          }
          ///right node
          try{
            const rightNode = result[1].rightnode
            if(rightNode){
              const result2 = await Geneology.find({
                placementnode : rightNode
              }).exec();
               result.push(...result2)
            }
            else{
              result.push(...[{placementnode:0}])
            }
          }
          catch(error){

          }
        }
////////////for right node
        if(result[2].placementnode === 0){
          console.log("Not exist on right")
        }
        else{
                    ///left node
                    try{
                      const leftNode = result[2].leftnode
                      if(leftNode){
                        const result2 = await Geneology.find({
                          placementnode : leftNode
                        }).exec();
                         result.push(...result2)
                      }
                      else{
                        result.push(...[{placementnode:0}])
                      }
                    }
                    catch(error){
          
                    }
                    ///right node
                    try{
                      const rightNode = result[2].rightnode
                      if(rightNode){
                        const result2 = await Geneology.find({
                          placementnode : rightNode
                        }).exec();
                         result.push(...result2)
                      }
                      else{
                        result.push(...[{placementnode:0}])
                      }
                    }
                    catch(error){
          
                    }
        }
      }
      else{
        console.log("Not found")
        result.push(...[{placementnode:uniqueId}])
      }

            res.send(result);
          } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred while retrieving the data');
          }
        });


           app.post('/getAllChildsOfGeneology', async (req, res) => {
          try {
            const result = await Geneology.find({}).exec()
        
            res.send(result);
          } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred while retrieving the data');
          }
        });




// Define an endpoint that accepts a placementId parameter and returns the desired records
// Define an endpoint that accepts a placementId parameter and returns the desired records
// Define an endpoint that accepts a placementId parameter and returns the desired records
// Define an endpoint that accepts a placementId parameter and returns the desired records
// Define an endpoint that accepts a placementId parameter and returns the desired records
app.post('dhaka', async (req, res) => {
  const { placementId } = req.body;

  try {
    // Find the geneology with the given placementId value
    const currentGeneology = await Geneology.findOne({ placementnode: placementId });
  
    if (currentGeneology) {
      // Create a helper function to recursively find all descendants of a geneology and its children
      const findDescendants = async (geneology) => {
        const leftGeneology = geneology.leftnode && await Geneology.findOne({ placementnode: geneology.leftnode });
        const rightGeneology = geneology.rightnode && await Geneology.findOne({ placementnode: geneology.rightnode });
        const descendants = [leftGeneology, rightGeneology].filter(child => !!child);
        if (descendants.length === 0) {
          return [];
        }
        const descendantNodes = descendants.flatMap(async descendant => {
          const leftDescendants = await findDescendants({ leftnode: descendant.placementnode });
          const rightDescendants = await findDescendants({ rightnode: descendant.placementnode });
          return [descendant, ...leftDescendants, ...rightDescendants];
        });
        return Promise.all(descendantNodes);
      }
      
      // Find all descendants of the current geneology and its children
      const descendants = await findDescendants(currentGeneology);
      
      // Create an array to store the desired records
      const records = [currentGeneology, ...descendants];
      
      // Return the desired records in the response
      res.json(records);
    } else {
      res.status(404).send('Geneology not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

async function searchTree(value, target) {
  if (value === null || value === undefined) {
    return false;
  }

  const node = await Geneology.findOne({ placementnode:value });

  if (!node) {
    return false;
  }

  if (node.placementnode.toString() === target) {
    console.log("founds")
    return true;
  }
  console.log(node)
  const leftResult = await searchTree(node.leftnode, target);
  const rightResult = await searchTree(node.rightnode, target);

  return leftResult || rightResult;
}


app.post('/search', async (req, res) => {
  const { value, target } = req.body;

  try {
    const found = await searchTree(value, target);
    console.log(found);
    if (found) {
      res.status(200).json({ message: 'Found' });
    } else {
      res.status(400).json({ message: 'Not Found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
});



// app.post('/getprice', async (req, res) => {
//   const { currencyCode } = req.body;

//   var myHeaders = new Headers();
//   myHeaders.append("apikey", "t6Mn3qVK0hU3PB1CGkcyAhZ2qADAGcom");
  
//   var requestOptions = {
//     method: 'GET',
//     redirect: 'follow',
//     headers: myHeaders
//   };

//   var requestForUSDT = {
//     method: 'GET',
//   }
//   try {
//     const response = await fetch(`https://api.apilayer.com/exchangerates_data/convert?to=USD&from=${currencyCode}&amount=1`, requestOptions);
//     const data = await response.json()
//     .then(async data => {
//       const result = data.result;
//       console.log(result)
//       const price = {
//         usdPrice : result
//       }
//       const response2 = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd` , requestForUSDT );
//       const data2 = await response2.json()
//       .then(data2 =>{
//         const result2 = data2["tether"].usd
//         console.log(result2)
//         const finalPrice = result2*result;
//         console.log(finalPrice.toFixed(5))
//         const resOfUsdt = {
//           usdt : finalPrice.toFixed(5)
//         }
        
//       })
//   })
//     // return res.status(200).send(data);
//   } catch (error) {
//     console.log('error', error);
//     res.status(500).send('Internal server error');
//   }
  
// //  await fetch(`https://api.apilayer.com/exchangerates_data/convert?to=USD&from=${currencyCode}&amount=1`, requestOptions)
// //     .then(response => response.text())
// //     .then(
// //       result => console.log(result)

// //       )
// //     .catch(error => console.log('error', error));
// });

app.post('/getprice', async (req, res) => {
  const { currencyCode } = req.body;

  var myHeaders = new Headers();
  myHeaders.append("apikey", "t6Mn3qVK0hU3PB1CGkcyAhZ2qADAGcom");
  
  var requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: myHeaders
  };

  var requestForUSDT = {
    method: 'GET',
  }
  try {
    const response = await fetch(`https://api.apilayer.com/exchangerates_data/convert?to=${currencyCode}&from=USD&amount=1`, requestOptions);
    const data = await response.json()
    .then(async data => {
      const result = data.result;
      console.log(result)
      const price = {
        usdPrice : result
      }
      const response2 = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd` , requestForUSDT );
      const data2 = await response2.json()
      .then(data2 =>{
        const result2 = data2["tether"].usd
        console.log(result2)
        const finalPrice = result2*result;
        console.log(finalPrice.toFixed(5))
        const resOfUsdt = {
          usdt : finalPrice.toFixed(5)
        }
        return res.status(200).json(resOfUsdt);
      })
  })
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Internal server error');
  }
});




  app.listen(5000, () => {
  console.log('Server started on port 5000');
});
