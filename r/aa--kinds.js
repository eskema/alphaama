//const in_view = new window.IntersectionObserver(([entry]) => 
//{
//   if (entry.isIntersecting) 
//   {
//      let l = entry.target;
//      l.classList.add('loaded');
//      console.log('in_view', entry)
//      in_view.unobserve(l);
//      return
//   }
//  console.log('!in_view', entry.id)
//}, 
//{
//   root: null,
//   threshold: 0.1, // set offset 0.1 means trigger if atleast 10% of element in viewport
//});

function db_new_id(id, e = false) 
{
   db[id] = 
   {
      n: x_note(id),
      seen: [],
      reply_ids: [],
      react_ids: [],
      reactions: {}
   };
   if (e) 
   {
      if (e.data) db[id].o = e.data[2];
      if (e.origin && !db[id].seen.includes(e.origin)) db[id].seen.push(e.origin);
   }
}

function p_get(pubkey) 
{
   let contact;
   if (!is_hex(pubkey) && pubkey.startsWith('npub')) 
   {
      try {
         pubkey = dcode(pubkey);
      } catch (err) {
         console.log('invalid key', pubkey)
      }
   }
   
   if (is_hex(pubkey) && pubkey.length === 64) 
   {
      contact = aa.p[pubkey];
      if (!contact && is_hex(pubkey)) 
      {
         contact =    
         {
            pub: pubkey,
            npub: x_npub(pubkey),
            petnames: [],
            relays: [],
            bff: [],
            // data : kind0 content object
            verified: false,
            last_verified: 0,
            followed_by: [],
            trust: false
         }
         aa.p[pubkey] = contact;
         save_aa();
      }
      if (!contact.pub) contact.pub = pubkey;
      try {
         if (!contact.npub) contact.npub = x_npub(pubkey);
      } catch (err) {
            console.log('invalid key', pubkey)
      }
      
   }

   return contact
}

function x_note(hex_id) 
{
   return NostrTools.nip19.noteEncode(hex_id)
}

function x_npub(hex_key) 
{
   return NostrTools.nip19.npubEncode(hex_key)
}

function dcode(nip19str) 
{
   return NostrTools.nip19.decode(nip19str).data
}


//function FruitComponent() {
//  let [fruit, setFruit] = useState('banana')
//
//  function changeFruit () {
//    setFruit(fruit === 'banana' ? 'maçã' : 'banana')
//  }
//
//  return <div onClick={changeFruit}>{fruit}</div>
//}
//
//function FrutaComponente() {
//  
//  let div = document.createElement('div');
//  div.textContent = 'banana';
//  
//  const changeFruit = (e) =>
//  {
//    e.target.textContent = 'banana' ? 'maçã' : 'banana')
//  };
//
//  div.addEventListener('click', changeFruit)
//  return div
//}

function newpub(contact) 
{   
   const 
      l = m_l('li', {id:contact.npub,cla:'fren'}),
      pubkey = m_l('p', {cla:'pubkey', con:contact.npub}),
      metadata = m_l('header', {cla:'metadata'});
   
   l.dataset.x = contact.pub;
   stylek(contact.pub, l);
//   l.classList.add('p','');
   
   let close_btn = m_l('button',{cla:'close',con:'x', ref:'#'});
//   close_btn.addEventListener('click',()=>{view_close()});
   
   // todo: follows
   
   l.append(pubkey, metadata, close_btn); 
   
   document.getElementById('kind-0').append(l);      
//   l.addEventListener('click', clickFren);
   
   return l
}

function trust_calc(pubkey) 
{  
   let trust = pubkey === aa.k ? 1 : 'false';
   // 0 no trust
   // 1 you   
   
   // 2 pubkeys you follow by including them in your kind-3
   // 3 pubkeys that are followed by #2 that are not in the previous sets
   // 4 pubkeys that are followed by #3 that are not in the previous sets
   // ...
   if (trust === 'false') 
   {
      let bffs = aa.p[aa.k].bff;
      if (bffs && bffs.includes(pubkey)) trust = 2;
      else if (bffs && bffs.some((id)=> aa.p[id].bff && aa.p[id].bff.includes(pubkey) )) trust = 3;
   }
   return trust
}

