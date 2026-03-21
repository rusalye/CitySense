/* ═══════════════════════════════════════
   MOCK DATA FOR CITYSENSE UI
═══════════════════════════════════════ */

export const DISCOVERIES = [
  { emoji:'🌳', title:'Cubbon Park', sub:'A lush 300-acre park in the heart of the city, perfect for morning walks and picnics.', dist:'150m', rating:'4.8', mode:'calm', bg:'calm-bg', badge:'teal', badgeTxt:'Calm' },
  { emoji:'☕', title:'Matteo Coffee', sub:'Specialty coffee roastery with cosy corners and quiet reading vibes.', dist:'320m', rating:'4.6', mode:'comfort', bg:'comfort-bg', badge:'gold', badgeTxt:'Comfort' },
  { emoji:'🎨', title:'Pottery Lane', sub:'A narrow street lined with local artisans, studios and ceramic galleries.', dist:'0.8km', rating:'4.9', mode:'explore', bg:'explore-bg', badge:'plum', badgeTxt:'Explore' },
  { emoji:'🌊', title:'Ulsoor Lake Walk', sub:'A serene lakeside walking trail perfect for sunrise and sunset strolls.', dist:'1.8km', rating:'4.7', mode:'calm', bg:'calm-bg', badge:'teal', badgeTxt:'Calm' },
  { emoji:'🏛', title:'Vidhana Soudha', sub:'Iconic heritage architecture — best experienced on foot from the south entrance.', dist:'1.1km', rating:'4.5', mode:'explore', bg:'explore-bg', badge:'plum', badgeTxt:'Heritage' },
  { emoji:'🌺', title:'Raj Bhavan Gardens', sub:'Quiet botanical gardens open in the mornings — rare urban calm.', dist:'900m', rating:'4.6', mode:'calm', bg:'calm-bg', badge:'teal', badgeTxt:'Hidden' },
];

export const POPULAR = [
  { emoji:'🍵', title:"Koshy's Café", sub:"Bengaluru's oldest café — a literary institution since 1940.", dist:'680m', rating:'4.7', mode:'comfort', bg:'comfort-bg', badge:'gold', badgeTxt:'Iconic' },
  { emoji:'🖼', title:'Venkatappa Art Gallery', sub:'Free contemporary art exhibitions in a serene colonial building.', dist:'500m', rating:'4.4', mode:'explore', bg:'explore-bg', badge:'plum', badgeTxt:'Free' },
  { emoji:'🚶', title:'Brigade Road Walk', sub:'A vibrant pedestrian street perfect for evening exploration.', dist:'1.4km', rating:'4.3', mode:'explore', bg:'explore-bg', badge:'sky', badgeTxt:'Evening' },
];

export const CHALLENGES_DATA = [
  { id:'c1', icon:'🌿', title:'Morning Green Walk', desc:'Walk through a park before 9 AM three times this week.', reward:'+120 XP · Blossom Card', progress:2, total:3, color:'var(--teal)', type:'active', daily:true },
  { id:'c2', icon:'☕', title:'Café Connoisseur', desc:'Visit 5 different cafés this month and log your experience.', reward:'+200 XP · Comfort Badge', progress:3, total:5, color:'var(--gold)', type:'active', daily:false },
  { id:'c3', icon:'🔭', title:'Hidden City Explorer', desc:'Discover 3 hidden locations not on popular maps.', reward:'+300 XP · Hidden Alcove Card', progress:1, total:3, color:'var(--plum2)', type:'active', daily:false },
  { id:'c4', icon:'📖', title:'Journal 7 Days', desc:'Write a journal entry for 7 consecutive days.', reward:'+150 XP · Storyteller Badge', progress:7, total:7, color:'var(--sky)', type:'completed', daily:false },
  { id:'c5', icon:'🌅', title:'Sunrise Walker', desc:'Start a walk before 7 AM on 5 different days.', reward:'+250 XP · Dawn Card', progress:5, total:5, color:'var(--gold)', type:'completed', daily:false },
  { id:'c6', icon:'🏛', title:'Heritage Hunt', desc:'Visit 3 heritage sites and photograph their architecture.', reward:'+180 XP · Heritage Card', progress:0, total:3, color:'var(--coral)', type:'active', daily:true },
  { id:'c7', icon:'🌊', title:'Waterside Wander', desc:'Walk along any water body — lake, river, or fountain — for 20 minutes.', reward:'+80 XP', progress:0, total:1, color:'var(--sky)', type:'active', daily:true },
];

