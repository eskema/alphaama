// m module view handler

aa.view.ls.m_ =async path=>
{
  if (path === 'm_requests')
  {
    aa.view.active = path;
    // TODO: open requests view
    return
  }

  // expand m section if collapsed
  let section = aa.el.get('section_m');
  if (section && !section.classList.contains('expanded'))
    aa.clk.expand({target:section});

  if (path === 'm__pending')
  {
    await aa.m.restore();
    aa.m.open_pending();
    return
  }

  let npub = path.slice(2);
  let pubkey = aa.fx.decode(npub);
  if (!pubkey) return aa.log('invalid m view');

  await aa.m.restore();
  aa.m.open(pubkey);
};
