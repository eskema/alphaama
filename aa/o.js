// basic key/value options using localStorage

aa.o =
{
  def:
  {
    id:'o',
    ls:
    {
      'ns':'.aa', // used as the prefix for actions
      'reaction':'\uD83E\uDD18', // '🤘' default reaction emoji
      'team':'dark', // 'light'
      'trust':'11', // user score needed for loading media
    },
// todo
//     'nav_keys':
//     {
//       'parent':'j',
//       'next':'k',
//       'child':'l',
//       'previous':'i',
//       'top':'h',
//       'bottom':'b',
//       'fetch':'f',
//       'replies':'\\',
//       'exit':'Escape'
//     }
  },
  sn:'o',
};


// on load

aa.o.load =()=>
{
  const id = aa.o.def.id;
  // ensure default options
  for (const k in aa.o.def.ls)
  {
    if (!localStorage[k]) localStorage[k] = aa.o.def.ls[k];
  }

  
  // aa.mk.mod(aa.o); 

  // aa.o.save();


  aa.actions.push(
    {
      action:[aa.o.def.id,'set'],
      required:['key','value'],
      description:'set option value',
      exe:aa.o.set
    },
    {
      action:[aa.o.def.id,'reset'],
      optional:['key'], 
      description:'reset all or just a single option',
      exe:aa.o.reset
    },
    {
      action:[aa.o.def.id,'rm'],
      optional:['key'], 
      description:'remove option',
      exe:aa.o.rm
    }
  );
  aa.o.o = {id:'o',ls:localStorage};
  aa.db.mod_load(aa.o).then(aa.mk.mod);

  window.addEventListener('storage',e=>
  {
    console.log('storage',e);
    // aa.to(()=>{aa.o.load()},200,'storage');
  });
};


// makes a mod option item, to use with aa.mk.mod()

aa.o.mk =(k,v)=>
{
  // update 

  switch (k)
  {
    case 'team': if (aa.l.dataset.team !== v) aa.l.dataset.team = v; break;
  }
  const id = aa.o.sn;
  const l = aa.mk.l('li',{id:id+'_'+k,cla:'item'});
  l.append(
    aa.mk.butt_action(id+' set '+k+' '+v,k,'key'),
    // aa.mk.l('button',{cla:'key',con:k,clk:e=>
    // {
    //   aa.cli.t.value = localStorage.ns+' '+id+' set '+k+' '+v;
    //   aa.cli.foc();
    // }}),
    aa.mk.l('span',{cla:'val',con:v})
  );
  return l
};


// reset one, multiple or all values

aa.o.reset =s=>
{
  aa.cli.fuck_off();
  s.trim();
  if (s)
  {
    const work =a=>
    {
      const v = a[0];
      if (aa.o.def.ls[v])
      {
        localStorage[v] = aa.o.def.ls[v];
        aa.db.mod_item_upd(aa.o,k,v);
      }
    }
    aa.fx.loop(work,s);
    aa.log(aa.mk.butt_action(aa.o.sn+' reset '+s));
  } 
  else if (window.confirm('reset all options?')) 
  {
    localStorage.clear();
    for (const k in aa.o.def.ls) localStorage[k] = aa.o.def.ls[k];
  }
};


// remove option (if not default)

aa.o.rm =s=>
{
  aa.cli.fuck_off();
  const work =a=>
  {
    const dis = localStorage.ns+' op rm: ';
    const v = a.shift().trim();
    if (v && localStorage[v])
    {
      if (!aa.o.def.hasOwnProperty(v))
      {
        localStorage.removeItem(v);
        document.getElementById(aa.o.sn+'_'+v).remove();
        // aa.o.load();
        aa.log(dis+v);
      }
      else aa.log(dis+'key cannot be removed');
    }
    else aa.log(dis+'key not found');
  };
  aa.fx.loop(work,s)
};


// saves

aa.o.save =()=>
{
  aa.o.o = {id:'o',ls:localStorage};
  aa.mk.mod(aa.o); 
};


// set key as value

aa.o.set =s=>
{
  aa.cli.fuck_off();
  const work =a=>
  {
    let [k,v] = a;
    if (k && v)
    {
      localStorage[k] = v;
      aa.db.mod_item_upd(aa.o,k,v);
      aa.log(aa.mk.butt_action(aa.o.sn+' set '+k+' '+v));
    }
  };
  aa.fx.loop(work,s)
};


