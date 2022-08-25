const {response}=require('express');
var express = require('express');
const { redirect } = require('express/lib/response');
// const req = require('express/lib/request');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const verifyLogin = (req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/',async function (req, res, next) {
  let user = req.session.user
  let cartCount=null
  if(req.session.user){
  cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render('user/home', { products, user, cartCount})
  })
});

router.get('/login',(req, res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginErr":req.session.userLoginErr})
    req.session.userLoginErr=false
  }
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.user=response
    req.session.user.loggedIn=true
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
      req.session.userLoginErr="Invalid username or password"
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user=null
  req.session.userLoggedIn=false
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

router.get('/dashboard', function (req, res) {
  res.render('user/dashboard')
})


router.get('/members', function (req, res) {
  res.render('user/members')
})


router.get('/profile', function (req, res) {
  res.render('user/profile')
})

router.get('/notifications', function (req, res) {
  res.render('user/notifications')
})

router.get('/blog', function (req, res) {
  res.render('user/blog')
})

router.get('/add-profile', function (req, res) {
  res.render('user/add-profile')
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

router.get('/driver', function (req, res) {
  res.render('user/driver')
})







router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api Call")
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    // res.redirect('/')
    res.json({status:true})
  })
})

router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.get('/place-order',verifyLogin,async(req, res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})

router.post('/place-order',async(req,res)=>{
  console.log(req.body.userId)
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true});
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response);
      })
    }
  })
})

router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})

router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.ChangePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("Payment successfull");
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:'error'})
  })
})

module.exports = router; 
