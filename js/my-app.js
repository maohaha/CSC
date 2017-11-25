var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.ios === true;
Template7.global = {
    android: isAndroid,
    ios: isIos
};
// Export selectors engine
var $$ = Dom7;

if (isIos) {
    $$('head').append(
        '<link rel="stylesheet" href="css/framework7.ios.min.css">' +
        '<link rel="stylesheet" href="css/framework7.ios.colors.min.css">' +
        '<link rel="stylesheet" href="css/framework7.ios.css">'
    );
}
else {
    $$('head').append(
        '<link rel="stylesheet" href="css/framework7.material.min.css">' +
        '<link rel="stylesheet" href="css/framework7.material.colors.min.css">' +
        '<link rel="stylesheet" href="css/framework7.material.css">'
    );
} 



// Initialize your app
var myApp = new Framework7({
    material: isAndroid ? true : false,
    template7Pages: true
});


// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true,
    domCache: true
});

var subjects = []; //First call, get the subjects
var subjectClasses = []; //Second call, get all the classes
var temp = [];
var classAVB = [];
var userid = undefined;

/*
    Parameters: none
    Return value: none
    Divide into two functions, first one gets all the subjects, second one gets
    all the classes corresponding to that subject
*/

function loadClasses() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var tempData = this.responseText;
            var data = tempData.split("*");
            temp = [];
            for(var i = 0; i < data.length; i++) {
                if(data[i] != "") {
                    if(data[i].charAt(0) == '-') {
                        subjects.push(data[i].substring(1, data[i].length));
                        var temp1 = data[i].split("(");
                        if(temp1.length == 1) {
                            classAVB.push(data[i].substring(1, data[i].length));
                        } else {
                            classAVB.push(temp1[1].substring(0, temp1[1].length - 2));
                        }
                        if(temp.length != 0) {
                            subjectClasses.push(temp);
                            temp = [];
                        }
                    } else {
                        temp.push(data[i]);
                        if(i == data.length - 1) {
                            subjectClasses.push(temp);
                        }
                    }
                }
            }
        }
    }
    xmlhttp.open("GET", "php/subject.php", false);
    xmlhttp.send();
}

/*
    Parameters: none
    Return value: none
    Load back to index page
*/
var mesgs = [];

setInterval(function() {
    if(firstLogin == 0) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                mesgs = [];
                var obj = JSON.parse(this.responseText);
                //var tempID = document.getElementById
                //tempID.innerHTML = "";
                if(obj == null) {
                    curUnRead = 0;
                    return;
                }
                var count = 0;
                for(var i = 0; i < obj.length; i++) {
                    if(parseInt(obj[i][1]) == 0) count++;
                    mesgs.push(obj[i]);
                }
                curUnRead = count;
                console.log(curUnRead);
                if(curUnRead != 0 && curClose) {
                    document.getElementById('tishixinxi').style.display = 'flex';
                }
            }
        }
        xmlhttp.open("GET", "control.php?action=getMesg&username="+uname, true);
        xmlhttp.send();
    }
}, 500);

$$('#changeparkingbtn').on('click', function() {
    var tempParkingFrom = document.getElementById("parkingfrom");
    var parkingFrom = tempParkingFrom.options[tempParkingFrom.selectedIndex].value;
    var tempParkingToFirst = document.getElementById("parkingto1");
    var parkingToFirst = tempParkingToFirst.options[tempParkingToFirst.selectedIndex].value;
    var tempParkingToSecond = document.getElementById("parkingto2");
    var parkingToSecond = tempParkingToSecond.options[tempParkingToSecond.selectedIndex].value;
    if(parkingFrom == parkingToFirst || parkingToFirst == parkingToSecond || parkingFrom == parkingToSecond) {
        myApp.alert("You can't select the same section.", "ERROR");
        return;
    }
    submitParking(parkingFrom, parkingToFirst, parkingToSecond);
    asyncPreloader();
});

function submitParking(from, toFirst, toSecond) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            if(parseInt(this.responseText) == 1) {
                myApp.alert("You can only have up to one Parking Permit Switch section.", "Error");
                return;
            }
        }
    }
    xmlhttp.open("GET", "control.php?action=submitParking&username="+uname+"&pfrom="+from+"&pto1="+toFirst+"&pto2="+toSecond, true);
    xmlhttp.send();
}

