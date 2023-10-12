window.electronAPI.getDetail("name").then( (name) => {
  
  document.querySelector(`title`).textContent="How to use "+name;
  
  document.querySelectorAll(`.nameField`).forEach( (nameField)=>{
    nameField.textContent=name;
  });
  
  document.querySelectorAll(`.autoLink`).forEach( (autoLink)=>{
    autoLink.setAttribute('href', '');
    let url = autoLink.getAttribute("url");
    autoLink.onclick = (event)=>{ window.electronAPI.openExternal( url ) };
  });

}).catch( (error)=>{
  console.log(error);
});