function trust_get(pubkey) 
{  
   let trust, contact = aa.p[pubkey];
   return contact && contact.trust ? contact.trust : trust_calc(pubkey)
}

function trust_reset() 
{  
   Object.keys(aa.p).map(trust_set);
}

const trust_set = (pubkey) =>
{  
   aa.p[pubkey].trust = trust_calc(pubkey);
};

function is_trusty(pubkey) 
{  
   let trust = trust_get(pubkey);
   return (Number.isInteger(trust) && trust > 0) ? true : false;
}

function newid(e) 
{
   let o = e.o;
   const l = document.createElement('li');
   l.classList.add('event', 'new');
   l.id = e.n;
   l.dataset.x = o.id
   
   const h = document.createElement('p');
   h.classList.add('heading');
   const h_id = m_l('a',{cla:'id',con:hex_trun(o.id),tit:'view source'});
//   h_id.classList.add('a','a-e');
   h_id.addEventListener('click', view_source);
   
   if (o.created_at) 
   {
      l.dataset.stamp = o.created_at;
//      let created_at = make_time(o.created_at);
      h.append(make_time(o.created_at));
//      update_time(created_at);
   }
   
   h.append(h_id)
   
   if (o.pubkey) 
   {
      l.dataset.p = o.pubkey;
      l.dataset.trust = trust_get(o.pubkey);
      const h_author = tag_link(['p', o.pubkey]);
      h_author.classList.add('author');
      h.prepend(h_author);
      stylek(o.pubkey, l);
   }
   
   l.append(h);
   l.setAttribute('data-kind', o.kind);

   const content = document.createElement('article');
   content.classList.add('content');
   const p = document.createElement('p');
   p.textContent = merely_mentions(o.content,o.tags);
   content.append(p);
   l.append(content);
      
   let replies = document.createElement('ul');
   replies.classList.add('replies');
   l.append(replies);
   let opener = m_l('a',{cla:'opener',con:e.n,ref:'#'+e.n});
   opener.dataset.nostr = e.n;
   opener.addEventListener('click', nostr_link);
   l.append(opener);
   
   return l
}

function build_relays(rels, l) 
{
   let rr;
   rels.trim();
   if (rels.startsWith('{') && rels.endsWith('}')) 
   {
      try { rr = JSON.parse(rels) } 
      catch (error) { console.log('no relays found')}
      
      if (rr) 
      {
         let r = l.querySelector('.relays');
         
         if (!r) 
         {
            r = make_section('relays');
            l.append(r);
         }
         
         r.textContent = '';
         
         Object.entries(rr).forEach(([key, value]) => 
         {
            const 
               li = document.createElement('li'),
               a = document.createElement('a');
               
            li.classList.add('section-item');
            a.classList.add('relay');
            a.textContent = key.substr(6);
            a.dataset.read = value.read ? 'r' : '-';
            a.dataset.write = value.write ? 'w' : '-';
            li.append(a);
            r.append(li);
         });
      }
   }
}

function raw_event(event_data) 
{
   const o = event_data.o;
   if (o) 
   {
      if (event_data.seen) o.seen = event_data.seen;
      
      const dl = document.createElement('dl');
      dl.classList.add('raw');
      Object.entries(o).forEach(([key, value]) =>
      {
         const dt = document.createElement('dt');
         dt.classList.add('raw-' + key);
         dt.textContent = key;
         
         let v = value;
         if (key === 'tags' || key === 'seen') 
         {
            v = document.createElement('ul');
            value.forEach((val)=>
            {
               const li = document.createElement('li');
               if (typeof val === 'object' && val.length) val = val.join(', ');
               li.textContent = val;
               v.append(li);
            });         
         }
         
         const dd = document.createElement('dd');
         dd.classList.add('raw-' + key);
         dd.append(v); 
         dl.append(dt,dd);
         
      });
      
      return dl;
   }
}

