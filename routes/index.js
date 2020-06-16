var admin_creadential = require('../models/admin_creadential');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var cloudinary = require('cloudinary').v2;
var video_gallery = require('../models/video_gallery');
var add_category = require('../models/add_category');
var cloudy = require('../cloudinary/index');
var timestamp = require('../models/timestamp');
var add_tag = require('../models/add_tag');
var moment = require('moment');
var user = require('../models/user');
var auth = require('../config/jsonwebtoken');
var logs = require('../models/logs');
// file filter when file is uploading to cloudinary
var upload2 = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
}).single('file');
// upload files on digitalOcean 
// image uploading to digitalOcean
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
var digitalOcean_keys = require('../config/auth');

aws.config.update({
  accessKeyId: digitalOcean_keys.accessKeyId,
  secretAccessKey: digitalOcean_keys.secretAccessKey
})

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint
});

// Change bucket property to your Space name
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'videogallery',
    acl: 'public-read',
    key: function (request, file, cb) {
      // console.log(file);
      cb(null, file.originalname);
    }
  })
}).single('file');
//

router.get('/', function (req, res) {

    res.render('login');

});
router.get('/admin', checklogin, function (req, res, next) {
  res.render('admin/video_upload', { title: 'Express' });
});

router.get('/category_page', checklogin, function (req, res, next) {
  res.render('admin/category', { title: 'Express' });
});

router.get('/account_setting', checklogin, function (req, res, next) {
  res.render('account_setting', { title: 'Express' });
});

// create admin creadential

// {
// 	"local.username" :  "sujeet",
//  	"local.password" : "sujeet@123" postman me
// }
router.post('/create_admin', async function (req, res) {
  console.log(req.body)
  admin_creadential.create(req.body, function (err, data) {
    if (err) {
      res.json({
        status: false,
        message: err
      })
    } else {
      res.json({
        status: true,
        data: data
      })
    }
  })
})

//
// upload video data to database and video direct upload to cloudinary from front-end
router.post('/video_gallery', checklogin, async function (req, res, next) {
  console.log("req.session.userId  : "+req.session.userId );
  console.log(" req.session.email : "+ req.session.email)
  upload(req, res, function (error, data) {
    // console.log(req.files.originalname);
    var category = (req.body.category).split(',');
    var sub_category = (req.body.subcategory).split(',');
    var tag = (req.body.tag).split(',');
    // console.log(req.body)
    console.log(req.file);
    if (error) {
      console.log(error);
      res.status(200).send({ status: false, error: err });
    }
    console.log('File uploaded successfully.');


    // console.log(request);
    // const file = req.file;
    // console.log(file)
    var file_name = [];
    console.log(file_name);
    video_gallery.create({
      title: req.body.title,
      video: req.body.download_link,
      description: req.body.description,
      tag: tag,
      category: category,
      subcategory: sub_category,
      download_link: req.body.download_link
    }, function (err, data) {
      if (err) {
        res.json({
          status: false,
          message: err
        })
      }
      else {
        console.log("sssssssssssssssssssssssssssssssss" + data)
        user.findOne({email : req.session.email}, function(err, data1){
          if(err){
            res.json({
              status : false,
              error : err
            })
          }else{

            /// Creating indian time here
            var moment = require('moment-timezone');
            var today = new Date();
            var m_today = moment(today);
            var indian_time = m_today.tz('Asia/kolkata').format('DD/MM/YYYY  hh:mm:ss a');
            console.log(indian_time)

            ///
            console.log(data1);
            logs.create({
              username : data1.fullname,
              email : data1.email,
              video_name : req.file.originalname,
              size : req.file.size,
              time : indian_time
            }, function(err, data2){
              if(err){
                res.json({
                  status : false,
                  error : err
                })
              }else{
                console.log("logslogslogs created...");
                res.json({
                  status: true,
                  message: 'Successfully created...',
                  data: data
                })
              }
            })
          }
        })
      }
    })
    // console.log(response);
    // response.redirect('/success')
    // response.redirect(`https://videogallery.nyc3.digitaloceanspaces.com/${request.files[0].originalname}`);
  });
});

// add category to add_category collection 
router.post('/add_category', checklogin, upload2, async function (req, res, next) {
  console.log(req.body);
  if (req.body) {
    add_category.create({
      category: req.body.category,
      subcategory: req.body.subcategory
    }, function (err, data) {
      if (err) {
        res.json({
          status: false,
          message: err
        })
      } else {
        console.log(data)
        res.json({
          status: true,
          data: data
        })
      }
    })
  } else {
    res.json({
      status: false,
      message: 'input must require..'
    })
  }
});

