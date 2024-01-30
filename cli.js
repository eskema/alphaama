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

cli.fuck_off =()=>
{
  cli.clear();
  cli.collapse();
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
      cli.dat.event.tags.push(...it.parse.hashtags(s));
      aa.draft(cli.dat.event);
      delete cli.dat;
    }
    else 
    {
      v_u.log('unable to create note:');
      v_u.log(s);
      if (!aka.o.ls.xpub)
      {
        v_u.log('you need an account key (aka)');
        v_u.log('type: "'+localStorage.ns+' aka" for options');
      } 
    }
    cli.fuck_off();
  }
};

cli.act_item =(main_act,sub_act)=>
{
  const ns = localStorage.ns;
  const l = it.mk.l('li',{cla:'item',bef:ns});
  l.append(it.mk.l('span',{cla:'val',con:main_act+(sub_act?' '+sub_act:'')}));
  const action = aa.ct[main_act];
  let act = action ? action[sub_act] : false;
  if (act)
  {
    if (act.required) l.append(' ',it.mk.l('span',{cla:'required',con:act.required.join(' ')}));
    if (act.optional) l.append(' ',it.mk.l('span',{cla:'optional',con:act.optional.join(' ')}));
    if (act.description) l.append(' ',it.mk.l('span',{cla:'description',con:act.description}));
  }
  l.tabIndex = '1';
  const clk =e=>
  {
    const s = cli.t.value;
    let act = ns + ' ' + e.target.querySelector('.val').textContent;
    // cli.t.value = s.slice(0,s.length - act.length) + act.trim() + ' ';
    cli.t.value = s.slice(0,-Math.abs(act.length)) + act.trim() + ' ';
    cli.update();
    cli.foc();
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
};

cli.action =(s,a)=>
{
  for (const act of Object.keys(aa.ct))
  {
    let act_item;
    if (a.length === 2 && a[1] === '') 
    {
      act_item = cli.act_item(act,'');
      cli.oto.append(act_item);
    }
    else if (act.startsWith(a[1]))
    {
      const acts_a = Object.keys(aa.ct[act]);
      for (const act_a of acts_a)
      {
        let action = localStorage.ns+' '+act+' '+act_a;
        if (action.startsWith(s)) 
        {
          act_item = cli.act_item(act,act_a);
          cli.oto.append(act_item);
        }
        else if (s.startsWith(action)) 
        {
          act_item = cli.act_item(act,act_a);
          act_item.classList.add('pinned');
          cli.oto.append(act_item);
        }
      }
    }
  }
};


cli.otocomp =()=>
{
  const s = cli.t.value;
  const a = s.split(' ');
  
  cli.oto.textContent = ''; 
  cli.oto.dataset.s = '';
  cli.oto.dataset.s = s;
  
  if (!s.length || localStorage.ns.startsWith(s)) 
  {
    let act_item = cli.act_item('','');
    cli.oto.append(act_item);
  }
  else if (a[0] === localStorage.ns) cli.action(s,a); // else if it's an action
  else 
  { 
    // it's not an action
    const w = a[a.length - 1].toLowerCase();
    if (w.startsWith('@') && w.length > 1) 
    {
      console.log('mention')
      // new_mention(l_word.slice(2));
    }
    // else if (s.length) cli.oto.textContent = '';
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
        const reply_e = aa.e[x].event;
        cli.dat.event.tags.push(...it.get_tags(reply_e));
        cli.dat.replying = dis;
      }      
    }
  }
};

cli.pre_compost =s=>
{
  if (s.length)
  {
    const dis = v_u.viewing;
    
    if (dis && cli.dat?.to !== dis) 
    {
      delete cli.dat;
    }

    if (!cli.hasOwnProperty('dat')) 
    {
      cli.mk_dat(s,dis)
    }
    else cli.dat.event.content = s;
    // console.log(dis,cli.dat);
  }
  else if (cli.hasOwnProperty('dat')) delete cli.dat;
};

it.act =s=>
{
  // pipe commands
  // let acts = s.split('||');
  // for (const ac of acts)
  // {
  //   soon™
  // }

  let a = s.split(' ');
  let err = 'invalid action';
  if (a.length > 1) 
  {
    let index = 0, ion = '';
    const snip =()=>{ion=a.shift();index=index+1+ion.length};
    snip();
    if (ion === localStorage.ns) 
    {
      snip();
      let act = aa.ct[ion];
      if (act)
      {
        snip();
        if (act[ion])
        {
          let cut = s.slice(index);
          act[ion].exe(cut); 
        }
        else v_u.log(err);
      }
      else v_u.log(err);
    } 
    else v_u.log(err);
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