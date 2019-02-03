(function(){
  if (window.hasRun) {
    return console.log('yi-zapper has already srun content script');
  }

  window.hasRun = true;
  console.log(window.hasRun, 'content has run');


  function setCookie(name,value,days) {   
    var expires = "";     
    if (days) {       
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
    }     
    document.cookie = name + "=" + (value || "")  + expires + "; path=/"; 
  }; 

  function get_cookie(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') {
            c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) {
              return c.substring(nameEQ.length,c.length);
            }
          }
      }
      return null;
  }

  function delete_cookie( name ) {
    var domain = (function(){
       var i=0;
       var domain=document.domain;
       var domainParts = domain.split('.');
       var s = '_gd'+(new Date()).getTime();
       var cookieNotSet = function(s) { return document.cookie.indexOf(s+'='+s) == -1 }
       
       while(i < (domainParts.length-1) && cookieNotSet(s)){
          domain = domainParts.slice(-1-(++i)).join('.'); // remove a part
          document.cookie = s+"="+s+";domain="+domain+";"; // set temp cookies
       }
       document.cookie = s+"=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain="+domain+";";
       return domain;
    })();
    document.cookie = 
       name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=" + domain +";";
  }

  function listenToPopupMessages(message){
    if (message.env === 'localEnv') {
      window.location.hash = 'yiwildfire=local&yiheatmap=false';

    }
    if (message.env === 'testEnv') {    
      window.location.hash = 'yiwildfire=test&yiheatmap=false'; 
    }

    if (message.env === 'disableHeatmap') {
      window.location.hash = 'yiheatmap=false'; 
    }

    if (message.env === 'removeWildfireCookies') {
      delete_cookie('_yi_heatmap_disabled');
      delete_cookie('_yi_wildfire_environment');
      window.location.hash = '';
    }

    if (message.env === 'frequenceyCapping') {
      delete_cookie('_yi');
      delete_cookie('_y2');
    }

    if (message.env === 'clearURL') {
      window.location.hash = '';
    }

    if (message.debugger && message.debugger.validUrls.length > 0 && message.env === 'urlMatch'){
      window.location.href = message.debugger[0];
    }

    if (message.env === 'mappingResult' && message.debugger.mapping ) {
      const { mapping } = message.debugger;
      if (mapping.selector === '') {
        return console.log('empty selector');
      }

      const nodes = document.querySelectorAll(mapping.selector);
      


      if (nodes.length === 1){
        const regex =  mapping.regex ? new RegExp(mapping.regex) : /.*/;
        const string =  mapping.attribute ? nodes[0].getAttribute(mapping.attribute) :nodes[0].textContent;
        const match = string.match(regex)[0];
        
        if (match){
          const result = match.replace(/\s+/g, ' ').replace(/\n/g, ' ');
          alert('Success, your mapping result: ' + result)
          document.querySelector(mapping.selector).style.border ='red 1px solid';
        } else {
        console.log('no match');  
        }
      } else {
        console.log('your selector returned ' + nodes.length + ' elements');
      }
      return 
    }

    window.location.reload();
  }

  chrome.runtime.onMessage.addListener(listenToPopupMessages);  
}())