function asyncPreloader() {
    myApp.showPreloader('Processing');
    setTimeout(function () {
        myApp.hidePreloader();  
    }, 800);
}

var curUnRead = 0;

$$('#sectionAddBtn').on('click', function() {
    //just for test
    mainView.router.load({pageName: 'index'});
});

var curClose = true;

$$('#tishiyouxiang').on('click', function() {
    curUnRead = 0;
    document.getElementById('tishigeshu').style.display = 'none';
    setAllMesgRead();
    var clickedLink = this;
    var tempDiv = "";
    for(var i = mesgs.length - 1; i >= 0; i--) {
        if(parseInt(mesgs[i][1]) == 0) {
            tempDiv += '<li class="mesglist"><span class="classinfos">Status updates for '+mesgs[i][0]+', check your email.</span><span class="textend">'+mesgs[i][2]+'</span></li>';
        } else {
            tempDiv += '<li class="mesglist"><span class="classinfos readed">Status updates for '+mesgs[i][0]+', check your email.</span><span class="textend">'+mesgs[i][2]+'</span></li>';
        }
    }
    if(mesgs.length == 0) tempDiv += '<span class="nomessagediv">No Messages!</span>'
    var popoverHTML = '<div class="popover popover2">'+
                          '<span class="messagespan">Messages</span>'+
                          '<div class="popover-inner">'+
                            '<div class="list-block">'+
                              '<ul style="margin-top: 20px;">'+
                                tempDiv +
                              '</ul>'+
                            '</div>'+
                          '</div>'+
                        '</div>'
  myApp.popover(popoverHTML, clickedLink);
});

function submitmesg() {
    myApp.showPreloader('Processing');
    setTimeout(function () {
        myApp.hidePreloader();
        myApp.alert('Thank you for your feedback!', 'INFO');   
    }, 800);
}

$$('#mainpagecomment').on('click', function() {
    var clickedLink = this;
    var popoverHTML = '<div class="popover popover3">'+
                        '<div class="popover-inner">'+
                            '<div class="titlemesg">'+
                                'Leave Us A Comment'+
                            '</div>'+
                            '<textarea autofocus placeholder="We need your feedback!" class="textmesg">'+
                            '</textarea>'+
                            '<a href="#" class="close-popover button button-fill button-raised color-blue" onClick="submitmesg()" id="mainsubmitcomment">'+
                                'Submit'+
                            '</a>'+
                        '</div>'+
                      '</div>'
    myApp.popover(popoverHTML, clickedLink);
});

function setAllMesgRead() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            
        }
    }
    xmlhttp.open("GET", "control.php?action=updateMesg&username="+uname, true);
    xmlhttp.send();
}

$$('#tishibtn').on('click', function() {
    if(curClose) {
        if(curUnRead != 0) {
            document.getElementById('tishigeshu').innerHTML = curUnRead;
            document.getElementById('tishigeshu').style.display = 'flex';
        }
        document.getElementById('tishixinxi').style.display = 'none';
    } else {
        if(curUnRead != 0) {
            document.getElementById('tishixinxi').style.display = 'flex';
        }
        document.getElementById('tishigeshu').style.display = 'none';
    }
    curClose = !curClose;
});

/*
    Parameters: none
    Return value: none
    Test all the input fields in Sign Up page
        --UserName: ['a'-'z'], ['A'-'Z'], [0-9], letter must be the first character
        --Password: at least 6 characters digit and letter only
        --Phone number: 10 digits
        --Email:
*/

