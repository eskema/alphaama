/*

alphaama
mod    c
command line interface
cli

*/


aa.cli = 
{
  def:
  {
    id:'cli',
    history:[],
    index:0,
    scripts:['/cli/mk.js'],
    styles:
    [
      '/cli/cli.css',
      '/cli/oto.css'
    ],
  },
  // on_run:[],
  on_upd:[],
  
};


aa.cli.add =s=>
{
  let text = aa.cli.t.value;
  if (!text.length) 
  {
    aa.cli.v(localStorage.ns+' '+s);
    return
  }
  let ns = localStorage.ns;
  if (!text.startsWith(ns)
  && window.prompt('replace input with command?'))
  {
    aa.cli.v(localStorage.ns+' '+s);
    return
  }
  let [act,rest] = s.split(aa.fx.regex.fw);
  let [cmd,v] = rest.split(aa.fx.regex.fw);
  let fw = ns+' '+act+' '+cmd+' ';
  if (text.startsWith(fw))
  {
    aa.cli.v(`${text}, ${v}`);
    return
  }
  aa.cli.v(localStorage.ns+' '+s);
};


// clear input
aa.cli.clear =async()=>
{
  aa.cli.t.value = '';
  // aa.cli.dat_upd();
  aa.cli.upd();
};


// on cli collapse
aa.cli.collapse =e=>
{
  fastdom.mutate(()=>
  {
    aa.l.classList.remove('cli_expanded');
    aa.cli.t.blur();
    aa.logs_read();
  });
};


// parses string as action and executes it
aa.cli.exe =async(s='')=>
{
  if (s.trim() === '.aa nostr fucking client') 
  {
    aa.nfc(); return
  }
  let a = s.split(localStorage.ns+' ');
  let output;
  for (const action of a)
  { 
    if (!action.length) continue;
    let acts = action.split(' | ');
    for (const ac of acts)
    {
      let act;
      let cut;
      let cmd = ac.split(aa.fx.regex.fw);
      let actions = aa.actions.filter(o=>o.action[0] === cmd[0]);
      if (actions.length > 1)
      {
        let sub_cmd = cmd[1].split(aa.fx.regex.fw);
        let sub_actions = actions.filter(o=>o.action[1] === sub_cmd[0]);
        if (sub_actions.length)
        {
          act = sub_actions[0];
          cut = sub_cmd[1];
        }
      }
      else if (actions.length)
      {
        act = actions[0];
        let sub = actions[0].action.length > 1;
        if (sub) cut = cmd[1].split(aa.fx.regex.fw)[1];
        else cut = cmd[1];
      }
      if (act && 'exe' in act)
      {
        aa.cli.clear();
        cut = cut ? cut.trim() : '';
        let cat = output ? (cut?cut+' ':'')+output : cut;
        output = await act.exe(cat);
        if (typeof output === 'object') output = JSON.stringify(output);
      }
    }
  }
  if (output) aa.log(output)
};



// creates new dat object (event)
aa.cli.dat_mk =async(s,reply_to)=>
{
  aa.cli.dat = aa.mk.dat(
  {
    event: aa.e.normalise({content:s}),
    clas:['draft']
  });

  aa.fx.reply(aa.cli.dat,reply_to);
};


aa.fx.reply =async(dat,reply_s)=>
{
  if (!reply_s) return;

  let x = aa.fx.decode(reply_s);
  // if (reply_s.startsWith('note'))
  // {
    let reply_dat = await aa.db.get_e(x);
    if (!reply_dat) 
    {
      console.log('reply not found')
      return
    }
    dat.replying = reply_s;
    aa.e.kinda_reply(dat,reply_dat);
  // }
  // else if (reply_s.startsWith('npub'))
  // {
  //   aa.log('the dm feature has been disabled for now');
  //   // dat.event.kind = 4;
  //   // dat.event.tags = [['p',x]];
  // }
};


aa.cli.draft =(dat)=>
{
  let note = aa.mk.note(dat);
  aa.parse.context(note,dat.event,true);
  note.querySelector('.by').remove()
  let draft = aa.cli.l.querySelector('.note.draft');
  if (draft) draft.replaceWith(note);
  else aa.log(note)
};


// creates / updates / deletes dat event from input
aa.cli.dat_upd =async(s='')=>
{
  if (!s) s = aa.cli.t.value;
  if (s.length)
  {
    const reply_to = aa.view.active;
    if (reply_to && aa.cli.dat?.replying !== reply_to) delete aa.cli.dat;
    if (!Object.hasOwn(aa.cli,'dat')) aa.cli.dat_mk(s,reply_to)
    else aa.cli.dat.event.content = s;
  }
  else if (Object.hasOwn(aa.cli,'dat'))
  {
    delete aa.cli.dat;
  }
};


