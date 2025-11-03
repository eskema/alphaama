// debounce timeouts
const debt =
{
  map: new Map(),
  add(exe,delay,id)
  {
    this.clear(id);
    this.map.set(id, setTimeout(()=>
    { 
      this.map.delete(id);
      exe(id) 
    }, delay))
  },
  clear(id)
  {
    if (this.map.has(id))
      clearTimeout(this.map.get(id));
  }
};