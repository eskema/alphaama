/*

alphaama
mod    c
command line interface
cli

*/


aa.cli = 
{
  name:'cli',
  about:'command line interface module',
  def:
  {
    id:'cli',
    history:[],
    index:0,
  },
  styles:
  [
    '/cli/cli.css',
    '/cli/oto.css'
  ],
  // on_run:[],
  on_upd:[],
  on_collapse:[]
};


// returns false or true if the string is an action
aa.cli.act =s=>
{
  const ns = localStorage.ns;
  if (!ns) return false;
  if (ns.startsWith(s)) return true;
  if (!s.startsWith(ns)) return false;
  if (s[ns.length] === ' ') return false;
  return aa.cli.has_act(s.slice(ns.length))
};


// returns true if the first word of body matches some action's first segment
aa.cli.has_act =body=>
{
  const first = body.split(' ')[0];
  if (!first) return true;
  return aa.actions.some(a=>a.action[0].startsWith(first))
};


// add action to input
aa.cli.add =string=>
{
  let text = aa.cli.t.value;
  let ns = localStorage.ns;
  let dis = `${ns}${string}`;

  if (!text.length || (!text.startsWith(ns)
  && window.confirm('replace input with command?')))
  {
    aa.cli.v(dis);
    return
  }

  let [act,rest] = string.split(aa.regex.fw);
  let [cmd,value] = rest.split(aa.regex.fw);
  if (text.startsWith(`${ns}${act} ${cmd} `))
  {
    aa.cli.v(`${text}, ${value}`);
    return
  }
  aa.cli.v(dis);
};


// clear input
aa.cli.clear =async()=>
{
  aa.cli.t.value = '';
  aa.cli.upd();
};


// on cli collapse
aa.cli.collapse =e=>
{
  fastdom.mutate(()=>
  {
    aa.l.classList.remove('cli_expanded');
    aa.cli.t.blur();
    
    // aa.fx.read_all(aa.logs);
  });
  for (const fun of aa.cli.on_collapse)
    setTimeout(()=>{fun()},0)
  aa.bus.emit('cli:collapse')
};


