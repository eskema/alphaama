/*

alphaama
fx: DOM utilities, sorting, storage

*/


// update counter
aa.fx.count_upd =(element,pos=true)=>
{
  if (!element) return;
  fastdom.mutate(()=>
  {
    if (!element.dataset.count) element.dataset.count = 0;
    if (pos) element.dataset.count++;
    else element.dataset.count--
  })
};


// countdown to something in intervals
aa.fx.countdown =async(con,total,n)=>
{
  return new Promise(resolve=>
  {
    let interval;
    const done =dis=>{clearInterval(interval);resolve(dis)};
    let times = 0;
    let counter = make('span',{con:total,cla:'counter'});
    let l = make('p',{con,cla:'countdown'});
    l.append(' ',counter,'…',' ',make('button',
    {
      cla:'butt no',
      con:'abort',
      clk:e=>
      {
        done(false);
        fastdom.mutate(()=>
        {
          e.target.remove();
          l.append('aborted!')
        });
      }
    }));
    aa.log(l);

    const count_down =()=>
    {
      times++;
      fastdom.mutate(()=>{counter.textContent = total - times});
      if (times === total) done(true);
    };
    interval = setInterval(count_down,n);
  })
};


// for selector in element do
aa.fx.do_all =(selector,callback,element)=>
{
  if (!element) element = document;
  let items = element?.querySelectorAll(selector);
  if (items?.length) for (const item of items) callback(item)
};


// scroll with delay
aa.fx.scroll =async(l,options={})=>
{
  if (l) l.scrollIntoView(options)
};


aa.fx.scrolled =element=>
{
  return element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
};


// sorts element children
aa.fx.sort_l =(l,by)=>
{
  let a = [...l.children].sort(aa.fx.sorts[by]);
  for (const node of a) l.append(node)
};


// sorting functions to use in .sort()
aa.fx.sorts =
{
  a(a,b){ return a.localeCompare(b)},
  d(a,b){ return b.localeCompare(a)},
  asc(a,b){ return a[1] - b[1] ? 1 : -1 },
  desc(a,b){ return b[1] - a[1] ? 1 : -1 },
  i_asc(a,b)
  {
    let a_val = parseInt(a.querySelector('.val').textContent);
    let b_val = parseInt(b.querySelector('.val').textContent);
    return a_val > b_val ? 1 : -1
  },
  i_desc(a,b)
  {
    let a_val = parseInt(a.querySelector('.val').textContent);
    let b_val = parseInt(b.querySelector('.val').textContent);
    return a_val < b_val ? 1 : -1
  },
  rand(){ return ()=> 0.5 - Math.random() },
  sets(a,b)
  {
    return a[1].sets.length < b[1].sets.length ? 1 : -1
  },
  text_asc(a,b)
  {
    let a_val = a.textContent.toLowerCase();
    let b_val = b.textContent.toLowerCase();
    return a_val > b_val ? 1 : -1
  },
  text_desc(a,b)
  {
    let a_val = a.textContent.toLowerCase();
    let b_val = b.textContent.toLowerCase();
    return a_val < b_val ? 1 : -1
  },
  ca_asc(a,b)
  {
    let a_val = a.event.created_at;
    let b_val = b.event.created_at;
    return a_val > b_val ? 1 : -1
  },
  ca_desc(a,b)
  {
    let a_val = a.event.created_at;
    let b_val = b.event.created_at;
    return a_val < b_val ? 1 : -1
  },
  stamp_asc(a,b)
  {
    let a_val = parseInt(a.dataset.stamp);
    let b_val = parseInt(b.dataset.stamp);
    return a_val > b_val ? 1 : -1
  },
  stamp_desc(a,b)
  {
    let a_val = parseInt(a.dataset.stamp);
    let b_val = parseInt(b.dataset.stamp);
    return a_val < b_val ? 1 : -1
  },
  len(a,b){ return b[1].length > a[1].length ? 1 : -1 },
  len_desc(a,b){ return b[1].length > a[1].length ? -1 : 1 },
};


// batched storage manager to prevent jank from synchronous writes
aa.fx.storage = (() => {
  const pending = new Map();
  let scheduled = false;

  const flush = () => {
    for (const [key, value] of pending) {
      if (value === null) {
        delete sessionStorage[key];
      } else {
        sessionStorage[key] = value;
      }
    }
    pending.clear();
    scheduled = false;
  };

  return {
    // Schedule a write (batched until next frame)
    set: (key, value) => {
      pending.set(key, value);
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(flush);
      }
    },

    // Immediate write (use sparingly)
    setImmediate: (key, value) => {
      sessionStorage[key] = value;
    },

    // Get (checks pending writes first, then storage)
    get: (key) => {
      if (pending.has(key)) return pending.get(key);
      return sessionStorage[key];
    },

    // Force flush now (useful before navigation)
    flush: () => {
      if (scheduled) flush();
    }
  };
})();


aa.fx.parse =(content,is_trusted)=>
{
  let items =
  [
    {id:'url', regex:aa.regex.url, exe:aa.parse.url},
    {id:'nostr', regex:aa.regex.nostr, exe:aa.parse.nostr},
    {id:'hashtag', regex:aa.regex.hashtag, exe:aa.parse.hashtag},
  ];

  return parse_all({ content, items, is_trusted })
};
