// internal links
aa.clk.a =e=>
{
  e.preventDefault();
  e.stopPropagation();
  let target = e.target.closest('a[href]');
  let dis = target.getAttribute('href');
  if (dis==='/') dis = '';
  aa.view.state(dis);
};


// adds a clicked class to show interaction
aa.clk.clkd =e=>
{
  let l = e.target;
  l.classList.remove('clkd');
  setTimeout(()=>{l.classList.add('clkd')},100);
};


aa.clk.done =e=>
{
  e.target.classList.add('done')
};


// expand 
aa.clk.expand =e=>
{
  if (e.hasOwnProperty('stopPropagation'))
    e.stopPropagation();
  
  let id = e.target.dataset.controls;
  let element = aa.el.get(id) || e.target;
  if (!element) return;
  let cla = 'expanded';
  let storage_value = '';
  
  if (element.classList.contains(cla))
  {
    fastdom.mutate(()=>
    {
      element.classList.remove(cla)
    })
  }
  else
  {
    storage_value = cla;
    fastdom.mutate(()=>
    {
      element.classList.add(cla)
    })
  }
  sessionStorage[id] = storage_value;
};


// update elapsed time of time element note and parents up to root
aa.clk.time =e=> 
{
  if (!e.target) return;
  let all = e.target.closest('.root')?.querySelectorAll('time') || [e.target];
  for (const l of all) aa.fx.time_upd(l)
};

// mark replies as read
aa.clk.mark =e=>
{
  e.stopPropagation();
  // const classes = ['haz_new_reply','haz_new','is_new'];
  let target = e.target;
  const classes = target.dataset.classes.split(' ');
  const replies = e.target.closest('.replies');
  const note = e.target.closest('.note');
  const root = e.target.closest('.root');
  const rid = note.dataset.id+'_replies';
  const new_stuff = replies.querySelectorAll('.'+classes.join(',.'));
  note.classList.remove(...classes);
  
  if (new_stuff.length)
  {
    e.preventDefault();
    for (const l of new_stuff)
    {
      sessionStorage[l.dataset.id] = 'is_read';
      l.classList.remove(...classes);
    }
    if (replies.classList.contains('expanded')) 
    {
      sessionStorage[rid] = '';
      replies.classList.remove('expanded');
    }
  }
  else 
  {
    if (replies.classList.contains('expanded')) 
    {
      sessionStorage[rid] = '';
      replies.classList.remove('expanded');
    }
    else 
    {
      sessionStorage[rid] = 'expanded';
      replies.classList.add('expanded');
    }
  }
  if (!aa.view.active)
  {
    let top = root.offsetTop + (3 * parseFloat(getComputedStyle(aa.l).fontSize));
    if (top < aa.l.scrollTop) aa.l.scrollTo(0,top);
  }
};

// wip
// aa.clk.list_filter_input =e=>
// {
//   let ls = e.target.nextElementSibling;
//   let lf = make('div',{cla:'lf'});
//   let inp = make('input');
//   lf.append(inp);
//   inp.addEventListener('change',e=>
//   {
//     console.log(inp.value);
//     console.log(ls.childElementCount);
//   });
//   e.target.parentElement.insertBefore(lf,e.target);
//   e.target.remove();
//   // lf.prepend(e.target);
// };