$$('#registerBtn').on('click', function() {
    var tempUserName = $$('.register-screen input[name = "username"]').val();
    var tempUserPwd = $$('.register-screen input[name = "password"]').val();
    var tempUserPhone = $$('.register-screen input[name = "phonenum"]').val();
    var tempUserEmail = $$('.register-screen input[name = "email"]').val();
    var temprepeatPwd = $$('.register-screen input[name = "repeatedpassword"]').val();
    if(tempUserName == "" || tempUserPwd == "" || tempUserEmail == "" || tempUserPhone == "") {
        myApp.alert('Please fill out all the informations.', 'ERROR');
        return;
    }
    if(!document.getElementById('checkAgreement').checked) {
        myApp.alert('Please check the agreements.', 'ERROR');
        return;
    }
    if(!(/^\w+$/.test(tempUserName))) {
        myApp.alert('Your user name should only contains letters and numbers.', 'UserName');
        return;
        if(tempUserName.length < 6) {
            myApp.alert('Your user name should be more than 6 characters.', 'UserName');
        }
        if(tempUserName[0] >= '0' && tempUserName[0] <= '9') {
            myApp.alert('Your user name should start with a letter.', 'UserName');
        }
        return;
    }
    if(!(/^\d+$/.test(tempUserPhone) || tempUserPhone.length != 10)) {
        myApp.alert('Your phone number should be 10 digits.', 'PhoneNumber');
        return;
    }
    if(!(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(tempUserEmail))) {
        myApp.alert('Cannot identify the email address, please check it one more tiem.', 'Email');
        return;
    }
    if(!tempUserEmail.endsWith("ucla.edu") && !tempUserEmail.endsWith("g.ucla.edu")) {
        myApp.alert('You have to register with your ucla email address.', 'Email');
        return;
    }
    if(tempUserPwd != temprepeatPwd) {
        myApp.alert('Your passwords do not match.', 'Password');
        return;
    }
    if(tempUserPwd.length < 6 || !(/^\w+$/.test(tempUserPwd))) {
        myApp.alert('Your password should be more than 6 characters and contains only digits and letters.', 'Password');
        return;
    }
    register(tempUserName, tempUserPwd, tempUserPhone, tempUserEmail);
    myApp.showPreloader('Registering');
    setTimeout(function () {
        myApp.hidePreloader();
        myApp.closeModal('.popupsignup');
        if(result != "0") {
            myApp.alert('Duplicated user name.', 'ERROR');
            return;
        }
        result = "";
        myApp.alert('Before you log in, you have to go to your registered email and verify your account.', 'INFO'); 
        $$('.register-screen input[name = "username"]').val("");
        $$('.register-screen input[name = "password"]').val("");
        $$('.register-screen input[name = "phonenum"]').val("");
        $$('.register-screen input[name = "email"]').val("");
        $$('.register-screen input[name = "repeatedpassword"]').val("");    
    }, 4000);
});

/*
    Parameter: none
    Return value; none
    Change Password, 
*/

$$('#pwdchangeBtn').on('click', function() {
    var tempUserName = $$('.pwdchange-screen input[name = "cpusername"]').val();
    var tempUserPwd = $$('.pwdchange-screen input[name = "cppassword"]').val();
    var tempUserEmail = $$('.pwdchange-screen input[name = "cpemail"]').val();
    var tempUserPhone = $$('.pwdchange-screen input[name = "cpphone"]').val();
    var temprepeatPwd = $$('.pwdchange-screen input[name = "cprepeatedpassword"]').val();
    if(tempUserPwd != temprepeatPwd) {
        myApp.alert('Your passwords do not match.', 'Password');
        return;
    }
    if(!(/^\d+$/.test(tempUserPhone) || tempUserPhone.length != 10)) {
        myApp.alert('Your phone number should be 10 digits.', 'PhoneNumber');
        return;
    }
    if(tempUserPwd.length < 6 || !(/^\w+$/.test(tempUserPwd))) {
        myApp.alert('Your password should be more than 6 characters and contains only digits and letters.', 'Password');
        return;
    }
    changePwd(tempUserName, tempUserPhone, tempUserPwd, tempUserEmail);
    if(result != "0") {
        myApp.alert('Could not find any matches.', 'ERROR');
        return;
    }
    result = "";
    myApp.showPreloader('Processing');
    setTimeout(function () {
        myApp.hidePreloader();
        myApp.closeModal('.popuppwdchange');
        myApp.alert('Password updated.', 'INFO');
        $$('.pwdchange-screen input[name = "cpusername"]').val("");
        $$('.pwdchange-screen input[name = "cppassword"]').val("");
        $$('.pwdchange-screen input[name = "cpemail"]').val("");
        $$('.pwdchange-screen input[name = "cprepeatedpassword"]').val("");     
    }, 500);
});

function changePwd(username, userphone, userpwd, useremail) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var tempchangepwd = parseInt(this.responseText);
            if(tempchangepwd == 0) result = "0";
            else result = "1";
        }
    }
    xmlhttp.open("GET", "control.php?action=changePwd&username="
        +username+"&pwd="+userpwd+"&email="+useremail+"&phone="+userphone, false);
    xmlhttp.send();
}

