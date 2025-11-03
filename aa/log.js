aa.logs = make('ul',{id:'logs',cla:'list'});
// log stuff
aa.log =(con='',container=false,is_new=true)=>
{
  const cla = 'log item'+(is_new?' is_new':'');
  const clk =e=>
  {
    e.stopPropagation();
    aa.log_read(e.target)
  };
  const app = typeof con==='string'?make('p',{con}):con;
  const log = make('li',{cla,clk,app});
  log.append(' ',aa.mk.butt_clip(log.textContent));
  
  if (!container) container = aa.logs;
  if (container) fastdom.mutate(()=>
  {
    container.append(log);
    if (is_new) 
    {
      container.classList.add('has_new');
      if (container.parentElement)
        container.parentElement.classList.add('has_new');
    }
  });
  else console.log('log:',con);
  return log
};


aa.log_details =(id,summary,key,con)=>
{
  let l_id = id;
  let l = aa.el.get(l_id);
  if (!l)
  {
    l = aa.mk.details(summary,0,0,'base');
    aa.el.set(l_id,l);
    aa.log(l);
  }
  else aa.logs.lastChild.after(l.parentElement);

  let l_r = aa.el.get(`${l_id} ${key}`);
  if (!l_r)
  {
    l_r = aa.mk.details(key,0,1,'base');
    aa.el.set(`${l_id} ${key}`,l_r);
    fastdom.mutate(()=>{l.append(l_r)});
  }
  fastdom.mutate(()=>
  {
    l_r.append(make('p',{con}));
    l_r.classList.add('has_new');
  });
};


aa.log_key =(key,value)=>
{
  let item = make('p',{con:value});
  let element = aa.el.get(key);
  if (!element)
  {
    let summary = make('summary',{con:key});
    element = make('details',
    {
      cla: 'base',
      app: [summary,' ',item]
    });
    aa.el.set(key,element);

    // summary.addEventListener('click',e=>
    // {

    // })
    // if (!l) return details;
    // summary.dataset.count = 1;
    // details.append(l);
    // return details

    // element = aa.mk.details(key,item,0,'base');
    // aa.el.set(key,element);
    // aa.log(element);
  }
  let parent = element.parentElement;
  if (parent)
  {
    fastdom.mutate(()=>
    {
      let logs = parent.parentElement;
      element.append(item);
      logs.lastChild.after(parent);
      parent.classList.add('is_new');
      parent.parentElement.classList.add('has_new');
    });
  } 
  else aa.log(element);
  aa.fx.count_upd(element.firstChild);
};


// log a stringified object as item
aa.log_parse =(s='')=>
{
  aa.log(aa.mk.item('parse',aa.pj(s),{tag_name:'p'}))
};


// mark log as read
aa.log_read =async element=>
{
  if (!element) return;
  if (!element.classList.contains('is_new'))
  element = element.closest('.is_new');
  if (!element) return;

  fastdom.measure(()=>
  {
    element.blur();
  });
  fastdom.mutate(()=>
  {
    element.classList.remove('is_new');
    element.classList.add('is_recent');
    let has_new = [...element.parentElement.children]
      .find(i=>i.classList.contains('is_new'));
    if (!has_new) element.parentElement.classList
      .remove('has_new')
  })
};


// mark all logs as read
aa.logs_read =async()=>
{
  let element = aa.logs;
  aa.fx.do_all('.is_recent', 
    item=>{ item.classList.remove('is_recent') }, element
  );
  aa.fx.do_all('.is_new', aa.log_read, element);
  element.parentElement?.classList.remove('has_new');
};


// mark logs as read
aa.logs_mark_read =e=>
{
  let section = e.target.closest('.section');
  let sub_section = aa.logs;
  const classes = ['is_new','has_new'];
  aa.is_read({section,sub_section,classes});
  // const new_stuff = aa.logs.querySelectorAll('.'+classes.join(',.'));
  // if (new_stuff.length)
  // {
  //   for (const element of new_stuff) aa.log_read(element);
    
  //   if (section.classList.contains('expanded')) 
  //   {
  //     section.classList.remove('expanded');
  //   }
  // }
  // else
  // {
  //   if (section.classList.contains('expanded'))
  //   {
  //     section.classList.remove('expanded');
  //   }
  //   else
  //   {
  //     section.classList.add('expanded');
  //   }
  // }
};


// mark logs as read
aa.logs_clear =async s=>
{
  fastdom.mutate(()=>
  {
    aa.logs.textContent = '';
    aa.logs.parentElement?.classList.remove('has_new');
  });
  setTimeout(()=>
  {
    aa.log(aa.mk.status(),0,0);
  },200)
};


aa.actions.push(
  {
    action:['logs','log'],
    required:['<text>'],
    description:'log text to logs',
    exe:aa.log
  },
  {
    action:['logs','parse'],
    required:['<JSON>'],
    description:'JSON parse',
    exe:aa.log_parse
  },
  {
    action:['logs','clear'],
    description:'clear logs',
    exe:aa.logs_clear
  },
);