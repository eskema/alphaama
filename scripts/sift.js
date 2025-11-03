const sift = 
{
  name: 'sift.js',
  about: 'simple item filtering thing',
  in_path: new Set(),
};

sift.set_add =(string='',value='')=>
{
  let values = new Set(aa.fx.splitr(string));
  if (values.has(value)) return string;
  values.add(value);
  return [...values].join(' ');
};

sift.set_del =(string='',value='')=>
{
  let values = new Set(aa.fx.splitr(string));
  values.delete(value);
  return [...values].join(' ');
};


sift.less =(element,value='',options={})=>
{
  let setname = options.setname || 'sift';
  let classname = options.classname || 'sifted_out';
  let set = element.dataset[setname];
  let values = sift.set_del(set,value);
  if (values)
    element.dataset[setname] = values;
  else
  {
    delete element.dataset[setname];
    element.classList.remove(classname);
  }
};


sift.more =(element,value='',options={})=>
{
  let setname = options.setname || 'sift';
  let classname = options.classname || 'sifted_out';
  let set = element.dataset[setname];
  element.dataset[setname] = sift.set_add(set,value);
  element.classList.add(classname);
};

sift.content =(element,value='',options={})=>
{
  let class_name = options.class_name || 'sifted';
  let class_in = options.class_in || `sifted_in`;
  let class_out = options.class_out || `sifted_out`;
  
  if (!value)
  {
    element.classList.remove(class_name);
    for (const item of element.children)
      item.classList.remove(class_in,class_out);
    return
  }

  element.classList.add(class_name);

  for (const child of element.children)
  {
    let included = child.textContent.toLowerCase().includes(value);
    child.classList.add(included ? class_in : class_out);
    child.classList.remove(included ? class_out : class_in);
  }
};


// adds classes to elements up the parent tree starting from element
// if a string is given, it will be added to a dataset
sift.path_add =(starting_element,cla='',value='')=>
{
  let element = starting_element;
  for (; element && element!==document; element=element.parentNode) 
  {
    if (cla && !element.classList.contains(cla)) continue;

    // if (!sift.in_path.includes(element)) // .find(i=>i === element)
    //   sift.in_path.push(element);
    sift.in_path.add(element);
    
    element.classList.add('in_path');
    
    let new_value;
    if (value) new_value = sift.set_add(element.dataset.path,value);
    if (new_value > element.dataset.path)
      element.dataset.path = new_value;
  }
};

sift.in_path_remove =value=>
{
  if (!sift.in_path.size) return;

  for (const element of sift.in_path)
  {
    if (value && element.dataset.path)
    {
      let set = sift.set_del(element.dataset.path,value);
      if (set) element.dataset.path = set;
      else 
      {
        sift.path_remove(element);
        sift.in_path.delete(element)
      }
    }
    else
    {
      sift.path_remove(element);
      sift.in_path.delete(element)
    }
  }

  // sift.in_path = sift.in_path.reduce((keep,element)=>
  // {
  //   if (value && element.dataset.path)
  //   {
  //     let set = sift.set_del(element.dataset.path,value);
  //     if (set)
  //     {
  //       element.dataset.path = set;
  //       keep.push(element);
  //     }
  //     else sift.path_remove(element)
  //   }
  //   else sift.path_remove(element);
  //   return keep
  // },[]);
};


sift.path_remove =element=>
{
  fastdom.mutate(()=>
  {
    element.classList.remove('in_path');
    element.removeAttribute('data-path');
  })
};


// remove class 'solo' from elements
sift.solo_remove =(elements,value,scope)=>
{
  let set = sift.set_del(scope.dataset.solo,value);

  if (set) scope.dataset.solo = set;
  else
  {
    delete scope.dataset.solo;
    scope.classList.remove('haz_solo');
  }

  for (const element of elements)
  {
    element.classList.remove('solo');
  }
  
  sift.in_path_remove(value);
};


// apply class 'solo' to elements
sift.solo_add =(elements,value,scope,cla)=>
{
  scope.classList.add('haz_solo');
  if (!scope.dataset.solo)
    scope.dataset.solo = value;
  else 
    scope.dataset.solo = sift.set_add(scope.dataset.solo,value);

  for (const element of elements)
  {
    element.classList.add('solo');
    sift.path_add(element,cla,value);
  };
};