var result = "";
function register(userName, userPwd, userPhone, userEmail) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            if(parseInt(this.responseText) >= 0) {
                result = "0";
                userid = parseInt(this.responseText);
            }
            else result = "1";
        }
    }
    xmlhttp.open("GET", "control.php?action=registerUser&username="
        +userName+"&pwd="+userPwd+"&phone="+userPhone+"&email="+userEmail, true);
    xmlhttp.send();
}

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function (page) {
    // run createContentPage func after link was clicked
    $$('.create-page').on('click', function () {
        createContentPage();
    });
});
var firstLogin = 1;
var uname="";
$$('.login-screen .list-button').on('click', function () {
    uname = $$('.login-screen input[name = "username"]').val();
    var pwd = $$('.login-screen input[name = "password"]').val();
    accountValidate(uname, pwd);
    if(result == "0") {
        result = "";
        var temp = "Welcome, " + uname;
        $$('#userwelcome').html(temp);
        myApp.showPreloader('Loging In');
        setTimeout(function () {
            myApp.hidePreloader();
            myApp.closeModal('.login-screen');
            mainView.router.back();
            $$('.login-screen input[name = "password"]').val("");
            if(firstLogin) {
                // loadSubjectsData("subjects");
                // for(var i= 0; i < subjects.length; i++) {
                //     loadSubjectsData("subject"+i);
                // }
                loadClasses();
                addSubjects();
                firstLogin = 0;
            }
        }, 400);
    } else if(result == "2"){
        myApp.alert('You have to go to your email and verfiy your account first.', 'INFO');
    } 
    else {
        myApp.alert('One of your username and password is wrong.', 'ERROR');
    }
 });

function accountValidate(username, userpwd) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            if(parseInt(this.responseText) == 0) result = "0";
            else if(parseInt(this.responseText) == 2) result = "2";
            else result = "1";
        }
    }
    xmlhttp.open("GET", "control.php?action=userValidate&username="+username+"&pwd="+userpwd, false);
    xmlhttp.send();
}

var inClassPage = 0;
var classPageName;
var classNum = -1;

$$('#sectionAddBtn').on('click', function() {
    var curClassName = document.getElementById("addClassSectionID").innerHTML;
    var tempFrom = document.getElementById("sectionFrom");
    var curFrom = tempFrom.options[tempFrom.selectedIndex].value;
    var tempTo = document.getElementById("sectionTo");
    var curTo = tempTo.options[tempTo.selectedIndex].value;
    if(curFrom == curTo) {
        myApp.alert("Can't change to the same section.", 'ERROR');
        return;
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            if(parseInt(this.responseText) != 0) {
                myApp.alert('Something went wrong with response code '+this.responseText, 'ERROR');
            }
        }
    }
    xmlhttp.open("GET", "control.php?action=classSectionSubmit&username="+uname+"&class="+curClassName+"&secfrom="+curFrom+"&secto="+curTo, true);
    xmlhttp.send();
    asyncPreloader();
});

$$('#raiseteambtn').on('click', function() {
    var curClassName = document.getElementById("raiseTeamPageID").innerHTML;
    var teamName = document.getElementById("teamnames").value;
    var tempSection = document.getElementById("groupsectionTo");
    var section = tempSection.options[tempSection.selectedIndex].value;
    var recruteremain = document.getElementById("recruteremain").value;
    if(parseInt(recruteremain) <= 0) {
        myApp.alert("The recrute size can't be less or equal to 0.", "ERROR");
        return;
    }
    var descs = document.getElementById("teamDescription").value;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            if(parseInt(this.responseText) == 2) {
                myApp.alert('You already have a team or join a team in this class section.', 'ERROR');
            } else if(parseInt(this.responseText) != 0) {
                myApp.alert('Something went wrong with response code '+this.responseText, 'ERROR');
            }
        }
    }
    xmlhttp.open("GET", "control.php?action=raiseTeam&leader="+uname+"&teamname="+teamName+"&class="+curClassName+"&secfrom="+section+"&remain="+recruteremain+"&desc="+descs, true);
    xmlhttp.send();
    asyncPreloader();
});

$$('#backToIndexBtn').on('click', function() {
    mainView.router.load({pageName: 'index'});
});

