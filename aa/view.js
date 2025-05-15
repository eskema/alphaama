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
          for (const l of aa.view.in_path) aa.fx.path_rm(l);
      }
      delete aa.view.in_view;
    }
  }
  aa.view.active = false;
  if (aa.state.l) aa.state.l.textContent = '';
  aa.l.classList.remove('viewing','view_e','view_p');
  for (const c of aa.clears) c();
};


// view force state
aa.view.force =state=>
{
  if (!Object.hasOwn(state,'last')) state.last = history.state?.view || '';
  history.pushState(state,'',location.origin+location.pathname+state.view);
  aa.view.pop();
};


// view pop state
aa.view.pop =()=>
{
  let hash = location.hash;
  let search = location.search;
  if(hash.length) [hash,search] = location.hash.split('?');
  if(!search) search = '';
  let no_state = !history.state || !history.state.hasOwnProperty('view')
  || history.state === '';
  if(no_state) aa.view.state(hash,search);
  else
  {
    aa.view.clear();
    let title = `A<3 ${location.pathname} `;
    const state = history.state.view;
    if (state.length) 
    {
      title += state;
      aa.view.resolve(state,search);
    }
    // else title += 'alphaama';
    document.title = title;
    fastdom.mutate(()=>{if(aa.state.l) aa.state.l.textContent = state;});
  }
};


// view replace state
aa.view.replace =s=>
{
  history.state.view = s;
  const hash = s.length ? s : '';
  const path = location.origin+location.pathname+hash;
  history.replaceState(history.state,'',path);
};


// view resolve state
aa.view.resolve =(s,search)=>
{
  if (s.startsWith('#')) s = s.slice(1);
  let has_view = false;
  for (const v in aa.view.ls)
  {
    if (s.startsWith(v)) 
    {
      has_view = true;
      setTimeout(()=>{aa.view.ls[v](s)},200);
      break;
    }
  }
  if (!has_view) aa.log('no view for '+s);
};


// view state or go back if same state
aa.view.state =(s,search='')=>
{
  if (s?.length) s.trim();
  if (search?.length) search = s.length?'?'+search:search;
  let view = s+search;
  let last;
  if (!history.state || history.state.view !== view)
  {
    last = history.state?.view || '';
    aa.view.force({view,last});
  }
  else if (history.length) history.back();
};


window.addEventListener('popstate',aa.view.pop);