const cli = 
{
  o:{id:'cli',ls:[],index:0},
  history:{ ls:[],index:0 },
  clk:{},
};

cli.load =e=>
{
  const l = it.mk.l('footer',{id:'cli'});
  
  let butt = it.mk.l('button',
  {
    id:'cli_collapse',
    con:'-',
    tit:'hide input',
    clk:cli.collapse
  });
  butt.tabIndex = 2;

  cli.t = it.mk.l('textarea',{id:'is'});
  cli.t.name = 'content';
  cli.t.placeholder = 'whatever the fuck u want';
  cli.t.autocomplete = 'off';
  cli.t.autocorrect = 'off';
  cli.t.contentEditable = true;
  cli.t.tabIndex = 1;
  cli.t.oninput = cli.update;
  cli.t.onfocus = cli.expand;
  cli.t.onkeydown = cli.keydown;
  cli.oto = it.mk.l('ul',{id:'oto',cla:'list'});

  l.append(butt,cli.t,cli.oto);
  document.body.insertBefore(l,document.body.lastChild);
};

cli.collapse =e=>
{
  aa.l.classList.remove('cli_expanded');
  cli.t.blur()
};

cli.expand =e=>
{
  cli.foc;
  aa.l.classList.add('cli_expanded');
  cli.otocomp();
};

cli.foc =()=>
{
  cli.t.setSelectionRange(cli.t.value.length,cli.t.value.length);
  cli.t.focus({preventScroll:true});
}

cli.clear =()=>
{
  cli.t.value = '';
  cli.update();
};

cli.fuck_off =(log=false)=>
{
  cli.clear();
  cli.collapse();
  if (log) v_u.log(log)
};

cli.v =s=>
{
  cli.t.value = s;
  cli.expand();
  cli.foc();
};

cli.grow_hack =()=>
{
  const id = 'textarea-grow-hack';
  let l = document.getElementById(id);
  if (!l) 
  { 
    l = it.mk.l('div',{id:id}); 
    document.getElementById('cli').append(l) 
  }
  l.textContent = cli.t.value;
};

cli.update =e=>
{
  // console.log(e);
  if (e?.inputType === "insertFromPaste")
  {
    const pasted = cli.t.value;
    cli.t.value = pasted.trim();
  }
  cli.grow_hack();
  cli.otocomp();
};

cli.goto =index=>
{
  cli.t.value = cli.history.ls[index] ? cli.history.ls[index] : '';
  cli.t.setSelectionRange(0,0);
  cli.update();
};

cli.keydown =e=>
{ 
  if (e.key === 'Enter' && e.shiftKey === false) 
  {
    e.preventDefault();
    if (cli.t.value.length) cli.compost(cli.t.value);
  }
  if (e.key === 'ArrowUp' && cli.t.selectionStart === 0) 
  {
    e.preventDefault();
    if (cli.history.index > 0) 
    {
      cli.history.index--;
      cli.goto(cli.history.index);
    }
  }
  if (e.key === 'ArrowDown' && cli.t.selectionStart === 0) 
  {
    e.preventDefault();
    if (cli.history.index < cli.history.ls.length)
    {
      cli.history.index++;
      cli.goto(cli.history.index);
    }
  }
  else if (e.key === 'Escape') cli.collapse();
};

cli.pre_compost =s=>
{
  if (s.length)
  {
    const dis = v_u.viewing;    
    if (dis && cli.dat?.replying !== dis) delete cli.dat;
    if (!cli.hasOwnProperty('dat')) cli.mk_dat(s,dis)
    else cli.dat.event.content = s;
  }
  else if (cli.hasOwnProperty('dat')) delete cli.dat;
};

cli.compost =s=>
{
  it.a_set(cli.history.ls,[s]);
  cli.history.index = cli.history.ls.length;
  
  if (it.s.act(s)) it.act(s);
  else 
  {
    if (cli.dat) 
    {
      cli.dat.event.created_at = it.tim.now();
      if (cli.dat.event.kind === 1)
      {
        cli.dat.event.tags.push(...it.parse.hashtags(s));
        const mentions = it.parse.mentions(s);
        for (const mention of mentions)
        {
          let add = true;
          for (const t of cli.dat.event.tags)
          {
            if (t[0] === mention[0] && t[1] === mention[1]) add = false;
          }
          if (add) cli.dat.event.tags.push(mention)
        }
      }
      
      kin.draft(cli.dat.event);
      delete cli.dat;
    }
    else 
    {
      v_u.log('unable to create note:');
      if (!aka.o.ls.xpub)
      {
        v_u.log('you need to login first');
        v_u.log(localStorage.ns+' u login');
      }
      v_u.log(s);
    }
    cli.fuck_off();
  }
};

cli.upd_from_oto =(s,w=false)=>
{
  cli.t.value = cli.t.value.slice(0,-Math.abs(w.length??s.length)) + s.trim() + ' ';
  cli.update();
  cli.foc();
};

