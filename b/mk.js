// make blossom server list (kind 10063)
aa.mk.k10063 =(string='')=>
{
  let servers = string
    ? aa.fx.splitr(string)
    : Object.keys(aa.b.o.ls);

  if (!servers.length)
  {
    aa.log('mk 10063: no servers, use `b add` first');
    return
  }

  let tags = [];
  for (let s of servers)
  {
    // let url = aa.fx.url(s.trim())?.href;
    if (!aa.fx.url(s))
    {
      aa.log(`mk 10063: invalid url: ${s}`);
      continue
    }
    tags.push(['server', s]);
  }

  if (tags.length)
  {
    const event = aa.fx.normalise_event({kind: 10063, tags});
    aa.mk.confirm(
    {
      title: 'new blossom server list',
      l: aa.mk.tag_list(tags),
      no: {exe: ()=> {}},
      yes: {exe: ()=> { aa.bus.emit('e:finalize', event) }},
    });
  }
};


// upload dialog
aa.mk.b_upload =()=>
{
  let dialog = aa.el.get('dialog');
  if (!dialog) return;

  let wrap = make('div', {cla: 'b_upload'});
  let title = make('h3', {con: 'blossom upload'});
  let close_butt = make('button',
  {
    cla: 'butt exe',
    con: 'close',
    clk: ()=> dialog.close(),
  });
  let header = make('header',{app:[title,' ',close_butt]});
  

  // server selector
  let servers = Object.keys(aa.b.o.ls);
  let server_select = make('select', {cla: 'b_server'});
  let def = aa.b.get_def();
  for (const url of servers)
  {
    let opt = make('option', {val: url, con: url});
    if (url === def) opt.selected = true;
    server_select.append(opt);
  }
  if (!servers.length)
  {
    let opt = make('option', {con: 'no servers — use .b add first'});
    opt.disabled = true;
    server_select.append(opt);
  }

  let input = make('input', {typ: 'file',att:['multiple','hidden']});
  // input.hidden = true;

  let files = [];
  let rows = new Map();
  let b_info = make('div', {cla: 'b_info'});
  let results = make('div', {cla: 'b_results'});

  // add files to list and render previews
  let add_files =async new_files=>
  {
    for (const file of new_files)
    {
      files.push(file);
      
      let row = make('div', {cla: 'b_preview'});
      let hash = await aa.fx.blob_sha256(file);
      
      if (file.type.startsWith('image/'))
      {
        let img = make('img');
        img.src = URL.createObjectURL(file);
        img.height = 80;
        let thumb = make('span',
        {
          cla:'thumb', app:img
        });
        row.append(thumb,' ');
      }

      let info = make('p',
      {
        cla: 'file_info',
        app: [
          make('span',{cla:'name',con:`${file.name.slice(0,16)}`}),
          make('span',{cla:'size',con:aa.fx.format_bytes(file.size)}),
          make('span', {cla: 'hash',con: hash})
        ]
      });

      let del_butt = make('button',
      {
        cla: 'butt exe del',
        con: 'remove',
        clk: ()=>
        {
          let i = files.indexOf(file);
          if (i > -1) files.splice(i, 1);
          rows.delete(file);
          row.remove();
          if (!files.length) butts.classList.add('hidden');
        },
      });

      row.append(info, ' ', del_butt);
      rows.set(file, {row, del_butt});
      b_info.append(row);
    }
    butts.classList.remove('hidden');
  };

  let clear_butt = make('button',
  {
    cla: 'butt exe del',
    con: 'clear',
    clk: ()=>
    {
      files.length = 0;
      rows.clear();
      b_info.textContent = '';
      butts.classList.add('hidden');
    },
  });

  let upload_butt = make('button',
  {
    cla: 'butt exe',
    con: 'upload',
    clk: async()=>
    {
      if (!files.length)
      {
        aa.log('b upload: no files selected');
        return
      }
      let server = server_select.value;
      if (!server)
      {
        aa.log('b upload: no server');
        return
      }
      butts.textContent = 'uploading...';

      let urls = [];
      for (const file of files)
      {
        let entry = rows.get(file);
        let descriptor = await aa.b.upload(server, file);
        if (descriptor)
        {
          let link = make('p',
          { 
            app: make('a',
            {
              ref: descriptor.url,
              con: descriptor.url,
              target: '_blank'
            })
          })
          // let link = make('a',
          // {
          //   ref: descriptor.url,
          //   con: descriptor.url,
          //   target: '_blank'
          // });
          if (entry) entry.del_butt.replaceWith(link);
          urls.push(descriptor.url);
        }
        else
        {
          let fail = make('span', {con: 'failed'});
          if (entry) entry.del_butt.replaceWith(fail);
        }
      }
      if (urls.length)
      {
        let text = urls.join(' ');
        let copy_butt = make('button',
        {
          cla: 'butt exe',
          con: 'copy',
          clk: ()=>
          {
            navigator.clipboard.writeText(text);
            copy_butt.textContent = 'copied';
          },
        });
        let paste_butt = make('button',
        {
          cla: 'butt exe',
          con: 'paste',
          clk: ()=>
          {
            let v = aa.bus.request('cli:value') || '';
            aa.bus.emit('cli:set', v ? v + ' ' + text : text);
            dialog.close();
          },
        });
        
        results.textContent = '';
        results.append(copy_butt, ' ', paste_butt);
      }
      server_select.remove();
      drop.remove();
      butts.remove();
    },
  });

  let butts = make('span', {cla: 'butts hidden', app: [clear_butt,' ', upload_butt]});

  input.addEventListener('change',e=> { add_files(e.target.files); input.value = '' });

  let drop = aa.mk.drop(add_files, 'drop files here\nor click to add');
  drop.addEventListener('click', ()=> input.click());

  wrap.append(
    header, 
    server_select, 
    input, 
    drop, 
    butts, 
    b_info, 
    results
  );
  
  dialog.textContent = '';
  dialog.append(wrap);
  dialog.showModal();
};


