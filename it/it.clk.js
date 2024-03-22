// click stuff
// requires v_u

it.clk ={};


// general nostr links
// requires v_u

it.clk.a =e=>
{
  e.preventDefault();
  let dis = e.target.getAttribute('href');
  if (dis==='/') dis = '';
  v_u.state(dis);
};


// adds a clicked class to show interaction

it.clk.clkd =l=>
{
  l.classList.remove('clkd');
  setTimeout(()=>{l.classList.add('clkd')},100);
};


// toggle class on either a provided element
// or event target

it.clk.expanded =e=>
{
  e.stopPropagation();
  let l = document.getElementById(e.target.dataset.controls) || e.target;
  if (!l) return;
  l.classList.toggle('expanded');
  it.scroll(l,{behavior:'smooth'});
};