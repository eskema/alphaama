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

  let input = make('input', {typ: 'file'});
  input.toggleAttribute('multiple');
  input.hidden = true;

  let files = [];
  let info = make('div', {cla: 'b_info'});
  let results = make('div', {cla: 'b_results'});

  // add files to list and render previews
  let add_files =async new_files=>
  {
    for (const file of new_files)
    {
      files.push(file);
      let row = make('div', {cla: 'b_preview'});

      if (file.type.startsWith('image/'))
      {
        let img = make('img');
        img.src = URL.createObjectURL(file);
        img.height = 80;
        row.append(img,' ');
      }

      let name = make('p',
      {
        cla: 'file_name',
        con: `${file.name.slice(0,16)}`
      });
      let hash = await aa.fx.blob_sha256(file);
      name.append(
        make('br'),
        aa.fx.format_bytes(file.size),
        make('br'),
        make('span', {con: hash, cla: 'hash'})
      );

      let del_butt = make('button',
      {
        cla: 'butt exe del',
        con: 'remove',
        clk: ()=>
        {
          let i = files.indexOf(file);
          if (i > -1) files.splice(i, 1);
          row.remove();
        },
      });

      row.append(name, ' ', del_butt);
      info.append(row);
    }
  };

  let clear_butt = make('button',
  {
    cla: 'butt exe del',
    con: 'clear',
    clk: ()=>
    {
      files.length = 0;
      info.textContent = '';
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
      upload_butt.disabled = true;
      upload_butt.textContent = 'uploading...';
      results.textContent = '';

      for (const file of files)
      {
        let descriptor = await aa.b.upload(server, file);
        if (descriptor)
        {
          results.append(make('a',
          {
            ref: descriptor.url,
            con: descriptor.url,
            target: '_blank'
          }))
        }
        else
        {
          results.append(make('span',{con:`upload failed for: ${file.name}`}))
        }
      }
      let urls = [...results.querySelectorAll('a')].map(a=> a.href);
      if (urls.length)
      {
        let text = urls.join(' ');
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
        // let copy_butt = make('button',
        // {
        //   cla: 'butt exe',
        //   con: 'copy all',
        //   clk: ()=>
        //   {
        //     navigator.clipboard.writeText(text);
        //     copy_butt.textContent = 'copied';
        //     dialog.close()
        //   },
        // });
        results.append(paste_butt);
      }
      upload_butt.textContent = 'done';
    },
  });

  let butts = make('span',{cla:'butts',app:[clear_butt, ' ',upload_butt]})

  input.addEventListener('change', e=> add_files(e.target.files));

  let drop = aa.mk.drop(add_files, 'drop files here\nor click to select');
  drop.addEventListener('click', ()=> input.click());

  wrap.append(title, 'to: ',server_select, input, drop, ' ', butts, info, results);
  dialog.textContent = '';
  dialog.append(wrap);
  dialog.showModal();
};


// render blob descriptor list in logs
aa.mk.b_list =descriptors=>
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
    let preview = aa.mk.img(d.url, true);
    let butts = make('span', {cla:'butts',app:
    [
       ' ', del_butt
    ]});
    item.append(preview, link, meta, ' ', time,butts);
    list.append(item);
  }

  if (!element)
  {
    let summary = make('summary', {con: `blobs (${descriptors.length})`});
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
