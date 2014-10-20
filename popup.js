var bgr = chrome.extension.getBackgroundPage();
document.addEventListener("DOMContentLoaded", bookmark());

function bookmark(){
  var tags = JSON.parse(localStorage.tags)
  var keys = JSON.parse(localStorage.keys)

  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    bgr.isBookmarked(tabs[0].url, function(id){
      if(id){
        tags.forEach(function(tagObj,i) {
          if(tagObj.id===id){
            if(tagObj.tag.length > 0){
              var tags = tagObj.tag
              var map = [];

              keys.forEach(function(key){
                tags.forEach(function(tag){
                  if(key === tag ){map.push(tag)}
                })
              });

              keys.forEach(function(key){
                var index = map.indexOf(key);
                if(index >= 0){
                  renderTag(key, 'on');
                }else{
                  renderTag(key, 'off');
                }
              });

            }else{
              if(keys.length > 0){
                keys.forEach(function(key) {
                  renderTag(key,'off');
                });
              }
            }
          }
        });
      }else{
        addBookmark(tabs[0].title,tabs[0].url,id);
        keys.forEach(function(key) {
          renderTag(key,'off');
        });
      }
    });
  });

  document.getElementById('remove').addEventListener('click' , function(){ 
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      bgr.isBookmarked(tabs[0].url, function(id){
        if(id){removeBookmark(id);}
      });
    });
  })

}

function addBookmark(tabTitle,tabUrl){
  chrome.bookmarks.create({title:tabTitle,parentId:localStorage.folderId,url:tabUrl},function(newbookmark){
    bgr.iconSwitch('on');
    if(localStorage.tags){
      var tags = JSON.parse(localStorage.tags);
      var obj = { id:newbookmark.id, tag:[]};
      tags.push(obj);
      localStorage.tags = JSON.stringify(tags);
    }else{
      localStorage.tags = '[{ "id" :"'+newbookmark.id+'", "tag":[]}]'
    }
  });
}


function removeBookmark(id){
  chrome.bookmarks.remove(id, function(){
    bgr.iconSwitch('off');
    var tags = JSON.parse(localStorage.tags);
    tags.forEach(function(tag,i){
      var key = tag.id;
      if(key===id){
        tags.splice(i, 1)
      }
    })
    localStorage.tags = JSON.stringify(tags)
    window.close();
  })
}


document.getElementById('input').onkeydown = function (ev) {
    ev.keyCode = ev.which || ev.keyCode;
    if(ev.which == 13) {
      addTag();
    }
}

document.getElementById('input').onblur = addTag;


function addTag() {
  clearMessage();
  var string = document.getElementById("input").value.split(' ').join('');
  document.getElementById("input").value = '';
  if(string===''){
    return;
  }else{

    function checkComma(){
      var reg = /,$/;
      if(reg.test(string)){string=string.slice(0, -1); checkComma()}
    }
    checkComma();

    var newkeywords = string.split(',');
    var savedkeywords = JSON.parse(localStorage.keys);
    
    newkeywords.forEach(function(keyword){
      var exist = savedkeywords.indexOf(keyword);
      if(exist>=0){
        addMessage(keyword)
      }else{
        renderTag(keyword);
        savedkeywords.push(keyword)
      }
    })
    localStorage.keys = JSON.stringify(savedkeywords);
  }
};


function addMessage(keyword){
  var msg = document.createElement('span');
  msg.className='err';
  msg.innerHTML = 'tag "'+ keyword+'" is already registered.'
  document.getElementById('message').appendChild(msg)
}

function clearMessage(){
  var el = document.getElementById("message");
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function renderTag(keyword,state){
  bgr.console.log('called!');
  var div = document.createElement("div");
  div.className='tagbutton';

  var label = document.createElement('label')
  label.innerHTML = '<input id="'+keyword+'" type="checkbox" hidden/><span>'+keyword+'</span>';
  
  label.addEventListener('click',function(){
     chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      bgr.isBookmarked(tabs[0].url, function(id){
        if(id){
          bgr.updateTagStatus(id,keyword,document.getElementById(keyword).checked)
        }
      });
    });
  });

  div.appendChild(label)
  document.getElementById('tags').appendChild(div);

  if(state === 'on'){ document.getElementById(keyword).checked = true }
}