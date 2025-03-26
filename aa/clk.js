

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
aa.clk.clkd =l=>
{
  l.classList.remove('clkd');
  setTimeout(()=>{l.classList.add('clkd')},100);
};


// expand 
aa.clk.expand =e=>
{
  if (e.hasOwnProperty('stopPropagation')) e.stopPropagation();
  let l = document.getElementById(e.target.dataset.controls) || e.target;
  if (!l) return;
  
  let block;
  let id = l.id || l.closest('.note').dataset.id+'_replies';

  fastdom.mutate(()=>
  {
    if (l.classList.contains('expanded'))
    {
      l.classList.remove('expanded');
      sessionStorage[id] = '';
      block = 'center';
    }
    else
    {
      l.classList.add('expanded');
      sessionStorage[id] = 'expanded';
      block = 'start';
    }
    aa.fx.scroll(l,{behavior:'smooth',block:block});
  });
};


// wip
aa.clk.list_filter_input =e=>
{
  let ls = e.target.nextElementSibling;
  let lf = aa.mk.l('div',{cla:'lf'});
  let inp = aa.mk.l('input');
  lf.append(inp);
  inp.addEventListener('change',e=>
  {
    console.log(inp.value);
    console.log(ls.childElementCount);
  });
  e.target.parentElement.insertBefore(lf,e.target);
  e.target.remove();
  // lf.prepend(e.target);
};