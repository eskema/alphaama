/*

alphaama
mod  cli
command line interface

*/

aa.styleshit('/cli/cli.css');
aa.styleshit('/cli/oto.css');

aa.cli = 
{
  o:{id:'cli',history:[],index:0},
};




// clear input
aa.cli.clear =async()=>
{
  aa.cli.t.value = '';
  aa.cli.dat_upd();
  aa.cli.upd();
};


// on cli collapse
aa.cli.collapse =e=>
{
  // requestAnimationFrame(e=>
  // {
    aa.l.classList.remove('cli_expanded');
    aa.cli.t.blur();
    aa.logs_read();
  // });
};


// creates new dat object (event)
aa.cli.dat_mk =async(s,reply_to)=>
{
  aa.cli.dat = aa.mk.dat(
  {
    event: aa.e.normalise({content:s}),
    clas:['draft']
  });
  
  if (reply_to)
  {
    let x = aa.fx.decode(reply_to);
    if (reply_to.startsWith('note'))
    {
      let reply_dat = aa.db.e[x];
      if (!reply_dat) reply_dat = await aa.db.get_e(x);
      if (reply_dat)
      {
        const reply_e = aa.db.e[x].event;
        aa.cli.dat.event.tags.push(...aa.get.tags_for_reply(reply_e));
        aa.cli.dat.replying = reply_to;
      }      
    }
    else if (reply_to.startsWith('npub'))
    {
      aa.cli.dat.event.kind = 4;
      aa.cli.dat.event.tags = [['p',x]];
    }
  }
};


// creates / updates / deletes dat event from input
aa.cli.dat_upd =async()=>
{
  const s = aa.cli.t.value;
  if (s.length)
  {
    const reply_to = aa.viewing;    
    if (reply_to && aa.cli.dat?.replying !== reply_to) delete aa.cli.dat;
    if (!aa.cli.hasOwnProperty('dat')) aa.cli.dat_mk(s,reply_to)
    else aa.cli.dat.event.content = s;
  }
  else if (aa.cli.hasOwnProperty('dat')) delete aa.cli.dat;
};


// on cli expand
aa.cli.expand =e=>
{
  requestAnimationFrame(()=>
  {
    aa.l.classList.add('cli_expanded');
    aa.cli.foc();
    aa.cli.upd();
    aa.logs_read();
  })
};


// focus input
aa.cli.foc =()=>
{
  aa.cli.t.setSelectionRange(aa.cli.t.value.length,aa.cli.t.value.length);
  aa.cli.t.focus({preventScroll:true});
}


// clear and collapse cli with optional log reason
aa.cli.fuck_off =(reason=false)=>
{
  aa.cli.clear();
  aa.cli.collapse();
  if (reason) aa.log(reason)
};


// go to index on cli history
aa.cli.history_goto =index=>
{
  let v = aa.cli.t.value;
  aa.cli.t.value = aa.cli.o.history[index] ? aa.cli.o.history[index] : v;
  aa.cli.t.setSelectionRange(0,0);
  aa.cli.dat_upd();
};


// go to next on cli history
aa.cli.history_next =()=>
{
  if (aa.cli.o.index < aa.cli.o.history.length)
  {
    aa.cli.o.index++;
    aa.cli.history_goto(aa.cli.o.index);
  }
};


// go to previous on cli history
aa.cli.history_previous =()=>
{
  if (aa.cli.o.index > 0) 
  {
    aa.cli.o.index--;
    aa.cli.history_goto(aa.cli.o.index);
  }
};


// add input value to history
aa.cli.history_upd =s=>
{
  aa.fx.a_add(aa.cli.o.history,[s]);
  aa.cli.o.index = aa.cli.o.history.length;
};


// on cli keydown events
aa.cli.keydown =async e=>
{ 
  if (e.key === 'Enter' && e.shiftKey === false) 
  {
    e.preventDefault();
    if (aa.cli.t.value.length) aa.cli.run(aa.cli.t.value);
  }
  if (e.key === 'ArrowUp' && aa.cli.t.selectionStart === 0) 
  {
    e.preventDefault();
    aa.cli.history_previous();
  }
  if (e.key === 'ArrowDown' && aa.cli.t.selectionStart === 0) 
  {
    e.preventDefault();
    aa.cli.history_next();
  }
  if (e.key === 'Escape') aa.cli.collapse();
};


// on load
aa.cli.load =e=>
{
  aa.cli.fun = aa.mk.k1;
  document.body.insertBefore(aa.cli.mk(),document.body.lastChild);
};


