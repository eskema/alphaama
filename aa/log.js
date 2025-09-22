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
    l_r.append(aa.mk.l('p',{con}));
    l_r.classList.add('has_new');
  });
};


aa.log_key =(key,value)=>
{
  let item = aa.mk.l('p',{con:value});
  let element = aa.el.get(key);
  if (!element)
  {
    let summary = aa.mk.l('summary',{con:key});
    element = aa.mk.l('details',
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
      element.append(item);
      parent.parentElement.lastChild.after(parent);
      parent.classList.add('is_new')
    });
  } 
  else aa.log(element);
  aa.fx.count_upd(element.firstChild);
};


// log a stringified object as item
aa.log_parse =(s='')=>
{
  aa.log(aa.mk.item('parse',aa.parse.j(s),{tag_name:'p'}))
};


// mark logs as read
aa.logs_read =async()=>
{
  let element = aa.logs;
  aa.fx.do_all(element,'.is_recent',
    i=>{i.classList.remove('is_recent')})
  aa.fx.do_all(element,'.is_new',aa.log_read)
};


// mark logs as read
aa.logs_clear =async s=>
{
  setTimeout(()=>
  {
    fastdom.mutate(()=>{aa.logs.textContent = ''});
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