// on cli expand
aa.cli.expand =e=>
{
  fastdom.mutate(()=>
  {
    aa.l.classList.add('cli_expanded');
    
    aa.cli.upd();
    // aa.logs_read();
    aa.fx.scroll(aa.logs.lastChild);
    aa.cli.foc();
  });
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


// go to index on cli history
aa.cli.history_goto =index=>
{
  let v = aa.cli.t.value;
  aa.cli.t.value = aa.cli.def.history[index] || v;
  aa.cli.t.setSelectionRange(0,0);
  aa.cli.upd();
};


// go to next on cli history
aa.cli.history_next =()=>
{
  if (aa.cli.def.index < aa.cli.def.history.length)
  {
    aa.cli.def.index++;
    aa.cli.history_goto(aa.cli.def.index);
  }
};


// go to previous on cli history
aa.cli.history_previous =()=>
{
  if (aa.cli.def.index > 0) 
  {
    aa.cli.def.index--;
    aa.cli.history_goto(aa.cli.def.index);
  }
};


// add input value to history
aa.cli.history_upd =s=>
{
  aa.fx.a_add(aa.cli.def.history,[s]);
  aa.cli.def.index = aa.cli.def.history.length;
};


// on cli keydown events
aa.cli.keydown =async e=>
{ 
  if (e.key === 'Enter' 
  && e.shiftKey === false) 
  {
    e.preventDefault();
    if (aa.cli.t.value.length) 
    setTimeout(()=>{aa.cli.run(aa.cli.t.value)},0);
  }
  if (e.key === 'ArrowUp' 
  && e.shiftKey === true 
  // && aa.cli.t.selectionStart === 0
  && e.ctrlKey === true)
  {
    e.preventDefault();
    setTimeout(()=>{aa.cli.history_previous()},0);
  }
  if (e.key === 'ArrowDown' 
  && e.shiftKey === true 
  // && aa.cli.t.selectionStart === 0
  && e.ctrlKey === true)
  {
    e.preventDefault();
    setTimeout(()=>{aa.cli.history_next()},0);
  }
  if (e.key === 'Escape') setTimeout(()=>{aa.cli.collapse()},0);
};


// on load
aa.cli.load =async e=>
{
  await aa.mk.scripts(aa.cli.def.scripts);
  fastdom.mutate(()=>
  {
    document.body.insertBefore(aa.cli.mk(),document.body.lastChild.previousSibling);
  });
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
  aa.cli.t.onselectionchange = aa.cli.selection;
  aa.cli.t.rows = 1;
  const butts = aa.mk.l('p',{cla:'butts'});
  butts.append(
    aa.mk.l('button',
    {
      cla:'cli_collapse',
      con:'-',
      tit:'hide input',
      clk:aa.cli.collapse,
      tab:2
    }),
    aa.mk.l('button',
    {
      cla:'cli_expand',
      con:'T',
      tit:'expand toggle',
      dat:{controls:'cli'},
      clk:aa.clk.expand,
      tab:3
    })
  );
  aa.cli.l.append(
    aa.cli.t,
    aa.mk.section('l',1,aa.logs),
    aa.cli.oto,
    butts,
  );
  return aa.cli.l
};


// filters actions for autocomplete and add items to oto
aa.cli.oto_act =(s)=>
{
  const a = s.split(' ');
  // first level, group all actions by section
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
  // sub level, display actions in a single section
  {
    let dis_act = aa.actions.find(i=>i.action[0] === a[1] && i.action[1] === a[2]);
    // let dis_act = aa.actions.filter(i=>i.action[0] === a[1] && i.action[1] === a[2])[0];
    if (!dis_act)
    {
      let single_action = aa.actions.find(i=>i.action[0] === a[1]);
      // let single_action = aa.actions.filter(i=>i.action[0] === a[1])[0];
      if (single_action && single_action.action.length === 1) dis_act = single_action;
    } 
    if (dis_act) aa.cli.oto.append(aa.mk.oto_act_item(dis_act,'pinned'));
    else
    {
      let actions = aa.actions.filter(o=>o.action[0].startsWith(a[1]))
      .sort((a,b)=>a.action[1]>b.action[1]?1:-1);
      for(const act of actions)
      {
        let action = localStorage.ns+' '+act.action[0]+' '+act.action[1];
        if (action.startsWith(s)) aa.cli.oto.append(aa.mk.oto_act_item(act));
      }
      if (!aa.cli.oto.childNodes.length)
      {
        aa.cli.oto.append(aa.mk.oto_act_item({action:['invalid action']},'invalid'));
      }
    }
  }
};


// when input is triggered
aa.cli.run =async s=>
{
  aa.cli.history_upd(s);
  aa.log(s);
  if (aa.is.act(s)) aa.cli.exe(s);
  else if (aa.cli.def.action) aa.cli.def.action.exe(s)
};


aa.cli.selection =e=>
{
  // console.log(e.target.selectionStart,e.target.selectionEnd)
};


// on cli update event
aa.cli.upd =e=>
{
  const s = aa.cli.t.value.replace(/\u2028/g,'');
  const ns = localStorage.ns;
  let space = s.includes(' ');
  let first = space?s.slice(0,s.indexOf(' ')):s;
  fastdom.mutate(()=>
  {
    aa.cli.oto.textContent = '';
    aa.cli.oto.dataset.s = s;
    
    if (!s.length || (!space && ns.startsWith(first)))
    // maybe action
    {
      aa.cli.oto.append(aa.mk.oto_act_item({action:[]}));
    }
    else if (first === ns)
    // is action
    {
      aa.cli.oto_act(s); 
    }
    else
    {
      if (aa.cli.def.action) aa.cli.oto.append(aa.mk.oto_act_item(aa.cli.def.action,'pinned'));
      aa.cli.oto.dataset.s = '';
      aa.cli.dat_upd();
    }
    if (s) for (const fun of aa.cli.on_upd) fun(s);
    aa.cli.h();
  });
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


aa.mk.styles(aa.cli.def.styles);