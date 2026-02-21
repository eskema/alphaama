const sift =
{
  name: 'sift.js',
  about: 'simple item filtering thing',
  in_path: new Set(),
};


sift.insert =(item,options)=>
{
  let
  {
    items,
    element,
    max,
    order,
    page,
    sort_by
  } = options;

  if (!element || !sort_by) return;

  // remove from old position if re-inserting (e.g. stamp changed)
  let old_index = items.indexOf(item);
  if (old_index !== -1)
    items.splice(old_index, 1);

  let finder = order === 'desc'
    ? i=> sort_by(i) < sort_by(item)
    : i=> sort_by(i) > sort_by(item);

  let last = items.find(finder) || null;
  let index = last
    ? items.indexOf(last)
    : items.length;

  items.splice(index, 0, item);

  if (options.value)
  {
    let match = item.textContent.toLowerCase()
      .includes(options.value.toLowerCase());
    if (!match)
    {
      item.classList.add('sifted_out');
      return
    }
    item.classList.add('sifted_in');
  }

  if (options.solo?.match?.(item))
  {
    item.classList.add('solo');
    sift.path_add(item,options.solo.cla,options.solo.value,['solo']);
  }

  if (!max)
  {
    sift.move(item,last,element);
    return
  }

  sift.update_total(options);

  if (!page) page = 1;
  let upper = max * page;
  let lower = upper - max;

  if (index >= lower && index < upper)
  {
    sift.move(item,last,element)
  }

  if (element.childElementCount > max)
  {
    for (const i of [...element.children].slice(max))
    {
      if (!i.classList.contains('in_path')
      && !i.classList.contains('sifted_in')
      ) i.remove()
    }
  }
};


sift.move =(element,before=null,parent=false)=>
{
  if (!parent) parent = element.parentElement;
  if (!parent) return;
  if (before && before.parentElement !== parent)
    before = null;
  if (!element.parentElement
  || element.parentElement !== parent
  || !('moveBefore' in Element.prototype)
  )
    parent.insertBefore(element,before);
  else
    parent.moveBefore(element,before);
};


sift.items =options=>
{
  let
  {
    items,
    element,
    filter_by,
    sort_by,
    page,
    max,
    order,
  } = options;

  if (!element) return [];

  let skip = new Set(['HEADER','FOOTER']);
  let result = (items && items.length)
    ? [...items]
    : [...element.children].filter(i=> !skip.has(i.tagName));

  if (!options.counts) options.counts = {};
  options.counts.total = result.length;

  if (filter_by)
  {
    result = result.filter(filter_by);
    options.counts.filtered = result.length;
  }

  if (order && sort_by)
  {
    let sort = order === 'desc'
      ? (a,b)=> sort_by(a) < sort_by(b) ? 1 : -1
      : (a,b)=> sort_by(a) > sort_by(b) ? 1 : -1;
    result = result.sort(sort);
  }

  if (max)
  {
    max = parseInt(max);
    page = parseInt(page) || 1;

    let pages = result.reduce((res,_,i,array)=>
    {
      if (i % max === 0) res.push(array.slice(i,i + max));
      return res;
    },[]);

    let page_index = page > 0 ? page - 1 : 0;
    result = pages[page_index] || [];
    options.counts.pages = pages.length;
  }

  return result
};


sift.update_total =options=>
{
  if (!options.total_pages_el || !options.max) return;
  debt.add(()=>
  {
    let total = Math.ceil(options.items.length / options.max);
    if (options.total_pages_el.textContent != total)
      options.total_pages_el.textContent = total;
  }, 500, 'sift_total');
};


sift.paginate =(options,items)=>
{
  let { element } = options;
  if (!element) return;
  if (!items) items = sift.items(options);
  element.textContent = '';
  if (items) for (const item of items) element.append(item);
  if (options.total_pages_el && options.counts?.pages)
    options.total_pages_el.textContent = options.counts.pages;
};


sift.content =options=>
{
  let element = options.element;
  let value = options.value || '';
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


sift.map =options=>
{
  let element = options.element;
  let value = options.value;
  let class_name = options.class_name || 'sifted';
  let class_in = options.class_in || 'sifted_in';
  let class_out = options.class_out || 'sifted_out';

  let items = sift.items(options);
  let has_managed_items = options.items?.length > 0;

  if (!value)
  {
    element.classList.remove(class_name);
    for (const item of items)
      item.classList.remove(class_in,class_out);
    if (has_managed_items) sift.paginate(options,items);
    return
  }

  element.classList.add(class_name);
  let lower_value = value.toLowerCase();

  for (const item of items)
  {
    let included = item.textContent.toLowerCase().includes(lower_value);
    item.classList.add(included ? class_in : class_out);
    item.classList.remove(included ? class_out : class_in);

    if (has_managed_items)
    {
      if (included && item.parentElement !== element)
      {
        sift.insert(item,options)
      }
      else if (!included && item.parentElement === element)
      {
        item.remove()
      }
    }
  }
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
  let values = sift.set_del(element.dataset[setname],value);
  if (values)
  {
    element.dataset[setname] = values;
  }
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


// adds class to elements up the parent tree from starting_element
// if a value is given, it will be added to a dataset
// classes: additional classes to add alongside in_path (e.g. ['solo'])
sift.path_add =(starting_element,cla='',value='',classes=[])=>
{
  let element = starting_element;
  for (; element && element!==document; element=element.parentNode)
  {
    if (cla && !element.classList.contains(cla)) continue;

    sift.in_path.add(element);

    element.classList.add('in_path',...classes);

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
};


sift.path_remove =element=>
{
  element.classList.remove('in_path');
  element.removeAttribute('data-path');
};


sift.solo_clear =options=>
{
  delete options?.solo;
  let element = options?.element;
  if (!element) return;
  let solo = element.dataset.solo;
  if (!solo)
  {
    for (const item of sift.in_path)
    {
      sift.in_path.delete(item);
      sift.path_remove(item);
    }
  }
  else sift.solo_remove(sift.in_path,solo,element);
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
    sift.path_add(element,cla,value,['solo']);
  };
};
