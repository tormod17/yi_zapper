var count = 0;


const getElement = function(selector){
  return document.querySelector(selector);
}

document.body.onclick = function(e){
  e.preventDefault();
  const ids = [
    "localEnv",
    "testEnv",
    "disableHeatmap",
    "removeWildfireCookies",
    "clearURL",
    "frequenceyCapping",
    "urlMatch",
    "mappingResult",
    "migration"
  ];
  const id = e.target.getAttribute('id');
  
  if (ids.includes(id)){
    if (id === 'migration') {
      try {
        var data = document.querySelector('.migration textarea').value;
        var json = JSON.parse(data);
        chrome.tabs.create({
          url: './migration.html',
          active: false
        }, (tab) => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, json );          
          }, 1000);
        });
      }
      catch(e){
        console.error(e, 'invalid data');
      }
      return
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      let validUrls =[];
      let selector = '';
      let regex;
      let attribute;
      if (id === 'urlMatch'){
        const debuggerPatterns = [
          "#yidebug",
          "#!/&yidebug",
          "&yidebug",
          "?yidebug#yidebug",
          "#yidebug&yidebug"
        ];

        debuggerPatterns.forEach(function(pattern){
          const currentUrl = tabs[0].url + pattern;
          if (new RegExp('(^#|.*&)yidebug($|&.*)').test(currentUrl)){
             validUrls.push(currentUrl);
          };
        });

        const linkPanel = document.querySelector('.linkPanel');
        linkPanel.innerHTML = '';
        
        validUrls.forEach((url) => {
          const div = document.createElement('div');
          const linkText = document.createTextNode(url);
          //div.appendChild(linkText);
          //linkPanel.appendChild(div);
        })
      }
      if (id === 'mappingResult') {
         selector = getElement('#mappingSelector').value;
         regex = getElement('#mappingRegex').value;
         attribute = getElement('#mappingAttribute').value;
      }
      chrome.tabs.executeScript(
        tabs[0].id,
        {file: "content.js"},
        function(){
          chrome.tabs.sendMessage(tabs[0].id,{ env: id, debugger: { validUrls, mapping: { selector, regex, attribute } }});
        }
      );
    });
  }
}