// add tag to add_tag collection 
router.post('/add_tag', checklogin, upload2, async function (req, res, next) {
  console.log(req.body.tag);
  var tag_arr = (req.body.tag).split(',');
  console.log(tag_arr);
  var l = tag_arr.length;
  if (req.body.tag == '') {
    console.log("blankccccccccccc")
    res.json({
      status: false,
      message: 'input must require..'
    })
  } else {
    for (var i = 0; i < l; i++) {
      console.log("aaaaaaaaaaaaaaaaaaaaa : " + l)
      console.log(tag_arr[i]);
      add_tag.create({
        tag: tag_arr[i]
      }, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data)
        }
      })
    }
    res.json({
      status: true,
      message: 'Successfully Added tag...'
    })
  }

  // if(req.body){
  //   // add_tag.create({
  //   //  tag : req.body.tag
  //   // }, function (err, data) {
  //   //   if (err) {
  //   //     res.json({
  //   //       status: false,
  //   //       message: err
  //   //     })
  //   //   } else {
  //   //     console.log(data)
  //   //     res.json({
  //   //       status: true,
  //   //       data: data
  //   //     })
  //   //   }
  //   // })
  // }else{

  // }
});

// get all tag
router.get('/get_all_tag', checklogin, async function (req, res, next) {
  add_tag.find(function (err, data) {
    if (err) {
      res.json({
        status: false,
        message: err
      })
    } else {
      res.json({
        status: true,
        data: data,
        message: 'Successfully get tag...'
      })
    }
  })
})

// get all video_gallery data
router.get('/get_all', checklogin, function (req, res) {
  video_gallery.find(function (err, data) {
    if (err) {
      res.json({
        status: false
      })
    } else {
      res.json({
        status: true,
        data: data,
        message: "Successfully get data....."
      })
    }
  })
});

router.get('/all_video', checklogin, function (req, res) {
  res.render('index2_test')
})

router.get('/all_video_admin',isAdmin, checklogin, function(req, res){
  res.render('index3_test')
})

// get video_gallery data and pagination 
// only 6 data given at a time 
router.get('/video_gallery/:page', checklogin, upload2, async function (req, res) {
  console.log(req.body);
  var perPage = 6;
  var page = req.params.page || 1
  video_gallery
    .find({}).sort({ "_id": -1 }) // deceding order -1
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, data) {
      // console.log(products);
      video_gallery.countDocuments().exec(function (err, count) {
        console.log("count : " + count);
        if (err) return next(err)
        res.json({
          data: data.reverse(),
          current: page,
          pages: Math.ceil(count / perPage)// example Math.ceil(11/3) == 4
        })
      })
    })
})


//////////////////////// get all category
router.get('/get_all_category', checklogin, function (req, res) {
  add_category.find(function (err, data) {
    if (err) {
      res.json({
        status: false,
        message: err
      })
    }
    else {
      res.json({
        status: true,
        data: data
      })
    }
  })
});
router.post('/add_sub_category/:id', checklogin, upload2, async function (req, res) {
  var id = req.params.id;
  var array_subc = req.body.sub;
  if (id) {
    add_category.findOneAndUpdate({ _id: id }, { $push: { subcategory: array_subc } },
      function (err, data) {
        if (err) {
          res.json({
            status: false,
            message: err
          })
        } else {

          res.json({
            status: true,
            data: data,
            message: 'Successfully created Subcategory'
          })
        }
      }
    )
  } else {
    res.json({
      status: false,
      message: 'parameter must be require....'
    })
  }
})

// search data based on title, tag, description using regex 
// pagination also working.. only six data given per pages
router.post('/search_bar/:page', checklogin, upload2, async function (req, res, next) {
  console.log(req.body)
  console.log("req.params.page : " + req.params.page)
  var perPage = 6;
  var page = req.params.page || 1
  video_gallery.find({
    $or: [{ title: { "$regex": "^" + req.body.title, $options: 'i' } },
    { description: { "$regex": "^" + req.body.title, $options: 'i' } },
    { tag: { "$regex": "^" + req.body.title, $options: 'i' } }
    ]
  }).sort({ "_id": -1 }) // decending order
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, data) {
      video_gallery.countDocuments({
        $or: [{ title: { "$regex": "^" + req.body.title, $options: 'i' } },
        { description: { "$regex": "^" + req.body.title, $options: 'i' } },
        { tag: { "$regex": "^" + req.body.title, $options: 'i' } }
        ]
      }).exec(function (err, count) {
        if (err) return next(err);
        res.json({
          status: true,
          data: data.reverse(),
          current: page,
          pages: Math.ceil(count / perPage),
          count: count
        })
      })
    })

});

