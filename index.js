// load alphaama with defaults

aa.load();

window.addEventListener('load',()=>
{
  // run with defaults
  aa.run();
  fetch('/README.md')
  .then(dis=>dis.text()).then(text=>
  {
    let content = aa.parse.content(text);
    let title = text.slice(0,text.indexOf('\n'));
    if (title.startsWith('#')) title = title.slice(1);
    title = title.trim();
    let l = aa.mk.l('article',{cla:'content parsed',app:content});
    let details = aa.mk.details(title,l);
    details.id = 'aa_read_me';
    document.getElementById('view').prepend(details);
  })
});