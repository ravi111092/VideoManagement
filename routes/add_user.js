var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var multer = require('multer');
var user = require('../models/user');
var auth = require('../config/jsonwebtoken');
const saltRound = 10;
// file filter when file is uploading to cloudinary
var upload2 = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
}).single('file');
router.post('/register', upload2, checklogin, isAdmin, async function (req, res, next) {
  console.log(req.body);
  if (req.body.email) {
    user.findOne({ email: req.body.email }, function (err, users) {
      if (users) {
        res.json({ status: false, error: "Email already exists." });
      }
      else {
        if (err) throw err;
        user.create({
          fullname: req.body.fullname,
          email: req.body.email,
          password: req.body.password,
          confirmpass: req.body.password,
          admin: false  // true only for admin
        }, function (err, data) {
          if (err) throw err;
          else {
            //   send_email.sendMail(null, data.email, null, data.register_otp);
            console.log("data are " + data);
            res.json({
              status: true,
              success: "User Successfully registered !!.",
              response: { user: { _id: data._id, fullname: data.fullname, email: data.email } }
            });
          }
        });
      }

    })
  } else {
    res.json({ status: false, error: "Email must required.." });
  }
});
router.post('/login', upload2, async function (req, res, next) {
  user.findOne({ email: req.body.email }, async function (err, data) {
    if (data) {
      // console.log(data.password);
      if (err) return next({ errors: [{ message: err.toString() }] });
      if (req.body.password != data.password) {
        res.status(200).send({ status: false, error: "Password does'nt match." });
      }
      else {
        //   if (data.is_email_verified) {
        //     console.log(data.is_email_verified);
        var auth_token = await auth.encoded(data);
        req.session.userId = auth_token;
        req.session.email = data.email;
        req.session.admin = data.admin;
        console.log(data)
        res.json({
          status: true, success: "Login successfully.",
          response: { auth_token: auth_token, user: { _id: data._id, email: data.email, admin: data.admin, name:data.fullname } }
        });
        //   } else {
        //     console.log(data.is_email_verified);
        //     res.json({ status: false, error: "Email not verified" });
        //   }
      }
    } else {
      res.json({ status: false, error: "Email Does'nt match." });

    }
  })
});

router.get('/add_user', checklogin, isAdmin, function (req, res) {
  res.render('admin/add_user');
});


//Update users with ID
router.post('/edit_user/:id', upload2, async function (req, res, next) {
  console.log(req.params.id);
  user.findOne({ _id: req.params.id }, function (err, data) {
    if (err) {
      res.json({
        status: false,
        error: err
      })
    } else {
      if (data) {
        console.log(data)
        user.updateOne({ _id: req.params.id }, {
          $set: {
            fullname: req.body.fullname ? req.body.fullname : data.fullname,
            email: req.body.email ? req.body.email : data.email,
            password: req.body.password ? req.body.password : data.password,
            confirmpass: req.body.password ? req.body.password : data.password,
            admin: false
          }
        }, function (err, data1) {
          if (err) throw err;
          else {
            console.log('successfully updated password....');
            res.json({
              status: true,
              message: 'Successfully updated...'
            })
          }
        })
      } else {
        res.json({
          status: false,
          error: "No Such data found.."
        })
      }
    }
  })
})



////////////// checking the jwt token 
function checklogin(req, res, next) {
  try {
    const userjwt = req.session.userId;
    console.log("fisrt checkingg. userjwt : " + userjwt);
    if (userjwt) {
      auth.decoded(userjwt);
      next();
    }
    else {
      console.log("userjwt in else block :" + userjwt)
      res.redirect('/')
    }
  } catch (err) {
    console.log(err)
    res.status(401).json({ message: 'No Authentication....' })
  }

};

function isAdmin(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect('/')
  }
}

module.exports = router;