function popupClassInfo (classname, secFrom, secTo, time, status) {
  myApp.modal({
    title:  'Section Info',
    text: 'Class: '+classname+'<br>Section From: '+secFrom+'<br>Section To: '+secTo+'<br>Time: '+time+'<br>Status: '+status,
    buttons: [
      {
        text: 'Cancel',
        onClick: function() {
        }
      },
      {
        text: 'Remove',
        onClick: function() {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200) {
                    if(parseInt(this.responseText) != 0) {
                        myApp.alert('Something went wrong with response code '+this.responseText, 'ERROR');
                    }
                }
            }
            xmlhttp.open("GET", "control.php?action=removeClassSection&username="+uname+"&class="+classname+"&secfrom="+secFrom+"&secto="+secTo, true);
            xmlhttp.send();
        }
      },
    ]
  })
}

function classAddUI(classname) {
    document.getElementById("addClassSectionID").innerHTML = classname;
    mainView.router.load({pageName: 'addClassSectionPage'});
}



function threeBtn(classname) {
    myApp.modal({
    title:  'Group Team Up',
    text: 'Select "Raise a Team" to create a team, "Join a Team" to find and join a team.',
    verticalButtons: true,
    buttons: [
      {
        text: 'Raise a Team',
        onClick: function() {
          document.getElementById("raiseTeamPageID").innerHTML = classname;
          document.getElementById("teamname").value = "";
          document.getElementById("groupsectionTo").value = '1A';
          document.getElementById("recruteremain").value = 1;
          document.getElementById("teamDescription").value = "";
          mainView.router.load({pageName: 'raiseTeamPage'});
        }
      },
      {
        text: 'Join a Team',
        onClick: function() {
          document.getElementById("jointeampageid").innerHTML = classname;
          getTeamInfo(classname);
        }
      },
      {
        text: 'Cancel'
      },
    ]
  })
}

function parkingInfo(from, to1, to2, date) {
    myApp.modal({
    title:  'Section Info',
    text: 'From: '+from+'<br>To First: '+to1+'<br>To Second: '+to2+'<br>Time: '+date+'<br>Status: pending',
    verticalButtons: true,
    buttons: [
      {
        text: 'Remove',
        onClick: function() {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200) {
                    if(parseInt(this.responseText) != 0) {
                        myApp.alert('Something went wrong with response code '+this.responseText, 'ERROR');
                    }
                }
            }
            xmlhttp.open("GET", "control.php?action=removeParkingSection&username="+uname, true);
            xmlhttp.send();
        }
      },
      {
        text: 'Cancel',
        onClick: function() {
        }
      },
    ]
  })
}

function joingroupBtn(classname, section, teamname, recrutesize, desc, date) {
    myApp.modal({
    title:  '<div class="buttons-row">'+
              '<a href="#tab1" class="button active tab-link">Team</a>'+
              '<a href="#tab2" class="button tab-link">Desc</a>'+
            '</div>',
    text: '<div class="tabs">'+
            '<div class="tab active" id="tab1">Class Name: '+ classname + '<br>Section: ' + section + '<br>Team Name: ' + teamname + '<br>Remaining: ' + recrutesize + '<br>Date: ' + date + '</div>'+
            '<div class="tab" id="tab2" style="overflow-wrap: break-word;">'+ desc +'</div>'+
          '</div>',
    verticalButtons: true,
    buttons: [
      {
        text: 'Join',
        onClick: function() {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200) {
                }
            }
            xmlhttp.open("GET", "control.php?action=joinTeams&class="+classname+"&username="+uname+"&teamname="+teamname+"&secfrom="+section, true);
            xmlhttp.send();
            myApp.showPreloader('Processing');
            setTimeout(function () {
                myApp.hidePreloader();
                getTeamInfo(classname);   
            }, 1500);
            mainView.router.load({pageName: 'index'});
            asyncPreloader();
        }
      },
      {
        text: 'Cancel'
      },
    ]
  })
}

