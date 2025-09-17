// view clear
aa.view.clear =()=>
{
  if (aa.view.active)
  {
    const in_view = aa.view.in_view;
    if (in_view)
    {
      in_view.classList.remove('in_view');
      if (in_view.classList.contains('note'))
      {
        if (aa.view.in_path?.length) 
          for (const l of aa.view.in_path) 
            aa.fx.path_rm(l);
      }
      delete aa.view.in_view;
      delete aa.view.id_a;
    }
  }

  fastdom.mutate(()=>
  {
    aa.view.active = false;
    if (aa.state.l) aa.state.l.textContent = '';
    aa.l.classList.remove('viewing','view_e','view_p');
  });
  
  for (const c of aa.clears) c();
};


// view force state
aa.view.force =state=>
{
  if (!Object.hasOwn(state,'last')) 
    state.last = 
      history.state?.view 
      || '';

  let path = 
    location.origin
    + location.pathname
    + state.view;
  
  history.pushState(state,'',path);
  aa.view.pop();
};


// view pop state
aa.view.pop =()=>
{
  let hash = location.hash;
  let search = location.search;
  if (hash.length) [hash,search] = location.hash.split('?');
  if (!search) search = '';
  
  let no_state = 
    !history.state 
    || !history.state.hasOwnProperty('view')
    || history.state === '';
  
  if (no_state) aa.view.state(hash,search);
  else
  {
    aa.view.clear();
    let title = `${aa.aka} ${location.pathname} `;
    const state = history.state.view;
    if (state.length) 
    {
      title += state;
      aa.view.resolve(state,search);
    }
    aa.view.tits(title,state);
  }
};


// view replace state
aa.view.replace =(path='')=>
{
  history.state.view = dis;
  path = 
    location.origin
    +location.pathname
    +path;
  history.replaceState(history.state,'',path);
};


// view resolve state
aa.view.resolve =(path,search)=>
{
  let has_view = false;
  if (path.startsWith('#')) path = path.slice(1);
  
  for (const view in aa.view.ls)
  {
    if (path.startsWith(view))
    {
      has_view = true;
      setTimeout(()=>{ aa.view.ls[view](path) },200);
      break;
    }
  }
  if (!has_view) aa.log('no view for '+path);
};


// view state or go back if same state
aa.view.state =(string='',search='')=>
{
  string = string.trim();
  if (search?.length) 
    search = string.length ? 
      `?${search}`
      : search;

  let view = `${string}${search}`;
  if (view.length && !view.startsWith('#'))
    view = `#${view}`;
  
  let last;
  if (!history.state || history.state.view !== view)
  {
    last = history.state?.view || '';
    aa.view.force({view,last});
  }
  else if (history.length) history.back();
};


// update title and state ui
aa.view.tits =(title,state)=>
{
  fastdom.mutate(()=>
  {
    if (title) document.title = title;
    if (state && aa.state.l) aa.state.l.textContent = state
  });
};


// update view
aa.view.upd =path=>
{
  aa.view.replace(path);
  aa.view.resolve(history.state.view);
};


aa.actions.push(
{
  action:['view'],
  required:['<entity>'],
  description:'load into view note1…, npub1…, nprofile1…',
  exe:aa.view.state
});


window.addEventListener('popstate',aa.view.pop);