function m_l(tagName, o = false)
{
   const l = document.createElement(tagName);
   if (o) 
   {
      if (o.id)  l.id = o.id;
      if (o.cla) l.classList.add(o.cla);
      if (o.lab) l.dataset.label = o.lab;
      if (o.ref) l.href = o.ref;
      if (o.src) l.src = o.src;
      if (o.tit) l.title = o.tit;
      if (o.con) l.textContent = o.con;  
   }
   return l
}




//function defolt(o) 
//{   
//   const l = make_l('article', {id: o.id, cl:'e'});
//   l.setAttribute('data-kind', o.kind);
//   l.dataset.stamp = o.created_at;
//   stylek([o.pubkey, o.id], l);
//   
//   const id = document.createElement('h1');
//   id.append(taglink(['e',o.id], ''));
//   
//   const by = make_l('p', {cl:'by'});
//   const created_at = make_time(o.created_at);
//   by.append(taglink(['p', o.pubkey], ''), created_at);
//   
//   l.append(id, by, make_l('a', {cl:'s', href: '#s-'+o.id , title:'view-source',content: ''+o.kind}), make_l('section', {cl:'content', content: o.content}));
//   
//   if (o.tags) 
//   {
//      const tags = make_l('ol', {cl:'tags'});
//      tags.start = 0;
//      o.tags.forEach((tag)=>{ tags.append(make_l('li', {cl:'tag', content:taglink(tag,'')})) });
//      l.append(tags);
//   }
//   
//   l.append(make_actions(), make_l('section', {cl:'replies'}));
//   
//   update_time(created_at);
//   created_at.addEventListener('click', function(event) {update_time(created_at)}, false);
//   return l
//}

function e_e(o) 
{
   const opt = 
   {
      id: o.id,
      cla: o.pubkey
   }
   const event = m_l('article', opt);
   event.classList.add('e_e');
   event.dataset.kind = o.kind;
   event.dataset.stamp = o.created_at;
//   event.dataset.sig = o.sig;
   
   const by = m_l('p', {cla: 'by'})
   const created_at = make_time(o.created_at);
   by.append(tag_link(['p', o.pubkey], ''), created_at);
   
   
//   event.append(by, m_l('section', {con: o.content }));
   event.append(by);
   
//   if (o.tags.length)
//   {
//      const tags = m_l('ol', {})
//      tags.start = 0;
//      o.tags.map((tag)=>
//      { tags.append(m_l('li', {con: tag.join(', ')})) });
//      event.append(tags)
//   }
   
   return event
}

function anal_z(o) 
{
   
}

function defolt(o) 
{
   let l = document.getElementById(o.id);
   if (!l) 
   {
      l = e_e(o);
      const container = document.getElementById('e');
      container.insertBefore(l, last_first(container, o.created_at))  
   }
   
}

function kind0(e) 
{ 
   // NIP-01 set_metadata
   let o = e.o;
   let new_data;
   try { new_data = typeof o.content === 'object' ? o.content : JSON.parse(o.content) } 
   catch (err) { console.log('invalid kind:0 content') }
   
   if (new_data) 
   {  
      let contact = aa.p[o.pubkey];

      let old_data = contact.data;
      if (!old_data || !contact.last_k0 || contact.last_k0 < o.created_at)
      {
         aa.p[o.pubkey].data = new_data;
         aa.p[o.pubkey].last_k0 = o.created_at;
      }

      if (o.pubkey === aa.k && !aa.k0.find((e)=> e.id === o.id)) 
      {
         aa.k0.unshift(o);
         aa.k0.sort((a,b) => b.created_at - a.created_at);
         
         update_u(aa.k);
      }
      save_aa();
      
      
      
//      if (location.hash.length 
//      && location.hash.startsWith('#p-'+o.pubkey)
//      ) 
//      { 
//         select_p(o.pubkey); console.log(o.pubkey)
//      }
   }
}

