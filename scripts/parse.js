// parser for string stuff
const parse =(options={})=>
{
  let {
    content,
    regex,
    exe,
    is_trusted,
  } = options;

  let index = 0;
  const fragment = new DocumentFragment();
  let result = {parsed:fragment, type:'inline'};
  const matches = [...content.matchAll(regex)];
  for (const match of matches)
  {
    fragment.append(match.input.slice(index,match.index));
    let { parsed, type } = exe(match,is_trusted);
    if (!parsed)
    {
      console.error('parser:',regex,match);
      return
    }
    let childs = parsed?.childNodes.length;
    if (childs > 2) index = match.index + match.input.length;
    else index = match.index + match[0].length;
    fragment.append(parsed);
    if (type === 'block') result.type = type;
  }
  if (index < content.length) fragment.append(content.slice(index));
  return result
};


// splits a string into paragraphs, then into lines and then into words 
// and process each part separately
const parse_all =(options)=>
{
  let {
    content,
    items,
    is_trusted,
  } = options;

  let cla = 'paragraph';
  const element = make();
  let child = make('p',{cla});

  let tested = [];
  for (const item of items)
    if (item.regex.test(content))
        tested.push(item);

  const is_empty =l=>
  {
    if (!l.childNodes.length) return true;
    if (l.firstChild.nodeType === 3)
    {
      const text = (l.textContent+'').trim();
      if (!text || text === ' ') return true
    }
    return false
  };

  const another_child =l=>
  {
    l.normalize();
    if (is_empty(l)) l.remove();
    else 
    {
      element.append(l);
      child = make('p',{cla});
    }
  };

  let paragraphs = content.split(/\n\s*\n/);
  if (paragraphs.length === 1) 
    paragraphs = content.split(/\n/);
  for (const paragraph of paragraphs)
  { 
    if (!paragraph.length) continue;
    
    const lines = paragraph.trim().split(/\n/);
    for (let i = 0; i < lines.length; i++)
    {
      let line = lines[i]
      if (child.childNodes.length)
        child.append(make('br'));
      
      let in_line = [];
      for (const item of tested)
      {
        item.regex.lastIndex = 0;
        if (item.regex.test(line))
        {
          in_line.push(item);
        }
      }
      if (!in_line.length)
      {
        child.append(line);
        continue;
      }

      const words = line.trim().split(' ');
      for (let ii = 0; ii < words.length; ii++)
      {
        let word = words[ii].trim();
        if (!word.length) continue;
        
        let found;
        for (const item of in_line)
        {
          item.regex.lastIndex = 0;
          if (item.regex.test(word))
          {
            found = item;
            break;
          }
        }

        if (found)
        {
          found.content = word;
          found.is_trusted = is_trusted;
          found.regex.lastIndex = 0;
          let { parsed, type } = parse(found);
          if (type === 'block')
          {
            another_child(child);
            element.append(parsed);
          } else child.append(parsed,' ');
        }
        else
        {
          if (ii === words.length-1) child.append(word);
          else child.append(word,' ');
        }
      }
    }
    another_child(child);
  }
  return element
};