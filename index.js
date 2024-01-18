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

  
  
  if (o_p) o_p.load();
  if (aka) aka.load();
  if (rel) rel.load();
  if (q_e) q_e.load();
  if (cli) cli.load();
  if (dex) dex.load();

  const dialog = it.mk.l('dialog',{id:'dialog'});
  dialog.append(it.mk.l('p',{con:'yo'}))
  document.body.append(dialog);

  setTimeout(v_u.pop,100);
});