cli.mention =(w)=>
{
  let s = w.slice(1).toLowerCase();
  const a = Object.values(aa.p).filter(p=> 
    p.metadata?.name?.toLowerCase().startsWith(s)
    || p.petname?.toLowerCase().startsWith(s)
    || p.metadata?.nip05?.toLowerCase().includes(s)
  );
  for (p of a)
  {
    const l = it.mk.l('li',{cla:'item mention',bef:p.metadata.name??''});
    let after =  (p.petname?p.petname:p.extradata.petnames[0])+' '+(p.metadata.nip05??'');
    l.append(it.mk.l('span',{cla:'description',con:after,}),it.mk.l('span',{cla:'val',con:p.npub}));
    l.tabIndex = '1';
    const clk =e=>
    {
      cli.upd_from_oto('nostr:'+e.target.querySelector('.val').textContent,w);
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
    cli.oto.append(l)
  }
};

cli.act_item =(o,s)=>
{
  const l = it.mk.l('li',{cla:'item',bef:localStorage.ns});
  l.append(it.mk.l('span',{cla:'val',con:o.action.join(' ')}));
  l.tabIndex = '1';
  if (o.required) l.append(' ',it.mk.l('span',{cla:'required',con:o.required.join(' ')}));
  if (o.optional) l.append(' ',it.mk.l('span',{cla:'optional',con:o.optional.join(' ')}));
  if (o.description) l.append(' ',it.mk.l('span',{cla:'description',con:o.description}));
  if (o.acts?.length)
  {
    let acts = it.mk.l('span',{cla:'acts'})
    l.append(' ',acts);
    for (const act of o.acts)
    {
      let butt = it.mk.l('button',{cla:'butt acts',con:act,clk:e=>
      {
        e.stopPropagation();
        e.preventDefault();
        let text = localStorage.ns+' ';
        text += e.target.closest('.item').querySelector('.val').textContent+' ';
        text += act+' ';
        cli.upd_from_oto(text);
      }});
      acts.append(butt);
    }
  }
  
  if (s === 'pinned') l.classList.add('pinned');
  else
  {
    const clk =e=>
    {
      e.stopPropagation();
      e.preventDefault();
      cli.upd_from_oto(localStorage.ns+' '+e.target.closest('.item').querySelector('.val').textContent);
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

cli.action =(s,a)=>
{
  if (a.length === 1 || (a.length === 2 && a[1] === ''))
  {
    let sn = {};
    for (const act of aa.actions)
    {
      let a0 = act.action[0];
      if (!sn.hasOwnProperty(a0)) sn[a0] = {action:[a0],acts:[]};
      sn[a0].acts.push(act.action[1]);
    }
    let sorted = Object.keys(sn).sort();
    for (const k of sorted) cli.oto.append(cli.act_item(sn[k]));
  }
  else
  {
    let actions = aa.actions.filter(o=>o.action[0].startsWith(a[1]));
    // console.log(actions);
    for(const act of actions)
    {
      let action = localStorage.ns+' '+act.action[0]+' '+act.action[1];
      if (action.startsWith(s)) cli.oto.append(cli.act_item(act));
      else if (s.startsWith(action)) cli.oto.append(cli.act_item(act,'pinned'));
    }
    if (!cli.oto.childNodes.length)
    {
      cli.oto.append(cli.act_item({action:['invalid action']},'pinned'));
    }
  }
};

cli.otocomp =()=>
{
  const ns = localStorage.ns;
  const s = cli.t.value.replace(/\u2028/g,'');
  const a = s.split(' ');
  
  cli.oto.textContent = '';
  cli.oto.dataset.s = s;
  
  if (!s.length || (ns.startsWith(a[0]) && a.length < 2))  
  cli.oto.append(cli.act_item({action:[]}));
  else if (a[0] === ns) cli.action(s,a); // else if it's an action
  else 
  { 
    // it's not an action
    const w = a[a.length - 1].toLowerCase();
    if (w.startsWith('@') && w.length > 1)  cli.mention(w);
  }

  if (aka.o.ls.xpub) cli.pre_compost(s)
};

cli.mk_dat =async(s,dis)=>
{
  cli.dat = 
  {
    event:
    {
      pubkey:aka.o.ls.xpub,
      kind:1,
      created_at:it.tim.now(),
      content:s,
      tags:[]
    }
  };
  if (dis)
  {
    let x = it.fx.decode(dis);
    if (dis.startsWith('note'))
    {
      let reply_dat = aa.e[x];
      if (!reply_dat) reply_dat = await aa.db.get_e(x);
      if (reply_dat)
      {
        console.log(reply_dat);
        const reply_e = aa.e[x].event;
        cli.dat.event.tags.push(...it.get_tags_for_reply(reply_e));
        cli.dat.replying = dis;
      }      
    }
    else if (dis.startsWith('npub'))
    {
      cli.dat.event.kind = 4;
      cli.dat.event.tags.push(['p',x])
    }
  }
};

it.act =s=>
{
  let a = s.split(' ');
  a.shift();
  let err = 'invalid action';
  if (a.length > 1) 
  {
    let actions = aa.actions.filter(o=>o.action[0] === a[0] && o.action[1] === a[1]);
    if (actions.length > 1)
    {
      console.log(actions);
      actions.filter(o=>o.action[2] === a[2]);
    }
    let act = actions[0];
    a.splice(0,2);
    let cut = a.join(' ');
    act.exe(cut);
  }
  else v_u.log(err)
};

it.s.act =s=>
{
  const ns = localStorage.ns;
  if (ns)
  {
    if (ns.startsWith(s) || s.startsWith(ns+' ') || s === ns) return true;
  }
  return false
};