export const CARDS_DATA = [
  { emoji:'🌸', name:'Blossom Corner', set:'Green Series', rarity:'rare', collected:true },
  { emoji:'🌙', name:'Night Lantern', set:'Night Series', rarity:'rare', collected:true },
  { emoji:'🌿', name:'Green Path', set:'Green Series', rarity:'common', collected:true },
  { emoji:'☕', name:'The Cosy Corner', set:'Comfort Series', rarity:'common', collected:true },
  { emoji:'🌊', name:'Lake Silence', set:'Water Series', rarity:'rare', collected:true },
  { emoji:'🏛', name:'Heritage Walk', set:'Heritage Series', rarity:'epic', collected:false },
  { emoji:'🔮', name:'Hidden Alcove', set:'Mystery Series', rarity:'epic', collected:false },
  { emoji:'🌅', name:'Dawn Walker', set:'Morning Series', rarity:'epic', collected:false },
  { emoji:'🎨', name:'Pottery Lane', set:'Art Series', rarity:'rare', collected:false },
  { emoji:'🌺', name:'Garden Keeper', set:'Green Series', rarity:'common', collected:false },
  { emoji:'🦋', name:'Butterfly Glade', set:'Nature Series', rarity:'common', collected:false },
  { emoji:'🌃', name:'City After Dark', set:'Night Series', rarity:'epic', collected:false },
  { emoji:'🏔', name:'High Ground', set:'Urban Series', rarity:'common', collected:false },
  { emoji:'🎭', name:'Street Theatre', set:'Culture Series', rarity:'rare', collected:false },
  { emoji:'🌈', name:'Rain Street', set:'Weather Series', rarity:'rare', collected:false },
  { emoji:'⭐', name:'Stardust Alley', set:'Night Series', rarity:'legendary', collected:false },
  { emoji:'🔥', name:'Eternal Flame', set:'Heritage Series', rarity:'legendary', collected:false },
];

export const CITIES_DATA = [
  {
    id:'bengaluru', name:'Bengaluru', country:'Karnataka, India', emoji:'🌆',
    tagline:'The Garden City', color:'var(--teal)', colorHex:'#5eb88a',
    userHere:true, chaptersUnlocked:2, chaptersTotal:3,
    chapters:[
      { id:'mgroad', num:'Chapter I', area:'MG Road / Church Street', emoji:'🏛',
        theme:'Heritage & Culture',
        desc:'The civic spine of the city. Colonial-era architecture, bookshops, live music venues, and the energy of a street that never really sleeps.',
        stops:["Church Street Social","Koshy's Café","MG Road Promenade","Atta Galatta Bookshop","Brigade Road Corner"],
        stopsVisited:5, stopsTotal:5, progress:100, color:'var(--teal)', colorHex:'#5eb88a',
        status:'complete', xp:320, card:'🏛 Heritage Walk Card' },
      { id:'malleshwaram', num:'Chapter II', area:'Malleshwaram', emoji:'🌸',
        theme:'Old Bengaluru & Calm Streets',
        desc:'Tree-lined lanes, century-old temples, morning flower markets, and the unhurried rhythm of old Bengaluru.',
        stops:["Sampige Road Market","Kadalekai Parishe Lane","Mantri Mall Garden","18th Cross Walks","Sankey Tank"],
        stopsVisited:2, stopsTotal:5, progress:40, color:'var(--gold)', colorHex:'#d4a84b',
        status:'active', xp:280, card:'🌸 Blossom Corner Card' },
      { id:'koramangala', num:'Chapter III', area:'Koramangala', emoji:'✦',
        theme:'Modern Bengaluru & Hidden Gems',
        desc:'Startup energy by day, rooftop bars and art studios by night. Discover the modern soul of the city.',
        stops:["Forum Mall Lanes","4th Block Streets","Indoor Stadium Area","Jyoti Nivas Lane","Café Matteo"],
        stopsVisited:0, stopsTotal:5, progress:0, color:'var(--plum2)', colorHex:'#be96e0',
        status:'locked', xp:340, card:'✦ City Pulse Card' },
    ]
  },
  {
    id:'hampi', name:'Hampi', country:'Karnataka, India', emoji:'🏔',
    tagline:'The Ruined Kingdom', color:'var(--coral)', colorHex:'#d4735b',
    userHere:false, chaptersUnlocked:0, chaptersTotal:0, comingSoon:true, chapters:[]
  },
];

export const JOURNAL_DATA = [
  { date:'Today, Thursday', title:'A Morning in <em>Cubbon Park</em>', body:'Arrived at 7:15 AM when the mist was still low on the lawns. The city hadn\'t woken yet. Just birdsong, a few runners, and the smell of wet earth.', tags:['calm','morning','green'], steps:'4.2k', duration:'1h 10m', mood:'😌', moodColor:'var(--teal)' },
  { date:'Wednesday, 4 Sep', title:'<em>Pottery Lane</em> Discovery', body:'Took a wrong turn and stumbled on this narrow alley lined with ceramic studios. Spoke to a potter working on a tea set. Stayed an hour. Got a small cup.', tags:['explore','art','discovery'], steps:'6.8k', duration:'2h', mood:'🤩', moodColor:'var(--plum2)' },
  { date:'Monday, 2 Sep', title:'Matteo Coffee — <em>Afternoon Ritual</em>', body:'Rainy afternoon. Sat by the window with a flat white and watched the street shimmer. Perfect comfort day. Wrote three pages in my notebook.', tags:['comfort','café','rain'], steps:'1.2k', duration:'45m', mood:'☕', moodColor:'var(--gold)' },
  { date:'Friday, 30 Aug', title:'Ulsoor Lake at <em>Sunset</em>', body:'The water turned amber at 6 PM. A few cyclists, a couple of ducks, and complete silence from the city for about twenty minutes. Rare.', tags:['calm','lakeside','sunset'], steps:'5.1k', duration:'1h 30m', mood:'🌅', moodColor:'var(--sky)' },
];

