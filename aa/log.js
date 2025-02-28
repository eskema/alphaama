aa.log_parse =(s='')=>
{
  aa.log(aa.mk.item('parse',aa.parse.j(s),'p'))
}


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


// mark logs as read
aa.logs_read =async e=>
{
  let ls = [];
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
    action:['l','l'],
    required:['text'],
    description:'log text to logs',
    exe:s=>{aa.log(s)}
  },
  {
    action:['l','parse'],
    required:['stringified_object'],
    description:'parse stringified object as structured element',
    exe:aa.log_parse
  },
  {
    action:['l','x'],
    description:'clear logs',
    exe:aa.logs_clear
  },
);