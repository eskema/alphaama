window.addEventListener('load',()=>
{
  aa.base_ui(['header','view','u']);
  v_u.log('running from '+location.origin);
  
  let s = 'window.nostr ok';
  if (!window.nostr)
  {
    v_u.log(it.mk.l('button',
    {
      con:'!window.nostr - enable it and clk dis to check again.',
      cla:'butt wn',
      clk:e=>
      {
        it.clk.clkd(e.target);
        if (window.nostr)
        {
          let parent = e.target.parentElement;
          parent.textContent = '';
          parent.append(it.mk.l('p',{con:s}));
        } 
      }
    }));
  }
  else v_u.log(s);

  fetch('/README.md').then(dis=>dis.text()).then(dis=>
  {
    let readme_text = it.parse.content({content:dis});
    let readme_l = it.mk.l('article',{cla:'content',app:readme_text});
    v_u.log(it.mk.details('readme',readme_l));
  }).then(()=>
  {
    if (o_p) o_p.load();
    if (aka) aka.load();
    if (rel) rel.load();
    if (q_e) q_e.load();
    if (cli) cli.load();
    if (dex) dex.load();
  });

  document.body.insertBefore(it.mk.l('dialog',{id:'dialog'}),document.body.lastChild);
  
  setTimeout(v_u.pop,100);
});