// render blob descriptor list in logs
aa.mk.b_list =(descriptors,server)=>
{
  let key = 'b_list';
  let element = aa.el.get(key);

  // build item list
  let list = make('ul', {cla: 'list'});
  for (const d of descriptors)
  {
    let item = make('li', {cla: 'item'});
    let link = make('a', {ref: d.url, con: d.sha256.slice(0,16) + '...', target: '_blank'});
    let meta = make('span', {con: ` ${aa.fx.format_bytes(d.size)} ${d.type || ''}`});
    let time = make('span', {con: ` ${aa.fx.time_display(d.uploaded)}`});
    let del_butt = make('button',
    {
      cla: 'butt exe del',
      con: 'del',
      clk: async()=>
      {
        let ok = await aa.b.del(d.sha256);
        if (ok) item.remove();
      },
    });
    let preview = make('span',
    {
      cla:'img_thumb',
      app:aa.mk.img(d.url, true)
    });
    let butts = make('span', {cla:'butts',app:
    [
       ' ', del_butt
    ]});
    item.append(preview, ' ', link, meta, ' ', time,butts);
    list.append(item);
  }

  if (!element)
  {
    let summary = make('summary', {con: `blobs (${descriptors.length}) in ${server}`});
    element = make('details',
    {
      cla: 'b_list',
      app: [summary, list]
    });
    aa.el.set(key, element);
    aa.log(element);
  }
  else
  {
    fastdom.mutate(()=>
    {
      let summary = element.querySelector('summary');
      summary.textContent = `blobs (${descriptors.length})`;
      // replace old list, keep summary
      let old = element.querySelector('ul');
      if (old) old.replaceWith(list);
      else element.append(list);
      // move to bottom
      let log = element.parentElement;
      if (log)
      {
        let logs = log.parentElement;
        logs.lastChild.after(log);
        log.classList.add('is_new');
        logs.classList.add('has_new');
        logs.parentElement.classList.add('has_new');
      }
    });
  }
};


aa.actions.push(
  {
    action: ['mk', '10063'],
    description: 'create blossom server list (kind-10063)',
    exe: aa.mk.k10063,
  },
);
