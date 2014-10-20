document.addEventListener("DOMContentLoaded", function(event) {
  var keys = JSON.parse(localStorage.keys);
  var tags = JSON.parse(localStorage.tags);
  var keyList = [];
  var noTagList = [];
  keys.forEach(function(keyword,i){
    renderTag(keyword)
    keyList[i] = [];
  });

  tags.forEach(function(tagObj){
    if(tagObj.tag.length===0){
     noTagList.push(tagObj.id)
   }else{
      tagObj.tag.forEach(function(tagname){
        var index = keys.indexOf(tagname);
        if(index>=0){
          keyList[index].push(tagObj.id)
        }
      });
    }
  });

  chrome.bookmarks.getSubTree(localStorage.folderId, function (result){
    if(typeof(result) === 'undefined'){
      alert('can\'t find bookmarks')
    }else{
      renderListContainer('no-tags')
      noTagList.forEach(function(id){
        result[0].children.forEach(function(bookmark){
          if(bookmark.id === id){
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href=bookmark.url;
            a.target='_blank'
            li.innerHTML=bookmark.title;
            a.appendChild(li)
            document.getElementById('no-tags-list').appendChild(a);
          }
        })
      })

      keys.forEach(function(key,i){
        renderListContainer(key)
        if(keyList[i].length>0){
          keyList[i].forEach(function(id){
            result[0].children.forEach(function(bookmark){
              if(bookmark.id === id){
                var li = document.createElement("li");
                var a = document.createElement("a");
                a.href=bookmark.url;
                a.target='_blank'
                li.innerHTML=bookmark.title;
                a.appendChild(li)
                document.getElementById(key+'-list').appendChild(a);
              }
            })
          })
        }
      })
    }
  });
});

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
        renderListContainer(keyword)
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

function deleteTag(keyword, el){
  clearMessage();
  var savedkeywords = JSON.parse(localStorage.keys);
  var index = savedkeywords.indexOf(keyword);
  savedkeywords.splice(index,1);
  localStorage.keys = JSON.stringify(savedkeywords)
  
    var container = document.getElementById(keyword+'-container');
    container.parentNode.removeChild(container);
    lastListNode = container;
    lastTagNode = el.parentNode;
    el.parentNode.remove(el.parentNode);
}

var lastTagNode;
var lastListNode;

function renderTag(keyword){
  var div = document.createElement("div");
    div.innerHTML=keyword;
    div.id=keyword;
  var span = document.createElement("span");
    span.className='del';
    span.innerHTML='x';
    span.addEventListener('click',function(){
      deleteTag(this.parentNode.id, this)
      undo();
    });
  div.appendChild(span)
  document.getElementById('tags').appendChild(div);
}

function renderListContainer(keyword){
  var div = document.createElement("div");
  div.id = keyword+'-container';
  var span = document.createElement("span");
  span.innerHTML = keyword
  span.id = keyword+'-title';
  var ul = document.createElement("ul");
  ul.id = keyword+'-list';
  div.appendChild(span)
  div.appendChild(ul)
  document.getElementById('list').appendChild(div);
}

function undo(){
  var span = document.createElement("span");
  span.innerHTML='undo';
  span.className='undo';
  span.addEventListener('click',function(){
    document.getElementById('tags').appendChild(lastTagNode);
    document.getElementById('list').appendChild(lastListNode);
    clearMessage();
    var savedkeywords = JSON.parse(localStorage.keys);
    savedkeywords.push(lastTagNode.id)
    localStorage.keys = JSON.stringify(savedkeywords)
    lastTagNode=null;
    lastListNode=null;
  });
  document.getElementById('message').appendChild(span)
}