// make cli element
aa.cli.mk =()=>
{
  aa.cli.l = aa.mk.l('search',{id:'cli'});
  aa.cli.oto = aa.mk.l('ul',{id:'oto',cla:'list'});
  aa.cli.t = aa.mk.l('textarea',
  {
    id:'cli_t',
    nam:'content',
    pla:'whatever the fuck u want',
    tab:1,
  });
  aa.cli.t.autocomplete = 'off';
  aa.cli.t.autocorrect = 'off';
  aa.cli.t.spellcheck = 'off';
  aa.cli.t.contentEditable = true;
  aa.cli.t.oninput = aa.cli.upd;
  aa.cli.t.onfocus = aa.cli.expand;
  aa.cli.t.onkeydown = aa.cli.keydown;
  aa.cli.t.rows = 1;

  aa.cli.l.append(
    aa.mk.l('button',
    {
      id:'cli_collapse',
      con:'-',
      tit:'hide input',
      clk:aa.cli.collapse,
      tab:2
    }),
    aa.cli.t,
    aa.mk.section('l',1,aa.logs),
    aa.cli.oto
  );
  return aa.cli.l
};


// creates a mention
aa.cli.mention =w=>
{
  // remove @ from start of word string
  let s = w.slice(1).toLowerCase();
  // filter p conditions
  const for_mentions =p=> 
  {
    if (p.hasOwnProperty('metadata'))
    {
      if (p.metadata.hasOwnProperty('name') && p.metadata.name?.length
      && p.metadata.name.toLowerCase().includes(s)) 
        return true;
      if (p.metadata.hasOwnProperty('nip05') && p.metadata.nip05?.length
      && p.metadata.nip05.toLowerCase().includes(s)) 
        return true;
    }
    if (p.petname?.length
    && p.petname.toLowerCase().includes(s)) 
      return true;
  };
  // 
  const a = Object.values(aa.db.p).filter(for_mentions);
  for (const p of a) aa.cli.oto.append(aa.mk.mention_item(p,w));
};

aa.mk.mention_item =(p,w)=>
{
  const l = aa.mk.l('li',{cla:'item mention',bef:p.metadata.name??''});
  let after = (p.petname?p.petname:p.petnames[0])+' '+(p.metadata.nip05??'');
  l.append(
    aa.mk.l('span',{cla:'description',con:after,}),
    aa.mk.l('span',{cla:'val',con:p.npub})
  );
  l.tabIndex = '1';
  
  const clk =e=>
  {
    aa.cli.upd_from_oto('nostr:'+e.target.querySelector('.val').textContent,w);
  };
  l.onclick = clk;
  l.onkeydown =e=>
  {
    if (e.key === 'Enter')
    {
      e.stopPropagation();
      e.preventDefault();
      clk(e)
    }
  };
  return l
}


// filters actions for autocomplete and add items to oto
aa.cli.oto_act =(s,a)=>
{
  const sort_act =(a,b)=>{ return a.action[1] > b.action[1] ? 1 : -1 };

  if (a.length === 1 || (a.length === 2 && a[1] === ''))
  {
    let sn = {};
    for (const act of aa.actions)
    {
      let a0 = act.action[0];
      if (!sn.hasOwnProperty(a0)) sn[a0] = {action:[a0],acts:[]};
      sn[a0].acts.push(act.action[1]);
      sn[a0].acts.sort();
    }
    let sorted = Object.keys(sn).sort();
    for (const k of sorted) aa.cli.oto.append(aa.mk.oto_act_item(sn[k]));
  }
  else
  {
    let dis_act = aa.actions.filter(i=>i.action[0] === a[1] && i.action[1] === a[2])[0];
    if (dis_act) aa.cli.oto.append(aa.mk.oto_act_item(dis_act,'pinned'));
    else
    {
      let actions = aa.actions.filter(o=>o.action[0].startsWith(a[1])).sort(sort_act);
      // console.log(actions);
      for(const act of actions)
      {
        let action = localStorage.ns+' '+act.action[0]+' '+act.action[1];
        if (action.startsWith(s)) aa.cli.oto.append(aa.mk.oto_act_item(act));
        // else if (s.startsWith(action)) aa.cli.oto.append(aa.mk.oto_act_item(act,'pinned'));
      }
      if (!aa.cli.oto.childNodes.length)
      {
        aa.cli.oto.append(aa.mk.oto_act_item({action:['invalid action']},'invalid'));
      }
    }
  }
};