function removegroupBtn(classname, section, teamname, recrutesize, desc, date) {
    myApp.modal({
    title:  '<div class="buttons-row">'+
              '<a href="#tab1" class="button active tab-link">Team</a>'+
              '<a href="#tab2" class="button tab-link">Desc</a>'+
            '</div>',
    text: '<div class="tabs">'+
            '<div class="tab active" id="tab1">Class Name: '+ classname + '<br>Section: ' + section + '<br>Team Name: ' + teamname + '<br>Remaining: ' + recrutesize + '<br>Date: ' + date + '</div>'+
            '<div class="tab" id="tab2" style="overflow-wrap: break-word;">'+ desc +'</div>'+
          '</div>',
    verticalButtons: true,
    buttons: [
      {
        text: 'Remove',
        onClick: function() {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200) {
                    console.log("control.php?action=removeGroupSection&class="+classname+"&username="+uname+"&teamname="+teamname+"&secfrom="+section);
                    if(parseInt(this.responseText) != "0") {
                        myApp.alert("ERROR CODE -1, DB ERROR!", "ERROR");
                    }
                }
            }
            xmlhttp.open("GET", "control.php?action=removeGroupSection&class="+classname+"&username="+uname+"&teamname="+teamname+"&secfrom="+section, true);
            xmlhttp.send();
        }
      },
      {
        text: 'Cancel'
      },
    ]
  })
}

var teaminfos = [];

function getTeamInfo(className) {
    var xmlhttp = new XMLHttpRequest();
    teaminfos = [];
    xmlhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            teaminfos = JSON.parse(this.responseText);
            loadteaminfo();
        }
    }
    xmlhttp.open("GET", "control.php?action=updateGroup&class="+className+"&username="+uname, false);
    xmlhttp.send();
    loadteaminfo();
}

function loadteaminfo() {
    var loadinfo = document.getElementById("loadteam");
    loadinfo.innerHTML = '';
    for(var i = 0; i < teaminfos.length; i++) {
        var lidom = document.createElement("li");
        lidom.className = "button button-fill button-blue";
        lidom.style.cssText = 'width: 80%; left: 10%; border-radius: 10px; margin: 10px 0 10px 0; height: 50px;';
        lidom.setAttribute('onclick', "joingroupBtn('"+teaminfos[i][0]+"', '"+teaminfos[i][1]+"', '"+teaminfos[i][2]+"', '"+teaminfos[i][3]+"', '"+teaminfos[i][4]+"', '"+teaminfos[i][5]+"')");
        var dDom = '<a href="#" style="color: white;">'+teaminfos[i][2]+'</a>';
        lidom.innerHTML = dDom;
        loadinfo.append(lidom);
    }
    mainView.router.load({pageName: 'jointeampage'});
}

//CLASS SECTION INFO MAIN PAGE
setInterval(function() {
    if(firstLogin == 0) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                var obj = JSON.parse(this.responseText);
                var tempID = document.getElementById("classSectionChangeDiv");
                tempID.innerHTML = "";
                for(var i = 0; i < obj.length; i++) {
                    var lidom = document.createElement("li");
                    lidom.className = "button button-fill button-blue modal33";
                    lidom.style.cssText = 'border-radius: 10px; margin-bottom: 10px; margin-top: 10px; height: 50px;';
                    lidom.setAttribute('onclick', "popupClassInfo('"+obj[i][0]+"', '"+obj[i][1]+"', '"+obj[i][2]+"', '"+obj[i][3]+"', 'pending')");
                    var adom = '<a href="#" style="color: white;">'+obj[i][0]+'</a>';
                    lidom.innerHTML = adom;
                    tempID.append(lidom);
                }
            }
        }
        xmlhttp.open("GET", "control.php?action=updateClassSection&username="+uname, false);
        xmlhttp.send();
    }   
}, 1500);

// GROUP INFO MAIN PAGE
setInterval(function() {
    if(firstLogin == 0) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                var obj2 = JSON.parse(this.responseText);
                var tempID = document.getElementById("groupSectionDiv");
                tempID.innerHTML = "";
                for(var i = 0; i < obj2.length; i++) {
                    var lidom = document.createElement("li");
                    lidom.className = "button button-fill button-blue";
                    lidom.style.cssText = 'width: 80%; left: 10%; border-radius: 10px; margin: 10px 0 10px 0; height: 50px;';
                    lidom.setAttribute('onclick', "removegroupBtn('"+obj2[i][1]+"', '"+obj2[i][2]+"', '"+obj2[i][3]+"', '"+obj2[i][4]+"', '"+obj2[i][5]+"', '"+obj2[i][6]+"')");
                    var dDom = '<a href="#" style="color: white;"><span>'+obj2[i][1]+'</span><span>'+obj2[i][3]+'</span>'+'</a>';
                    lidom.innerHTML = dDom;
                    tempID.append(lidom);
                }
            }
        }
        xmlhttp.open("GET", "control.php?action=updateGroupMain&username="+uname, false);
        xmlhttp.send();
    }   
}, 1500);