function appende(l,o) 
{
   let 
      reply_id,
      reply_tag = get_reply(o.tags),
      append_as_root = false;
      
   if (reply_tag) reply_id = reply_tag[1];
   if (reply_id) 
   {
      reply_id = x_note(reply_tag[1])
      l.classList.add('reply');
      l.setAttribute('data-reply', reply_id);
      let reply = document.getElementById(reply_id);
      if (reply) lies(reply, l);
      else append_as_root = true;
   } 
   else 
   {
      l.classList.add('root');
      append_as_root = true
   }
   
   if (append_as_root) 
   {
      const 
         knd1 = document.getElementById('kind-1'), 
         l_stamp = parseInt(l.dataset.stamp),
         last = [...knd1.children].filter((r)=> l_stamp > parseInt(r.dataset.stamp))[0];
      knd1.insertBefore(l, last ? last : null);
   }
}

function kind1(e) 
{ // NIP1 text_note
   let o = e.o;
   let l = document.getElementById(e.n);   
   if (l 
   && l.classList.contains('draft')) 
   {
      l.classList.remove('draft');
      let actions_draft = child_from_class(l, 'actions-draft');
      actions_draft.remove();
      let source = child_from_class(l, 'source');
      if (source) source.remove();
   }
   else if (!l)
   {
      l = newid(e);      
      
      if (o.kind === 1 || o.kind === 40 || o.kind === 42) 
      {
         if (is_trusty(o.pubkey)) parse_content(l);
         l.insertBefore(make_actions(), l.querySelector('.replies'));
      }

      appende(l,o);
      
//      if (o.id === sessionStorage.sub_root 
//      || (location.hash.length && location.hash.startsWith('#e-'+o.id))
//      ) 
//      {
//         is_interesting(l);
//         sessionStorage.removeItem('sub_root');
//      }
      
      get_orphans(l);
      
      if (e.draft) 
      {
//         delete o.draft;
//         l.dataset.o = JSON.stringify(o);

         l.dataset.draft = o.content;
         l.classList.add('draft');
         l.append(make_draft_actions());
//            localStorage[e.o.id] = JSON.stringify(e.o);
//            compose.draft = x_note(e.o.id);
//            compose.seen = [];
      }
      
      if (history.state.nostr === l.id) e_open(history.state.nostr);
      
      
//      if (o.kind === 1) 
//      {
//         in_view.observe(l);
//         l.insertBefore(make_actions(), l.querySelector('.replies'));
//      }
   } 
}

function kind2(e) 
{
   // Recommend Relay (NIP1)
   kind1(e);
}

function kfc(ops)
{
   // kentu-key find contact
   // key follow contact
   const aap = Object.entries(aa.p);
   if (ops.k) return aap[k]
   
   
}

function update_follows() 
{
   let aap = Object.entries(aa.p);
   let unfollowed = [];
   // remove prior follows
   // for each contact that is followed
   aap.filter(([k,v])=>v.followed_by)
   .map(([dis_k,contact])=> 
   {
      // for each of the ids that follow this k
      contact.followed_by.map((id)=>
      {
         // check that they still follow k
         if (aa.p[id].bff && !aa.p[id].bff.includes(dis_k)) 
         {
//            console.log(dis_k,contact);
//            console.log(id,aa.p[id].bff);
//            console.log('not found in ' + id + ' bffs', aa.p[id].bff);
            contact.followed_by = contact.followed_by.filter((i)=> i !== id );
            unfollowed.push(dis_k);
         }
      });      
   });
   return unfollowed;
}