// makes an action item for otocomplete
aa.mk.oto_act_item =(o,s)=>
{
  const l = aa.mk.l('li',{cla:'item',bef:localStorage.ns});
  l.append(aa.mk.l('span',{cla:'val',con:o.action.join(' ')}));
  l.tabIndex = '1';
  if (o.required) l.append(' ',aa.mk.l('span',{cla:'required',con:o.required.join(' ')}));
  if (o.optional) l.append(' ',aa.mk.l('span',{cla:'optional',con:o.optional.join(' ')}));
  if (o.description) l.append(' ',aa.mk.l('span',{cla:'description',con:o.description}));
  if (o.acts?.length)
  {
    let acts = aa.mk.l('span',{cla:'acts'})
    l.append(' ',acts);
    for (const act of o.acts)
    {
      let butt = aa.mk.l('button',{cla:'butt acts',con:act,clk:e=>
      {
        e.stopPropagation();
        e.preventDefault();
        let text = localStorage.ns+' ';
        text += e.target.closest('.item').querySelector('.val').textContent+' ';
        text += act+' ';
        aa.cli.upd_from_oto(text);
      }});
      acts.append(butt);
    }
  }
  
  if (s === 'pinned' || s === 'invalid') l.classList.add(s);
  else
  {
    const clk =e=>
    {
      e.stopPropagation();
      e.preventDefault();
      aa.cli.upd_from_oto(localStorage.ns+' '+e.target.closest('.item').querySelector('.val').textContent);
    };
    l.onclick = clk;
    l.onkeydown =e=>
    {
      if (e.key === 'Enter')
      {
        e.stopPropagation();
        e.preventDefault();
        clk(e)
      }
    };
  }
  return l
};


// when input is triggered
aa.cli.run =async s=>
{
  aa.cli.history_upd(s);
  if (aa.is.act(s)) aa.exe(s);
  else aa.cli.fun(s)
};

aa.mk.k1 =async(s='')=>
{
  if (aa.cli.dat) 
  {
    aa.cli.dat.event.created_at = aa.t.now;
    if (aa.cli.dat.event.kind === 1)
    {
      aa.cli.dat.event.tags.push(...aa.get.hashtag(s));
      const mentions = await aa.get.mentions(s);
      for (const mention of mentions)
      {
        let add = true;
        for (const t of aa.cli.dat.event.tags)
        {
          if (t[0] === mention[0] && t[1] === mention[1]) add = false;
        }
        if (add) aa.cli.dat.event.tags.push(mention)
      }
    }
    
    aa.e.draft(aa.cli.dat);
    delete aa.cli.dat;
    aa.cli.fuck_off();
  }
  else 
  {
    aa.log(s);
    let log_text = 'unable to create note';
    if (!aa.u?.p?.xpub)
    {
      log_text += ', login first using the command: ';
      log_text += localStorage.ns+' u login';
    }
    aa.log(log_text);      
  }
}


// on cli update event
aa.cli.upd =e=>
{
  const s = aa.cli.t.value.replace(/\u2028/g,'');
  const a = s.split(' ');
  const ns = localStorage.ns;
  const maybe_action = !s.length || (ns.startsWith(a[0]) && a.length < 2);
  const is_action = a[0] === ns;

  aa.cli.oto.textContent = '';
  aa.cli.oto.dataset.s = s;
  
  if (maybe_action) aa.cli.oto.append(aa.mk.oto_act_item({action:[]}));
  else if (is_action) aa.cli.oto_act(s,a); 
  else 
  { 
    // it's not an action, check for last word
    const last_word = a[a.length - 1].toLowerCase();
    // if is a mention attempt
    if (last_word.startsWith('@') && last_word.length > 1)  aa.cli.mention(last_word);
    if (aa.u.p) aa.cli.dat_upd()
  }
  setTimeout(aa.cli.h,300);
};

// update textarea height
aa.cli.h =()=>
{
  aa.cli.t.style.height = 'unset';
  aa.cli.t.style.height = aa.cli.t.scrollHeight+'px';
  if (aa.cli.t.selectionStart === aa.cli.t.value.length) 
  {
    aa.cli.t.scrollTop = aa.cli.t.scrollHeight;
  }
};


// when updating from otocomplete options
aa.cli.upd_from_oto =(s,w=false)=>
{
  aa.cli.t.value = aa.cli.t.value.slice(0,-Math.abs(w.length??s.length)) + s.trim() + ' ';
  aa.cli.foc();
  aa.cli.upd();
};


// changes input value and expands cli
aa.cli.v =async s=>
{
  aa.cli.t.value = s;
  aa.cli.expand();
};

window.addEventListener('load',aa.cli.load);