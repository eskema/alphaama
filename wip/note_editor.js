aa.note_editor =o=>
{
  const e_e = aa.mk.l('ul',{id:'e_e'}); 
  for (const k in o)
  {
    const li = aa.mk.l('li',{cla:'ee_'+k});
    li.dataset.label = k;
    if (k==='kind'||k==='created_at')
    {
      li.append(aa.mk.input('number',k,o[k],''));
      if (k==='created_at') li.append('now');
    }
    else if (k==='content')
    {
      const content = aa.mk.l('textarea',{id:'content'});
      content.name = 'content';
      content.placeholder = 'whatever the fuck u want';
      content.contentEditable = true;
      content.value = o.content;
      li.append(content); 
    }
    else if (k==='tags')
    {
      const tags = aa.mk.l('ol',{cla:'ee_tags'});
      tags.start = 0;
      li.append(tags);
      if (o.tags.length)
      {
        for (let i=0;i<o.tags.length;i++)
        {
          const tag_li = aa.mk.l('li',{cla:'ee_tag'});
          tag_li.append(aa.mk.input('text','ee_tag_'+i,''));
          tags.append(tag_li);
        }     
      }
      li.append(aa.mk.add_input())
    }
    e_e.append(li);
  }
  return e_e
};

aa.mk.input =(type,name,value,placeholder)=>
{
  const input = aa.mk.l('input',{cla:'ee_input'});
  input.type = type;
  input.name = name;
  input.value = value;
  input.placeholder = placeholder;
  return input
};

aa.mk.add_input =()=>
{
  const button = aa.mk.l('button',{cla:'ee_add_tag',con:'add',clk:e=>
  {
    const l = e.target.previousSibling;
    const input = aa.mk.input('ee_tag_'+l.length,'','');
    l.append(input);
  }})
  return button
};

aa.clk.editor =e=>
{
  const note = e.target.closest('.note');
  const xid = note.dataset.id;
  const event = aa.db.e[xid].event;
  aa.dialog(
  {
    title:'event editor',
    l:aa.note_editor(event),
    no:{exe:()=>{}},
    yes:{exe:()=>{}},
  });
};