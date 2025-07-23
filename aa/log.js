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

// mark log as read
aa.log_read =async l=>
{
  fastdom.measure(()=>
  {
    l.blur();
  });
  fastdom.mutate(()=>
  {
    l.classList.remove('is_new');
    l.classList.add('just_added');
  })
};


// log a stringified object as item
aa.log_parse =(s='')=>
{
  aa.log(aa.mk.item('parse',aa.parse.j(s),{tag_name:'p'}))
};


// mark logs as read
aa.logs_read =async e=>
{
  let ls = [];
  let j_a = aa.logs.querySelectorAll('.just_added');
  for (const i of j_a) i.classList.remove('just_added');
  if (e) 
  {
    let dis = e.target?.classList.contains('is_new') ? e.target 
    : e.target.closest('.l.is_new');
    if (dis) ls.push(dis);
    e.stopPropagation();
  }
  else ls = aa.logs.querySelectorAll('.l.is_new');
  if (ls.length) for (const l of ls) aa.log_read(l);
};


// mark logs as read
aa.logs_clear =async s=>
{
  let ls = document.querySelectorAll('#l .l:not(.mod)');
  for (const l of ls) l.remove();
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