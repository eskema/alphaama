/*

alphaama
aa . bus
event bus for inter-module communication

*/


aa.bus =
{
  _ls: {},
  _pv: {},
};


// register a listener
aa.bus.on =(name, fn)=>
{
  if (!aa.bus._ls[name]) aa.bus._ls[name] = [];
  aa.bus._ls[name].push(fn);
};


// remove a listener
aa.bus.off =(name, fn)=>
{
  if (!aa.bus._ls[name]) return;
  aa.bus._ls[name] = aa.bus._ls[name].filter(f => f !== fn);
};


// emit an event (fire and forget)
aa.bus.emit =(name, ...args)=>
{
  if (!aa.bus._ls[name]) return;
  for (const fn of aa.bus._ls[name])
  {
    try { fn(...args) }
    catch (er) { console.error('bus', name, er) }
  }
};


// register a data provider (returns a value)
aa.bus.provide =(name, fn)=>
{
  aa.bus._pv[name] = fn;
};


// request data from a provider
aa.bus.request =(name, ...args)=>
{
  if (!aa.bus._pv[name]) return;
  return aa.bus._pv[name](...args);
};
