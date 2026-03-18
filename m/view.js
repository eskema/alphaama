// dm module view handler

aa.view.ls.dm_ =async path=>
{
  if (path === 'dm_requests')
  {
    aa.view.active = path;
    // TODO: open requests view
    return
  }

  // expand dm section if collapsed
  let section = aa.el.get('section_dm');
  if (section && !section.classList.contains('expanded'))
    aa.clk.expand({target:section});

  if (path === 'dm__pending')
  {
    await aa.dm.restore();
    aa.dm.open_pending();
    return
  }

  let npub = path.slice(3);
  let pubkey = aa.fx.decode(npub);
  if (!pubkey) return aa.log('invalid dm view');

  await aa.dm.restore();
  aa.dm.open(pubkey);
};