//PARKING INFO MAIN PAGE
setInterval(function() {
    if(firstLogin == 0) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                var obj3 = JSON.parse(this.responseText);
                var tempID2 = document.getElementById("parkinguldiv");
                tempID2.innerHTML = "";
                for(var i = 0; i < obj3.length; i++) {
                    var lidom = document.createElement("li");
                    lidom.className = "button button-fill button-blue";
                    lidom.style.cssText = 'width: 80%; left: 10%; border-radius: 10px; margin: 10px 0 10px 0; height: 50px;';
                    lidom.setAttribute('onclick', "parkingInfo('"+obj3[i][0]+"', '"+obj3[i][1]+"', '"+obj3[i][2]+"', '"+obj3[i][3]+"')");
                    var dDom = '<a href="#" style="color: white;"><span>'+obj3[i][0]+'</span></a>';
                    lidom.innerHTML = dDom;
                    tempID2.append(lidom);
                }
            }
        }
        xmlhttp.open("GET", "control.php?action=updateParking&username="+uname, false);
        xmlhttp.send();
    }
}, 1500);

// Generate dynamic page
var dynamicPageIndex = 0;
function createContentPage() {
	mainView.router.loadContent(
        '<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
        '    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="dynamic-pages" class="page">' +
        '    <!-- Scrollable page content-->' +
        '    <div class="page-content">' +
        '      <div class="content-block">' +
        '        <div class="content-block-inner">' +
        '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
        '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );
	return;
}

function addClass(i) {
    var temp = document.getElementById("subjectULDiv");
    temp.innerHTML = '';
    for(var j = 0; j < subjectClasses[i].length; j++) {
            var temp1 = subjectClasses[i][j].split(".");
            var lidom = document.createElement("li");
            lidom.className = "item-content"; 
            var dDom = '<a onclick="classAddUI(\''+classAVB[i]+' - '+temp1[0]+'\')" href="#'+
                        '" class="item-link"> <div class="item-content"> <div class="item-inner">' +
                        '<div class="item-title">' + subjectClasses[i][j] + '</div></div></div></a>';
            lidom.innerHTML = dDom;
            temp.append(lidom);
    }
    mainView.router.load({pageName: 'classDivPage'});
}

function addClass2(i) {
    var temp = document.getElementById("subjectULGroupDiv");
    temp.innerHTML = '';
    for(var j = 0; j < subjectClasses[i].length; j++) {
            var temp1 = subjectClasses[i][j].split(".");
            var lidom = document.createElement("li");
            lidom.className = "item-content"; 
            var dDom = '<a onclick="threeBtn(\''+classAVB[i]+' - '+temp1[0]+'\')" href="#'+
                        '" class="item-link"> <div class="item-content"> <div class="item-inner">' +
                        '<div class="item-title">' + subjectClasses[i][j] + '</div></div></div></a>';
            lidom.innerHTML = dDom;
            temp.append(lidom);
    }
    mainView.router.load({pageName: 'classDivPageGroup'});
}

function addSubjects() {
    var subjectul = $$('#subjectUL');
    var subjectulg = $$('#subjectULGroup');
    for(var i = 0; i < subjects.length; i++) {
        var lidom = document.createElement("li");
        var lidom2 = document.createElement("li");   
        lidom.className = "item-content";
        lidom2.className = "item-content";
        var aDom = '<a href="#" onclick="addClass('+i+')" class="item-link">' +
                    '<div class="item-content"> <div class="item-inner">' +
                    '<div class="item-title">' + subjects[i] + '</div></div></div></a>';
        var aDom2 = '<a href="#" onclick="addClass2('+i+')" class="item-link">' +
                    '<div class="item-content"> <div class="item-inner">' +
                    '<div class="item-title">' + subjects[i] + '</div></div></div></a>';
        lidom.innerHTML = aDom;
        subjectul.append(lidom);
        lidom2.innerHTML = aDom2;
        subjectulg.append(lidom2);
    }
}


