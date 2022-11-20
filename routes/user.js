const { response } = require('express');
var express = require('express');
const { redirect } = require('express/lib/response');
const { ObjectId } = require('mongodb');
// const req = require('express/lib/request');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

let Country = require('country-state-city').Country;
let State = require('country-state-city').State;
let City = require('country-state-city').City;



const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render('user/home', { products, user, cartCount })
  })
});

router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false
  }
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {

    console.log(response);
    req.session.user = response
    req.session.user.loggedIn = true
    res.redirect('/')
  })
})

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    } else {
      req.session.userLoginErr = "Invalid username or password"
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})

// router.get('/members',verifyLogin,(req,res)=>{
//   // let products=await userHelpers.getCartProducts(req.session.user._id)
//   // let totalValue=0
//   // if(products.length>0){
//   //   totalValue=await userHelpers.getTotalAmount(req.session.user._id)
//   // }
//   // console.log(products)
//   res.render('user/members')

// })

router.get('/break-details', function (req, res) {
  res.render('user/break-details')
})

router.get('/home', function (req, res) {
  res.render('user/home')
})

router.get('/animals', (req, res) => {
  res.render('user/animals')
})

router.get('/animal-profile', (req, res) => {
  let category = req.query.category
  userHelpers.getAllAnimals(category).then((animals) => {
    console.log("categryyyyy", category);
    console.log("animalsssss", animals);
    res.render('user/animal-profile', { animals })
  })

})


router.get('/members', function (req, res) {
  res.render('user/members')
})

router.get('/add-profile', (req, res) => {
  userHelpers.getAllStates().then((states) => {
    console.log("statttteee", states);
    res.render('user/add-profile', { states })
  })


})

router.post('/add-profile', (req, res) => {
  console.log("reqqqbdyy",req.body);
  userHelpers.addProfile(req.body).then((userData) =>{
    console.log("udataa",userData);
    let image = req.files.image
    let x = userData.insertedId
    userData=x.toString()
    image.mv('./public/profile-images/'+userData+ '.jpg',(err)=>{
      if(!err){
        res.render('user/home')

      }else{
        console.log(err);
      }
    })
   



  })

})
router.post('/verify-payment', (req, res) => {
  console.log(req.body);
})

router.get('/add-animal', (req, res) => {

  res.render('user/add-animal')
}),

  router.post('/add-animal', (req, res) => {
    userHelpers.addAnimal(req.body).then((id) => {
      console.log("uuuuu", id)
      let image = req.files.image
      let y = id.insertedId
      id = y.toString()
      image.mv('./public/animal-images/' + id + '.jpg', (err) => {
        console.log("mmmm", id)
        if (!err) {
          res.render('user/animals')
        } else {
          console.log(err);
        }
      })

    })

  }),

  router.get('/profile', (req, res) => {
    let job = req.query.job
    userHelpers.getAllUsers(job).then((users) => {
      res.render('user/profile', { users })

    })
  })

router.get('/subprofile', (req, res) => {
  let job = req.query.job
  let category = req.query.category
  console.log("hohohooh", job);
  console.log("mmmmmmmm", job, category);
  userHelpers.getAllUsersCategory(job, category).then((users) => {


    res.render('user/profile', { users })

  })
})

router.get('/driver', function (req, res) {
  res.render('user/driver')
})



router.get('/job', function (req, res) {
  res.render('user/job')
})

router.get('/buyorsell', function (req, res) {
  res.render('user/buyorsell')
})

router.get('/buy-details', function (req, res) {
  res.render('user/buy-details')
})



router.post('/get-state', (req, res, next) => {
  console.log("Reached at user.js state ")
  console.log(req.body.countryCode)
  let states = State.getStatesOfCountry(req.body.countryCode)
  console.log("here are the states", states)
  res.json({ states })

})

router.post('/get-city', async (req, res, next) => {
  console.log("Reached at user.js  ")
  console.log("huhuhu", req.body.stateName)
  let stateName = req.body.stateName;
  console.log("queryyy", stateName);

  let cities = await userHelpers.getAllCities(stateName)

  console.log("here are the cities", cities)

  res.json({ cities })

})

router.post('/get-village', async (req, res, next) => {
  console.log("Reached at here  ")
  console.log("oooi", req.body.cityName)
  let cityName = req.body.cityName;
  console.log("yesss", cityName);

  let villages = await userHelpers.getAllVillages(cityName)

  

  res.json({ villages })

})


router.get('/notifications', function (req, res) {
  res.render('user/notifications')
})

router.get('/blog', function (req, res) {
  res.render('user/blog')
})



router.get('/add-person', function (req, res) {
  res.render('user/add-person')
})
router.get('/edit-profile', function (req, res) {
  res.render('user/edit-profile')
})

router.get('/messages', function (req, res) {
  res.render('user/messages')
})

router.get('/chat', function (req, res) {
  res.render('user/chat')
})

router.get('/member-details', function (req, res) {
  res.render('user/member-details')
})

router.get('/profile-visitors', function (req, res) {
  res.render('user/profile-visitors')
})

router.get('/organize-break', function (req, res) {
  res.render('user/organize-break')
})

router.get('/my-breaks', function (req, res) {
  res.render('user/my-breaks')
})

router.get('/home-old', function (req, res) {
  res.render('user/home-old')
})

router.get('/manage-break', function (req, res) {
  res.render('user/manage-break')
})

router.get('/success-page', function (req, res) {
  res.render('user/success-page')
})

router.get('/edit-break', function (req, res) {
  res.render('user/edit-break')
})

router.get('/join-requests', function (req, res) {
  res.render('user/join-requests')
})

router.get('/accepted-requests', function (req, res) {
  res.render('user/accepted-requests')
})

router.get('/declined-requests', function (req, res) {
  res.render('user/declined-requests')
})

router.get('/break-chat', function (req, res) {
  res.render('user/break-chat')
})

router.get('/break-requests', function (req, res) {
  res.render('user/break-requests')
})










router.get('/add-to-cart/:id', (req, res) => {
  console.log("api Call")
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    // res.redirect('/')
    res.json({ status: true })
  })
})

router.post('/change-product-quantity', (req, res, next) => {
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user })
})

//router.post('/place-order',async(req,res)=>{
//  console.log(req.body.userId)
// let products=await userHelpers.getCartProductList(req.body.userId)
// let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
// userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
//   if(req.body['payment-method']==='COD'){
//     res.json({codSuccess:true});
//    }else{
//     userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
//       res.json(response);
//     })
//   }
// })
//})

router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user: req.session.user })
})

router.get('/orders', async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders', { user: req.session.user, orders })
})

router.get('/view-order-products/:id', async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products', { user: req.session.user, products })
})

//router.post('/verify-payment',(req,res)=>{
//  console.log(req.body);
//  userHelpers.verifyPayment(req.body).then(()=>{
//    userHelpers.ChangePaymentStatus(req.body['order[receipt]']).then(()=>{
//      console.log("Payment successfull");
//      res.json({status:true})
//    })
//  }).catch((err)=>{
//   console.log(err);
//   res.json({status:false,errMsg:'error'})
//  })
//})

module.exports = router; 
