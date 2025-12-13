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
    // if (match.index > index)
    // {
    //   result.before = match.input.slice(0,match.index);
    // }
    
    // fragment.append(match.input.slice(index,match.index));
    let { parsed, type, before, after } = exe(match,is_trusted);
    if (!parsed)
    {
      console.error('parser:',regex,match);
      return
    }
    if (before) result.before = before;
    if (after) result.after = after;
    fragment.append(parsed);
    let childs = parsed?.childElementCount;
    if (childs > 2) index = match.index + match.input.length;
    else index = match.index + match[0].length;
    if (type === 'block') result.type = type;
  }
  return result
};


const is_empty =element=>
{
  element.normalize();
  if (!element.childNodes.length) return true;
  if (element.firstChild?.nodeType === 3)
  {
    const text = (element.textContent+'').trim();
    if (!text || text === ' ') return true
  }
  return false
};


const parse_another =(options={})=>
{
  let { parent, element, cla} = options;
  if (!cla) cla = 'paragraph';
  
  const new_paragraph =()=> make('p',{cla});
  
  if (!element) return new_paragraph();
  
  
  if (is_empty(element)) element.remove();
  else parent.append(element);
  
  return new_paragraph()
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

  let tested = [];
  for (const item of items)
    if (item.regex.test(content))
        tested.push(item);

  //let cla = 'paragraph';
  const parent = make();
  let element = parse_another(); // make('p',{cla});

  let paragraphs = content.split(/\n\s*\n/);
  if (paragraphs.length === 1) 
    paragraphs = content.split(/\n/);
  for (const paragraph of paragraphs)
  { 
    if (!paragraph.length) continue;
    
    const lines = paragraph.trim().split(/\n/);
    // parse_lines({lines,parent,element});

    for (let i = 0; i < lines.length; i++)
    {
      if (element.childNodes.length)
        element.append(make('br'));

      let line = lines[i];
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
        element.append(line);
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
          let { parsed, type, before, after } = parse(found);
          if (before) element.append(before,' ');
          if (type === 'block')
          {
            
            element = parse_another({parent,element});
            parent.append(parsed);
          }
          else element.append(parsed,' ');
          if (after) element.append(' ',after,' ');
        }
        else
        {
          if (ii === words.length-1) element.append(word);
          else element.append(word,' ');
        }
      }
    }
    element = parse_another({parent,element});
  }
  return parent
};