// parses string as action and executes it
aa.cli.exe =async(s='')=>
{
  if (s.trim() === '.aa nostr fucking client') 
  {
    aa.nfc(); return
  }
  const ns = localStorage.ns;
  if (!s.startsWith(ns)) return;
  let body = s.slice(ns.length);
  let commands = body.split(' && ');
  for (const command of commands)
  {
    let acts = command.split(' | ');
    let output;
    for (const ac of acts)
    {
      let act;
      let cut;
      let cmd = ac.trim().split(aa.regex.fw);
      let actions = aa.actions.filter(o=>o.action[0] === cmd[0]);
      if (actions.length > 1)
      {
        let sub_cmd = cmd[1].split(aa.regex.fw);
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
        if (sub) cut = cmd[1].split(aa.regex.fw)[1];
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
    if (output) aa.log(output)
  }
};


// on cli expand
aa.cli.expand =e=>
{
  fastdom.mutate(()=>
  {
    aa.l.classList.add('cli_expanded');
    
    aa.cli.upd();
    aa.fx.scroll(aa.logs.lastChild);
    aa.cli.foc();
  });
};


// focus input
aa.cli.foc =()=>
{
  fastdom.mutate(()=>
  {
  aa.cli.t.setSelectionRange(aa.cli.t.value.length,aa.cli.t.value.length);
  aa.cli.t.focus({preventScroll:true});
  })
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
  if (e.key === 'b' && e.ctrlKey)
  {
    e.preventDefault();
    aa.mk.b_upload();
  }
};


// on load
aa.cli.load =async e=>
{
  aa.cli.mk();

  aa.bus.on('cli:stage', s =>{ aa.cli.add(s); aa.cli.foc() });
  aa.bus.on('cli:set', s =>{ aa.cli.v(s) });
  aa.bus.on('cli:dismiss', reason =>{ aa.cli.fuck_off(reason) });
  aa.bus.on('cli:oto_append', el =>{ aa.cli.oto.append(el) });
  aa.bus.on('cli:upd_from_oto', (s,w) =>{ aa.cli.upd_from_oto(s,w) });
  aa.bus.on('cli:set_default', action =>{ aa.cli.def.action = action });
  aa.bus.provide('cli:value', () => aa.cli.t.value);
  aa.bus.provide('cli:default', () => aa.cli.def.action);
};


// make cli element
aa.cli.mk =()=>
{
  aa.cli.l = make('search',{id:'cli'});
  aa.el.set('cli',aa.cli.l);
  aa.cli.oto = make('ul',{id:'oto',cla:'list'});
  aa.cli.t = make('textarea',
  {
    id:'cli_t',
    name:'content',
    placeholder:'whatever the fuck u want',
    tabindex:1,
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'off',
    contenteditable: true,
    rows: 1,
  });
  // aa.cli.t.autocomplete = 'off';
  // aa.cli.t.autocorrect = 'off';
  // aa.cli.t.spellcheck = 'off';
  // aa.cli.t.contentEditable = true;
  aa.cli.t.oninput = aa.cli.upd;
  aa.cli.t.onfocus = aa.cli.expand;
  aa.cli.t.onkeydown = aa.cli.keydown;
  aa.cli.t.onselectionchange = aa.cli.selection;
  // aa.cli.t.rows = 1;
  const butts = make('p',{cla:'butts'});
  butts.append(
    make('button',
    {
      cla:'cli_collapse',
      con:'-',
      tit:'hide input',
      clk:aa.cli.collapse,
      tab:2
    }),
    make('button',
    {
      cla:'cli_expand',
      con:'T',
      tit:'expand toggle',
      dat:{controls:'cli'},
      clk:aa.clk.expand,
      tab:3
    })
  );
  let logs_frag = new DocumentFragment();
  logs_frag.append(
    aa.logs,
    // make('button',
    // {
    //   cla:'butt',
    //   con:'mark read',
    //   clk:aa.logs_read
    // })
  );

  let logs_section = aa.mk.section(
  {
    id: 'l',
    name: 'logs',
    element:logs_frag,
    expanded:true,
    clk:aa.logs_mark_read
  });
  // let butt = replies_section.firstElementChild.firstElementChild;
  // butt.classList.add('mark_read');

  aa.cli.l.append(
    aa.cli.t,
    logs_section,
    aa.cli.oto,
    butts,
  );
  return aa.cli.l


};


// filters actions for autocomplete and add items to oto
// receives the command body (input with ns prefix already stripped)
aa.cli.oto_act =(body)=>
{
  const a = body.split(' ');
  // first level, group all actions by section
  if (!a[0])
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
    let dis_act = aa.actions.find(i=>i.action[0] === a[0] && i.action[1] === a[1]);
    if (!dis_act)
    {
      let single_action = aa.actions.find(i=>i.action[0] === a[0]);
      if (single_action && single_action.action.length === 1) dis_act = single_action;
    }
    if (dis_act) aa.cli.oto.append(aa.mk.oto_act_item(dis_act,'pinned'));
    else
    {
      let actions = aa.actions.filter(o=>o.action[0].startsWith(a[0]))
      .sort((a,b)=>a.action[1]>b.action[1]?1:-1);
      for(const act of actions)
      {
        let action = act.action[0]+' '+act.action[1];
        if (action.startsWith(body)) aa.cli.oto.append(aa.mk.oto_act_item(act));
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
  if (aa.cli.act(s)) aa.cli.exe(s);
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
  fastdom.mutate(()=>
  {
    aa.cli.oto.textContent = '';
    aa.cli.oto.dataset.s = s;

    if (!s.length)
    // maybe action
    {
      aa.cli.oto.append(aa.mk.oto_act_item({action:[]}));
    }
    else if (s.startsWith(ns) && s[ns.length] !== ' ' && aa.cli.has_act(s.slice(ns.length)))
    // is action
    {
      aa.cli.oto_act(s.slice(ns.length));
    }
    else if (ns.startsWith(s))
    // typing partial ns (multi-char ns)
    {
      aa.cli.oto.append(aa.mk.oto_act_item({action:[]}));
    }
    else
    {
      if (aa.cli.def.action) aa.cli.oto.append(aa.mk.oto_act_item(aa.cli.def.action,'pinned'));
      aa.cli.oto.dataset.s = '';
    }
    if (s)
    {
      for (const fun of aa.cli.on_upd) fun(s);
      aa.bus.emit('cli:upd',s);
    }
    aa.cli.h();
  });
};


// when updating from otocomplete options
aa.cli.upd_from_oto =(s,w=false)=>
{
  let trimmed = s.trim();
  let suffix = trimmed === localStorage.ns ? '' : ' ';
  aa.cli.t.value = aa.cli.t.value.slice(0,-Math.abs(w.length??s.length)) + trimmed + suffix;
  aa.cli.foc();
  aa.cli.upd();
};


// changes input value and expands cli
aa.cli.v =async s=>
{
  aa.cli.t.value = s;
  aa.cli.expand();
};


