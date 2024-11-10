/*

alphaama
state stuff

*/


// clear view
aa.state.clear =()=>
{
  if (aa.viewing)
  {
    const in_view = aa.l.querySelector('.in_view');
    if (in_view) in_view.classList.remove('in_view');
    if (in_view.classList.contains('note'))
    {
      const in_path = aa.l.querySelectorAll('.in_path');
      if (in_path) for (const l of in_path) l.classList.remove('in_path');
    }
    // else
    // {
    //   let index = document.getElementById('i_item_'+in_view.dataset.xpub);
    //   if (index?.classList.contains('solo')) index.querySelector('.key').click();
    // }
  }
  if (aa.state.l) aa.state.l.textContent = '';
  aa.l.classList.remove('viewing','view_e','view_p');
  aa.viewing = false;
  for (const c of aa.clear) c();
};


// on load
aa.state.load =e=>
{
  const header = aa.mk.l('header',{id:'header'});
  const caralho =  aa.mk.l('a',
  {
    id:'caralho',
    ref:'/',
    con:'A<3',
    tit:'vai pró caralho',
    clk:aa.clk.a
  });
  const state = aa.mk.l('h1',{id:'state',con:'dickbutt'});
  header.append(caralho,state);
  document.body.prepend(header);
  state.dataset.pathname = location.pathname;
  aa.state.l = state;
  setTimeout(aa.state.pop,100);
};


// pop state into view
aa.state.pop =()=>
{
  let hash = location.hash;
  let search = location.search;
  if (hash.length) [hash,search] = location.hash.split('?');
  if (!search) search = '';
  let no_state = !history.state || !history.state.hasOwnProperty('view')
  || history.state === '';
  if (no_state) aa.state.view(hash,search);
  else 
  {
    aa.state.clear();
    const state = history.state.view;
    if (state.length) 
    {
      document.title = 'A<3 '+state;
      aa.state.resolve(state,search);  
    }
    else document.title = 'alphaama';
    if (aa.state.l) aa.state.l.textContent = state;
  }
};


// replace state
aa.state.replace =s=>
{
  const dis = history.state;
  dis.view = s;
  const hash_is_h = dis.view.length ? dis.view : '';
  const path = location.origin+location.pathname+hash_is_h;
  history.replaceState(dis,'',path);
};


// resolve state view
aa.state.resolve =(s,search)=>
{
  if (s.startsWith('#')) s = s.slice(1);
  let has_view = false;
  for (const v in aa.views)
  {
    if (s.startsWith(v)) 
    {
      has_view = true;
      aa.views[v](s);
      break;
    }
  }
  if (!has_view) aa.log('no view for '+s);
};


// view state or go back if same state
aa.state.view =(s,search='')=>
{
  if (s?.length) s.trim();
  if (search?.length) search = s.length?'?'+search:search;
  let view = s+search;
  let state,last;
  if (!history.state || history.state.view !== view)
  {
    last = history.state?.view ?? '';
    state = {view:view,last:last};

  }
  else 
  {
    last = history.state.last;
    state = {view:last,last:view};
    // history.pushState(dis,'',path);
    // aa.state.pop()
  }
  history.pushState(state,'',location.origin+location.pathname+state.view);
  aa.state.pop();
  // history.back();
};

window.addEventListener('popstate',aa.state.pop);
window.addEventListener('load',aa.state.load);