// search all title 

router.post('/all_title_search', checklogin, upload2, async function (req, res, next) {
  console.log(req.body)
  video_gallery.find({
    $or: [{ title: { "$regex": "^" + req.body.title, $options: 'i' } },
    { description: { "$regex": "^" + req.body.title, $options: 'i' } },
    { tag: { "$regex": "^" + req.body.title, $options: 'i' } }
    ]
  }, function (err, data) {
    if (err) throw err;
    else {
      res.json({
        status: true,
        data: data.reverse(),
        message: 'Successfully get all data...'
      })
    }
  })
})

// search data when search button click but it is not including the project
router.post('/search_bar_2', checklogin, upload2, async function (req, res, next) {
  console.log(req.body)
  video_gallery.find({
    $or: [{ title: { "$regex": "^" + req.body.title + "$" } },
      // {tag  : { "$regex": "^" +req.body.tag , $options: 'i' }}, 
      // {description  : { "$regex": "^" +req.body.title , $options: 'i' }}
    ]
  }, function (err, data) {
    if (err) {
      try {
        console.log('error not working...');
      } catch (er) {
        console.log(er)
      }
    } else {
      res.json({
        data
      })
    }

  })

});


// filter data when single and multiple tags  clicked 
// pagination also work only six data allowed per page
router.post('/filter_data/:page', checklogin, upload2, async function (req, res, next) {
  console.log(req.body)
  console.log(req.body.cat);
  var cat = (req.body.cat).split(','); // change 19/03/2020 cat == tag 
  var sub_cat = req.body.sub_cat; // change 19/03/2020 sub_cat == tag
  console.log(cat)
  console.log("req.params.page : " + req.params.page)
  var perPage = 6;
  var page = req.params.page || 1
  video_gallery.find({ tag: { $all: cat } }).sort({ "_id": -1 })
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, data) {
      video_gallery.countDocuments({ tag: { $all: cat } }).exec(function (err, count) {
        if (err) {
          console.log(err);
          return next(err);
        }
        else {
          console.log("count" + count)
          res.json({
            status: true,
            data: data.reverse(),
            current: page,
            pages: Math.ceil(count / perPage),
            count: count
          })
        }

      })
    })

})


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

router.get('/upload_admin', checklogin,isAdmin, function(req, res, next){
  res.render('admin/video_upload_2')
})
router.get('/logs', checklogin,isAdmin, function(req, res, next){
  res.render('admin/logs');
});


router.get('/get_users',checklogin, isAdmin, async function(req,res,next){
  user.find((err,data)=>{
    if(err){
      res.json({
          status : false,
          error : err
      })
  }else{
      res.json({
          status : true,
          data : data
      })
  }
})
});

router.get('/get_logs',checklogin,isAdmin,async function(req, res, next){
  logs.find(function(err, data){
        if(err){
            res.json({
                status : false,
                error : err
            })
        }else{
            res.json({
                status : true,
                data : data
            })
        }
    })
});

router.post('/delete_user/:id', async function(req, res,next){

  console.log(req.params.id);

   user.findOne({_id:req.params.id},function(err, data){
    if(err){
      res.json({
          status : false,
          error : err
      })
  }else{
      if(data){
        user.deleteOne({_id:data._id}, function(err, del){
          if(err) throw err
          else{
            if(del){
              res.json({
                status:true,
                message:"deleted succesfully"
              })
            }else{
              res.json({
                status:false,
                error:"unable to delete data"
              })
            }
          }
        })
      }
  }
   })
})

// router.get('/delete', async function(req, res, next){
//     var delete_user = await user.deleteMany();
//     var delete_ad = await admin_creadential.deleteMany();
//     res.json({
//       status : true,
//       message : "Successfully deleted.."
//     })
// })

////////////// checking the jwt token 
function checklogin(req, res,next){
  try{
    const userjwt =  req.session.userId;
    console.log("fisrt checkingg. userjwt : "+userjwt);
    if(userjwt){
      auth.decoded(userjwt);
      next();
    }
   else{
     console.log("userjwt in else block :"+userjwt)
     res.redirect('/')
   }
  }catch(err){
    console.log(err)
    res.status(401).json({message : 'No Authentication....'})
  }
  
};

function isAdmin(req, res, next){
  if(req.session.admin){
    next();
  }else{
    res.redirect('/')
  }
}

router.get('/logout', function(req, res, next){
  req.session.userId = 0;
  console.log("session expired")
  res.redirect('/');
})

module.exports = router;