function kind3(e) 
{ 
   // Contacts (NIP2) (& relays until new dedicated relay NIP)
   let o = e.o;
   if (!aa.p[o.pubkey].last_k3 || aa.p[o.pubkey].last_k3 < o.created_at)
   {
      aa.p[o.pubkey].last_k3 = o.created_at;
      const dis_you = o.pubkey === aa.k;
   
      if (o.tags.length) 
      {
         // iterate over each contact on the list
         let pubs = [];
         o.tags.forEach((tag)=>
         {
            // tag = ['p','id','relay_url','petname']
            if (tag.length > 1 && tag[0] === 'p') 
            {
               let pub = tag[1].trim();
               if (is_hex(pub)) 
               {
      //            console.log(ot[1].length);
                  pubs.push(pub);
                  let contact = p_get(pub);
                  
//                  if (!aa.p[pub]) aa.p[pub] = { followed_by:[o.pubkey], relays:[], petnames:[] };
                  
                  if (!contact.followed_by) aa.p[pub].followed_by = [o.pubkey];
                  if (!contact.followed_by.includes(o.pubkey)) aa.p[pub].followed_by.push(o.pubkey);
                  let trust = trust_calc(pub);
                  if (!aa.p[pub].trust || aa.p[pub].trust !== trust) 
                  {
                     aa.p[pub].trust = trust;
                     update_author_links(aa.p[pub]);
                  }
                  // relay hints
                  if (tag[2] && tag[2] !== '') 
                  {
                     let relay = tag[2].trim();
                     if (dis_you) aa.p[pub].relay = relay;
                     if (!contact.relays) aa.p[pub].relays = [relay];
                     if (!contact.relays.includes(relay)) aa.p[pub].relays.push(relay); 
                  }
      
                  // petnames
                  if (tag[3] && tag[3] !== '') 
                  {
                     let petname = tag[3].trim();
                     if (dis_you) aa.p[pub].petname = petname;
                     if (!contact.petnames) aa.p[pub].petnames = [petname];
                     if (!contact.petnames.includes(petname)) aa.p[pub].petnames.push(petname);
                  }
                  
                  
                  
               } // else console.log('invalid pubkey in kind:3')
            } // else console.log('not p tag in kind:3')
         });
         pubs = [...new Set(pubs)];         
         aa.p[o.pubkey].bff = pubs;
      }
      
      let unfollowed = update_follows();
      if (unfollowed.length) unfollowed.map(trust_set)
      
      // relays part
      if (dis_you) 
      {
         if (!aa.k3.find((e)=> e.id === o.id))
         {
            aa.k3.unshift(o);
            aa.k3.sort((a,b) => b.created_at - a.created_at);
         }
         let rels;
         try { rels = JSON.parse(o.content) } 
         catch (error) { console.log('no relays found in your kind-3') }
         if (rels) 
         {
            options.r = rels
            localStorage.options = JSON.stringify(options);
         }      
      }
      
      save_aa();
   } 
}

function kind7(e) 
{
   // NIP25 Reactions
   let o = e.o;
   const reply_tag = get_reply(o.tags);
   if (reply_tag) 
   {
      let reply_id = reply_tag[1];
      
      if (!db[reply_id])
      {
         db_new_id(reply_id);
      } 
      
      if (!db[reply_id].react_ids.includes(reply_id))
      {
        db[reply_id].react_ids.push(o.id);
        
        if (db[reply_id].reactions[o.content]) db[reply_id].reactions[o.content].push(o.pubkey)
        else db[reply_id].reactions[o.content] = [o.pubkey]
      } 
      
      if (!document.getElementById(o.id)) 
      {
         document.getElementById('e').insertBefore(e_e(o), inb4(document.getElementById('e'), o.created_at)) 
      }
   }
}

function kind10001(e) 
{
   let o = e.o;
   if (o.pubkey === aa.k) 
   {
      if (!aa.k10001.find((e)=> e.id === o.id))
      {
         aa.k10001.unshift(o);
         aa.k10001.sort((a,b) => b.created_at - a.created_at);
      }
      console.log(o)
   }
}