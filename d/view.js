// dr module view handler
// routes: d_invites, d_pending, d_<peer_hex_prefix>

aa.view.ls.d_ =async path=>
{
  aa.view.active = path;

  // expand dr section if collapsed
  let section = aa.el.get('section_d');
  if (section && !section.classList.contains('expanded'))
    aa.clk.expand({target:section});

  let key = path.slice(2);  // strip 'd_'

  if (key === 'invites' || key === 'pending')
  {
    aa.d.view_open(key);
    return;
  }

  // key is a peer pubkey (or prefix) — find the full key
  // if not found yet, wait for restore to finish before giving up
  let match = [...aa.d.live.sessions.keys()].find(k => k.startsWith(key));
  if (!match && !aa.d._restored)
  {
    // restore hasn't completed — stash the view and let restore re-trigger it
    return;
  }
  if (!match)
  {
    aa.log('[d] no session matching ' + key);
    return;
  }
  aa.d.view_open(match);
};
