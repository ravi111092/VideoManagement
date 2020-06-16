//hamburger button
function sidemenu(){
    $(".sidenav").css("width","450px");
    $("#overlay").css("display","block");
    if(window.innerWidth < 1191){
      $(".sidenav").css("width","100%");
    }
  }

  function closeNav(elem){
    $(".sidenav").css("width","0%")
    $("#overlay").css("display","none");
  }


  $(".options_box").click(function(){
    document.getElementById("myDropdown").classList.toggle("show");
  })