export const MAP_STYLES = {
  dark:{
    calm:[{elementType:'geometry',stylers:[{color:'#0c1419'}]},{elementType:'labels.text.fill',stylers:[{color:'#5a7060'}]},{elementType:'labels.text.stroke',stylers:[{color:'#0c1419'}]},{featureType:'road',elementType:'geometry',stylers:[{color:'#162030'}]},{featureType:'road.highway',elementType:'geometry',stylers:[{color:'#1e3040'}]},{featureType:'park',elementType:'geometry',stylers:[{color:'#0a1a10'}]},{featureType:'park',elementType:'labels.text.fill',stylers:[{color:'#4a9060'}]},{featureType:'water',elementType:'geometry',stylers:[{color:'#071018'}]},{featureType:'poi',elementType:'geometry',stylers:[{color:'#0e1820'}]},{featureType:'transit',elementType:'geometry',stylers:[{color:'#101c28'}]},{featureType:'administrative.locality',elementType:'labels.text.fill',stylers:[{color:'#7ec8a4'}]}],
    comfort:[{elementType:'geometry',stylers:[{color:'#130e08'}]},{elementType:'labels.text.fill',stylers:[{color:'#705030'}]},{elementType:'labels.text.stroke',stylers:[{color:'#130e08'}]},{featureType:'road',elementType:'geometry',stylers:[{color:'#221508'}]},{featureType:'park',elementType:'geometry',stylers:[{color:'#0a1008'}]},{featureType:'water',elementType:'geometry',stylers:[{color:'#070a10'}]},{featureType:'administrative.locality',elementType:'labels.text.fill',stylers:[{color:'#d4a84b'}]}],
    explore:[{elementType:'geometry',stylers:[{color:'#0e0a14'}]},{elementType:'labels.text.fill',stylers:[{color:'#5a4870'}]},{elementType:'labels.text.stroke',stylers:[{color:'#0e0a14'}]},{featureType:'road',elementType:'geometry',stylers:[{color:'#1a1228'}]},{featureType:'park',elementType:'geometry',stylers:[{color:'#0c0e10'}]},{featureType:'water',elementType:'geometry',stylers:[{color:'#060810'}]},{featureType:'administrative.locality',elementType:'labels.text.fill',stylers:[{color:'#be96e0'}]}],
  },
  light:{
    calm:[{elementType:'geometry',stylers:[{color:'#e8f0e8'}]},{elementType:'labels.text.fill',stylers:[{color:'#3a6040'}]},{featureType:'road',elementType:'geometry',stylers:[{color:'#d4e4d4'}]},{featureType:'park',elementType:'geometry',stylers:[{color:'#d0e8d0'}]},{featureType:'water',elementType:'geometry',stylers:[{color:'#b4d8e8'}]},{featureType:'administrative.locality',elementType:'labels.text.fill',stylers:[{color:'#1a5030'}]}],
    comfort:[{elementType:'geometry',stylers:[{color:'#f4ede0'}]},{elementType:'labels.text.fill',stylers:[{color:'#704020'}]},{featureType:'road',elementType:'geometry',stylers:[{color:'#e8d8c0'}]},{featureType:'park',elementType:'geometry',stylers:[{color:'#e0eed8'}]},{featureType:'water',elementType:'geometry',stylers:[{color:'#b8d8f0'}]},{featureType:'administrative.locality',elementType:'labels.text.fill',stylers:[{color:'#804010'}]}],
    explore:[{elementType:'geometry',stylers:[{color:'#ede8f4'}]},{elementType:'labels.text.fill',stylers:[{color:'#504070'}]},{featureType:'road',elementType:'geometry',stylers:[{color:'#dcd4ec'}]},{featureType:'park',elementType:'geometry',stylers:[{color:'#d8ecd8'}]},{featureType:'water',elementType:'geometry',stylers:[{color:'#b8ccf0'}]},{featureType:'administrative.locality',elementType:'labels.text.fill',stylers:[{color:'#6030a0'}]}],
  }
};

export const MAP_PLACES = [
  {lat:12.9766,lng:77.5993,emoji:'🌳',color:'#5eb88a'},{lat:12.9716,lng:77.5946,emoji:'☕',color:'#d4a84b'},
  {lat:12.9719,lng:77.6112,emoji:'🎨',color:'#9b6bbf'},{lat:12.9698,lng:77.6060,emoji:'🚶',color:'#5b9fd4'},
  {lat:12.9748,lng:77.5942,emoji:'🌺',color:'#5eb88a'},{lat:12.9685,lng:77.6196,emoji:'🌊',color:'#5b9fd4'},
  {lat:12.9672,lng:77.5921,emoji:'🍵',color:'#d4a84b'},{lat:12.9730,lng:77.6080,emoji:'🖼',color:'#9b6bbf'},
];
