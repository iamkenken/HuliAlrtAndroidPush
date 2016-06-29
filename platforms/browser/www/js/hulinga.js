// Code for platform detection
var isMaterial = Framework7.prototype.device.ios === false;
var isIos = Framework7.prototype.device.ios === true;

// Add the above as global variables for templates
Template7.global = {
  material: isMaterial,
  ios: isIos,
};

// A template helper to turn ms durations to mm:ss
// We need to be able to pad to 2 digits
function pad2(number) {
  if (number <= 99) { number = ('0' + number).slice(-2); }
  return number;
}

// Now the actual helper to turn ms to [hh:]mm:ss
function durationFromMsHelper(ms) {
  if (typeof ms != 'number') {
    return '';
  }
  var x = ms / 1000;
  var seconds = pad2(Math.floor(x % 60));
  x /= 60;
  var minutes = pad2(Math.floor(x % 60));
  x /= 60;
  var hours = Math.floor(x % 24);
  hours = hours ? pad2(hours) + ':' : '';
  return hours + minutes + ':' + seconds;
}

// A stringify helper
// Need to replace any double quotes in the data with the HTML char
//  as it is being placed in the HTML attribute data-context
function stringifyHelper(context) {
  var str = JSON.stringify(context);
  return str.replace(/"/g, '&quot;');
}

// Finally, register the helpers with Template7
Template7.registerHelper('durationFromMs', durationFromMsHelper);
Template7.registerHelper('stringify', stringifyHelper);

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;


if (!isIos) {
  // Change class
  $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
  // And move Navbar into Page
  $$('.view .navbar').prependTo('.view .page');
}

// Initialize app
var myApp = new Framework7({
  material: isIos? false : true,
  template7Pages: true,
  precompileTemplates: true,
  animatePages: true,
  swipePanel: 'left',
  swipePanelActiveArea: '30',
  swipeBackPage: true,
  animateNavBackIcon: true,
  pushState: !!Framework7.prototype.device.os,
  uniqueHistory: true,
  modalTitle: 'HULI ALERT',
});

// Add view
var mainView = myApp.addView('.view-main', {
  // Because we want to use dynamic navbar, we need to enable it for this view:
  dynamicNavbar: true,
  domCache: true,
});

var mySwiper = myApp.swiper('.swiper-container', {
    pagination:'.swiper-pagination'
}); 

/*mainView.router.load({pageName: 'profile'});*/
// Handle Cordova Device Ready Event

/*Local*/
/*var api_url = 'http://hulinga.dev/api/v1';*/

/*Dev*/
var api_url = 'http://dev.alfafusion.com/hulinga/public/api/v1';

$$(document).on('deviceready', function deviceIsReady() {
  document.body.style.display = "block";

  var push = PushNotification.init({
      "android": {
          "senderID": "306256784230"
      },
      "ios": {
          "sound": true,
          "vibration": true,
          "badge": true
      },
      "windows": {}
  });

  push.on('registration', function(data) {
      console.log('registration event: ' + data.registrationId);

      var oldRegId = localStorage.getItem('registrationId');
      if (oldRegId !== data.registrationId) {
          // Save new registration ID
          localStorage.setItem('registrationId', data.registrationId);
          // Post registrationId to your app server as the value has changed
      }

  });

  push.on('error', function(e) {
      console.log("push error = " + e.message);
  });

  push.on('notification', function(data) {
      console.log('notification event');
      navigator.notification.alert(
          data.message,         // message
          null,                 // callback
          data.title,           // title
          'Ok'                  // buttonName
      );
  });

});

if(localStorage.auth == undefined)
{
  mainView.router.load({
    template: myApp.templates.loginTemplate,
    animatePages: true,
    context: {
      id: localStorage.registrationId
    },
    reload: true,
  });
  myApp.allowPanelOpen = false;
  $$('.navbar').css('display','none');
  $$('.toolbar').css('display','none');
  localStorage.currentPage = 'loginpage';
}
else
{
  showhome();
}

if(localStorage.photo == undefined)
{
  localStorage.photo = 'img/p.jpg';
}

$$(document).on('submit', '#loginForm', function(){
  
  var username = $$('#username').val();
  var pass = $$('#pass').val();
  if(username == ''){
    $$('#username').focus();
  }else if(pass == ''){
    $$('#pass').focus();
  }else{
    myApp.showIndicator();
    $$.post(api_url+'/login', {username: username, pass: pass}, function (data) {
      myApp.hideIndicator();
      var datas = JSON.parse(data);
      if(datas['status'] == 'OK'){
        localStorage.auth = 'true';
        localStorage.un = username;
        localStorage.pass = pass;
        localStorage.fname = datas['data']['profile']['firstname'];
        localStorage.email = datas['data']['email'];
        localStorage.contact = datas['data']['profile']['contact'];
        if(datas['data']['photo'] !== ''){
        localStorage.photo = datas['data']['profile']['photo'];
        }else{
           localStorage.photo = 'img/p.jpg';
        }
        localStorage.userid = datas['data']['id'];
  

        /*$$('#menu-profile').trigger('click');
        $$('.p-name').text(localStorage.un);*/
        showhome();
      }else{
        myApp.alert('Wrong username or password.', 'HULI ALERT');
      }
    });
  }
  return false;
});
var deviceType = '';
if (isIos) {
  console.log('ios');
  deviceType = 'ios';
}else{
  console.log('material');
  deviceType = 'android';
}
$$(document).on('submit', '#signupForm', function(){
  var username = $$('#susername').val();
  var email = $$('#semail').val();
  var mobile = $$('#smobile').val();
  var plate = $$('#splate').val();
  var pass = $$('#spass').val();
  if(username == ''){
    $$('#susername').focus();
  }else if(email == ''){
    $$('#semail').focus();
  }else if(mobile == ''){
    $$('#smobile').focus();
  }else if(plate == ''){
    $$('#splate').focus();
  }else if(pass == ''){
    $$('#spass').focus();
  }else{
    myApp.showIndicator();
    $$.post(api_url+'/register', {username: username, email: email, mobile: mobile, plate: plate, pass: pass, type: deviceType, token: localStorage.registrationId}, function (data) {
      myApp.hideIndicator();
      var datas = JSON.parse(data);
      console.log(datas);
      if(datas['status'] == 'OK'){
        localStorage.auth = 'true';
        localStorage.un = username;
        localStorage.pass = pass;
        localStorage.fname = datas['data']['profile']['firstname'];
        localStorage.email = datas['data']['email'];
        localStorage.contact = datas['data']['profile']['contact'];
        if(datas['data']['photo'] !== ''){
        localStorage.photo = datas['data']['profile']['photo'];
        }else{
           localStorage.photo = 'img/p.jpg';
        }
        localStorage.userid = datas['data']['id'];
        
        /*$$('#menu-profile').trigger('click');
        $$('.p-name').text(localStorage.un);*/
        showhome();
      }else{
        myApp.alert(datas['error'], 'HULI ALERT');
      }
    });
  }
  return false;
});

$$('#logout').click(function(){
  localStorage.clear();
  $$('.navbar').css('display','none');
  $$('.toolbar').css('display','none');
  mainView.router.load({
    template: myApp.templates.loginTemplate,
    animatePages: true,
    context: {
    },
    reload: true,
  });
  myApp.allowPanelOpen = false;
});

$$('#a-home').click(function(){
  if(localStorage.currentPage  !== 'homepage')
  {
    showhome();
  }
});

$$('#a-profile').click(function(){
  if(localStorage.currentPage !== 'profilepage')
  {
    mainView.router.load({
      template: myApp.templates.profileTemplate,
      animatePages: true,
      context: {
        uname: localStorage.un,
        name: localStorage.fname,
        email: localStorage.email,
        contact: localStorage.contact,
        pass: localStorage.pass,
        photo: localStorage.photo
      },
      reload: true,
    });
    localStorage.currentPage = 'profilepage';
  }
});



$$(document).on('click', '#changepass', function(){
    myApp.modalPassword('Your current password?', function (password) {
      if(password != ''){
        if(password == localStorage.pass){
            myApp.modalPassword('Your new password:', function (newpassword) {
                if(newpassword != ''){
                  myApp.showIndicator();
                  $$.post(api_url+'/savepassword', {uid: localStorage.userid, password: newpassword}, function (data) {
                    myApp.hideIndicator();
                    var datas = JSON.parse(data);
                    console.log(datas);
                    if(datas['status'] == 'OK'){
                      myApp.alert('Your new password is .'+newpassword);
                    }else{
                      $$('#logout').trigger('click');
                    }
                  });
                }
            });
        }
        else
        {
          myApp.alert('Incorrect current password.');
        }
      }
    });
});   

$$(document).on('submit', '#profileForm', function(){
  var uid = localStorage.userid;
  var acctname = $$('#acctname').val();
  var acctemail = $$('#acctemail').val();
  var acctmobile = $$('#acctmobile').val();

if(acctname == localStorage.fname && acctemail == localStorage.email && acctmobile == localStorage.contact){
  myApp.alert('No changes has been made', 'HULI ALERT');
}else{
  if(acctemail == ''){
     myApp.alert('Email field was empty', 'HULI ALERT');
     $$('#acctemail').val(localStorage.email);
  }else{
    myApp.showIndicator();
    $$.post(api_url+'/saveprofile', {uid: uid, acctname: acctname, acctemail: acctemail, acctmobile: acctmobile,}, function (data) {
      myApp.hideIndicator();
      var datas = JSON.parse(data);
      console.log(datas);
      if(datas['status'] == 'OK'){
        console.log(datas['data'])
        localStorage.fname = datas['data']['profile']['firstname'];
        localStorage.email = datas['data']['email'];
        localStorage.contact = datas['data']['profile']['contact'];
        $$('#acctname').val(localStorage.fname);
        $$('#acctemail').val(localStorage.email);
        $$('#acctmobile').val(localStorage.contact);
        myApp.alert('Successfully saved changes')
      }else{
        myApp.alert(datas['error'])
      }
    });
  }
}

});

$$(document).on('click', '.loginshowpass', function(){
  var field = $$('#pass');
  if(field.hasClass('show')){
    field.attr('type', 'password');
    field.removeClass('show');
    $$(this).find('i').removeClass('fa-eye-slash').addClass('fa-eye');
  }else{
    field.attr('type', 'text');
    field.addClass('show');
    $$(this).find('i').removeClass('fa-eye').addClass('fa-eye-slash');
  }
});

$$(document).on('click', '.signupshowpass', function(){
  var field = $$('#spass');
  if(field.hasClass('show')){
    field.attr('type', 'password');
    field.removeClass('show');
    $$(this).find('i').removeClass('fa-eye-slash').addClass('fa-eye');
  }else{
    field.attr('type', 'text');
    field.addClass('show');
    $$(this).find('i').removeClass('fa-eye').addClass('fa-eye-slash');
  }
});

$$('#addplate').on('click', function(){
    myApp.prompt('Plate Number', 'Add', function (value) {
        if(value != ''){
          myApp.showIndicator();
          $$.post(api_url+'/saveplate', {uid: localStorage.userid, plate: value,}, function (data) {
            myApp.hideIndicator();
            var datas = JSON.parse(data);
            if(datas['status'] == 'OK'){
              myApp.alert('Plate number successfully added.');
              if(localStorage.currentPage == 'platepage'){
                getplates();
              }
            }
            else
            {
              myApp.alert('Unable to add plate. try again later');
            }
          });
        }
    });
    $$('.modal-text-input').focus();
    $$('.modal-text-input').addClass('uppercase');
});

$$('.showplate').on('click', function(){
  if(localStorage.currentPage !== 'platepage')
  {
    getplates();
    localStorage.currentPage = 'platepage';
  }
});

function getplates(){
  myApp.showIndicator();
  $$.get(api_url+'/getplate', {uid: localStorage.userid}, function (data) {
      myApp.hideIndicator();
      console.log(data);
      var datas = JSON.parse(data);
      if(datas['status'] == 'OK'){
        mainView.router.load({
        template: myApp.templates.plateTemplate,
        animatePages: true,
        context: {
          plates : datas['data']
        },
        reload: true,
        });
      }
      else
      {
        myApp.alert('Something went wrong. Try again later');
      }

  });
}

$$(document).on('click', '.delete-plate', function(){
  var plateid = $$(this).data('id');
  var platename = $$(this).data('name');
  myApp.confirm('Are you sure you want to delete this plate number?', platename.toUpperCase(), function () {
      myApp.showIndicator();
      $$.post(api_url+'/deleteplate', {uid: localStorage.userid, plateid: plateid}, function (data) {
        console.log(data);
        myApp.hideIndicator();
        var datas = JSON.parse(data);
        if(datas['status'] == 'OK'){
          getplates();
        }
        else
        {
          myApp.alert('Something went wrong. Try again later');
        }
      });
  });
});

$$(document).on('click', '.show-plate', function(){
  /*myApp.showIndicator();*/
  var plateid = $$(this).data('id');
  var platenumber = $$(this).data('name');
  mainView.router.load({
  template: myApp.templates.singleplateTemplate,
  animatePages: true,
  context: {
    platenumber : platenumber.toUpperCase()
  },
  reload: true,
  });

  localStorage.currentPage = 'singleplate';

});

function showhome(){
  myApp.showIndicator();
  $$.get(api_url+'/getplate', {uid: localStorage.userid}, function (data) {
    myApp.hideIndicator();
    console.log(data);
    var datas = JSON.parse(data);
    if(datas['status'] == 'OK'){
      $$('.navbar').css('display','block');
      $$('.toolbar').css('display','block');
      myApp.allowPanelOpen = true;
      mainView.router.load({
        template: myApp.templates.homeTemplate,
        animatePages: true,
        context: {
          plates: datas['data']
        },
        reload: true,
      });
      localStorage.currentPage = 'homepage';
    }
    else
    {
      myApp.alert('Something went wrong. Try again later');
    }
  });
}

$$(document).on('pageInit', function (e) {
  // Do something here when page loaded and initialized
  var mySwiper = myApp.swiper('.swiper-container', {
  pagination:'.swiper-pagination'
  });
});
