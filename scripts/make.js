// make element with options
const make =(tag_name,options={})=>
{
  const element = tag_name
    ? document.createElement(tag_name)
    : new DocumentFragment();

  for (const key in options)
  {
    const value = options[key];
    if (!value && value !== 0) continue;
    switch (key)
    {
      case 'app':
        if (Array.isArray(value)) 
          element.append(...value);
        else element.append(value); 
        break;
      case 'att': 
        if (Array.isArray(value))
          for (const i of value)
            element.toggleAttribute(i);
        else element.toggleAttribute(value);
        break;
      case 'cla':
      case 'classes': element.className = value; break;
      case 'clk': element.addEventListener('click',value); break;
      case 'con':
      case 'content': element.textContent = value; break;
      case 'dat': 
        for (const i in value)
          if (value[i]||value[i]===0) 
            element.dataset[i] = value[i]; 
        break;
      case 'listeners':
        for (const i in value)
          element.addEventListener(i,value[i]);
        break;
      case 'nam': 
        console.trace(value); element.name = value; break;
      case 'pla': element.placeholder = value; break;
      case 'ref': element.href = value; break;
      case 'siz': element.sizes = value; break;
      case 'sty': element.style = value; break;
      case 'tab': element.tabIndex = value; break;
      case 'tit': element.title = value; break;
      case 'typ': element.type = value; break;
      case 'val': element.value = value; break;
      default: element.setAttribute(key,value);
    }
  }
  return element
};