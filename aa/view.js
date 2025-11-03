// alphaama view mod
aa.view =
{
  active:false,
  clears:[],
  ls:{},
};

// view clear
aa.view.clear =()=>
{
  aa.view.active = false;
  const in_view = aa.view.in_view;
  if (in_view)
  {
    in_view.classList.remove('in_view');
    delete aa.view.in_view;
  }
  fastdom.mutate(()=>
  {
    if (aa.el.has('state')) aa.el.get('state').textContent = '';
    aa.l.classList.remove('viewing');
  });
  
  for (const callback of aa.view.clears) callback(in_view);
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
  history.state.view = path;
  path = 
    location.origin
    +location.pathname
    +path;
  history.replaceState(history.state,'',path);
  aa.view.tits(`${aa.aka} ${location.pathname} `,history.state.view);
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
  if (search.length) 
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
    if (state && aa.el.has('state')) aa.el.get('state').textContent = state
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