// broadcast note action
aa.clk.bro =e=>
{
  const note = e.target.closest('.note');
  aa.cli.v(`${localStorage.ns} e bro ${note.dataset.id}`);
};


// fetch note
aa.clk.fetch =e=>
{
  const note = e.target.closest('.note');

  let filter = '{';
  const id = note.dataset.id;
  if (id) filter += `"ids":["${id}"],`;
  else
  {
    const [kind,pubkey,ds] = note.dataset.id_a.split(':');
    filter += `"authors":[${pubkey}],"kinds":[${kind}],"#d":[${ds}],`;
  }
  filter += '"eose":"close"}';
  
  let relset = 'read ';
  if (note.dataset.r)
  {
    let r = note.dataset.r.trim().split(' ');
    if (r.length) 
    {
      let url = aa.is.url(r[0])?.href;
      if (url) relset = url+' ';
    }
  }
  aa.cli.v(localStorage.ns+' '+aa.q.def.id+' req '+relset+filter);
};


// mark replies as read
aa.clk.mark_read =e=>
{
  e.stopPropagation();
  const classes = ['haz_new_reply','haz_new','is_new'];
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


// note actions
aa.clk.na =e=>
{
  let l = e.target.closest('.actions');
  if (l.classList.contains('empty'))
  {
    for (const s of aa.e.butts.na) l.append(' ',aa.mk.butt_clk(s));
    l.classList.remove('empty');
  }
  l.classList.toggle('expanded');
};


// toggle parsed content
aa.clk.render =e=>
{
  const note = e.target.closest('.note');
  aa.e.render(note,{trust:localStorage.trust});
};


// request replies to note
aa.clk.req =e=>
{
  const note = e.target.closest('.note');
  const filter = '{"#e":["'+note?.dataset.id+'"],"kinds":[1],"limit":100}';
  aa.cli.v(`${localStorage.ns} ${aa.q.def.id} req read ${filter}`);
};


// update elapsed time of note and parents up to root
aa.clk.time =e=> 
{
  if (!e.target) return;
  const all = e.target.closest('.root')?.querySelectorAll('time');
  if (all) for (const t of all)
  {
    const timestamp = parseInt(t.textContent);
    const date = aa.fx.time_to_date(timestamp);
    t.dataset.elapsed = aa.fx.time_elapsed(date);
  }
};


// toggle tiny note 
aa.clk.tiny =e=>
{
  const note = e.target.closest('.note');
  note.classList.toggle('tiny');
  const is_tiny = note.classList.contains('tiny');
  if (is_tiny) sessionStorage[note.dataset.id] = 'tiny';
  else sessionStorage[note.dataset.id] = '';
  aa.fx.scroll(note,{behavior:'smooth',block:is_tiny?'start':'center'});
};