const baselineFoods = [
  {name:'Chicken Breast', category:'Non-Veg', protein:31, carbs:0, fats:3.6},
  {name:'Paneer', category:'Dairy', protein:18, carbs:2, fats:20},
  {name:'Almonds', category:'Nuts & Seeds', protein:21, carbs:22, fats:49},
  {name:'Spinach', category:'Vegetables', protein:2.9, carbs:3.6, fats:0.4},
  {name:'Tofu', category:'Veg', protein:8, carbs:2, fats:4}
];
let foods = JSON.parse(localStorage.getItem('g4_foods') || 'null') || baselineFoods;
let posts = JSON.parse(localStorage.getItem('g4_posts') || '[]');
let mealLog = JSON.parse(localStorage.getItem('g4_meals') || '[]');
const targets = {protein:150, carbs:220, fats:70};

const tabs = ['All','Non-Veg','Veg','Vegetables','Nuts & Seeds','Dairy'];
let activeTab='All';

const tips = [
['Salt Overload Pump','Pre-Workout Nutrition','Strategic sodium loading protocol to dramatically increase intracellular hydration and muscle volumization prior to resistance training.'],
['Egg Protein Absorption Rule','Bioavailability','Maximizing nitrogen retention and muscular synthesis through precise thermal processing and timing of whole eggs vs egg whites.'],
['The 10-Minute Post-Workout Trick','Recovery','Immediate parasympathetic nervous system activation through controlled breathing and specific nutrient window ingestion to halt catabolism.'],
['Water & Glycogen Muscle Fullness','Physique Manipulation','The exact mathematical ratio manipulation of carbohydrate loading and water intake to maximize glycogen storage for an ultra-dense, full muscle look.'],
['The 100-Step Intra-Workout Secret','Intra-Workout','Active micro-recovery movement protocol performed between maximal exertion sets to flush lactic acid and accelerate ATP synthesis.'],
['The Isometric Hold Finisher','Hypertrophy','Implementing end-of-set terminal isometric contractions at peak muscle shortening to maximize motor unit recruitment and fascial stretching.']
];

function proteinScore(f){return Math.round((f.protein*4)/(f.carbs+f.fats+1)*100)}

function escapeHtml(value=''){
  return String(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function sanitizeImageUrl(value=''){
  const raw = String(value).trim();
  if(!raw) return '';
  try{
    const parsed = new URL(raw, window.location.href);
    if(['http:','https:'].includes(parsed.protocol)) return parsed.href;
  }catch(_){
    return '';
  }
  return '';
}

function save(){localStorage.setItem('g4_foods',JSON.stringify(foods));localStorage.setItem('g4_posts',JSON.stringify(posts));localStorage.setItem('g4_meals',JSON.stringify(mealLog));}

function renderTabs(){
  vaultTabs.innerHTML=tabs.map(t=>`<button class="${t===activeTab?'active':''}" onclick="setTab('${t.replace("'","\\'")}')">${t}</button>`).join('');
}
window.setTab = t=>{activeTab=t; renderVault(); renderTabs();};

function renderVault(){
  const list = activeTab==='All'?foods:foods.filter(f=>f.category===activeTab);
  vaultCards.innerHTML=list.map(f=>`<article class="food-card glass"><h4>${f.name}</h4><p>${f.category}</p><p>P:${f.protein} C:${f.carbs} F:${f.fats}</p><p class="protein-score">Protein Score: ${proteinScore(f)}</p></article>`).join('');
  mealFoodSelect.innerHTML=foods.map((f,i)=>`<option value="${i}">${f.name}</option>`).join('');
}

foodForm.onsubmit=e=>{e.preventDefault();foods.unshift({name:foodName.value,category:foodCategory.value,protein:+foodProtein.value,carbs:+foodCarbs.value,fats:+foodFats.value});save();renderVault();foodForm.reset();};
importSheet.onclick=async()=>{
  const url = sheetInput.value.trim();
  if(!url) return;
  const txt = await (await fetch(url)).text();
  const rows = txt.split('\n').slice(1).map(r=>r.split(','));
  rows.forEach(([name,category,protein,carbs,fats])=>{if(name)foods.push({name,category,protein:+protein,carbs:+carbs,fats:+fats});});
  save();renderVault();
};

weightSlider.oninput=()=>weightLabel.textContent=weightSlider.value;
addMealEntry.onclick=()=>{
  const food = foods[+mealFoodSelect.value];
  const g = +weightSlider.value/100;
  mealLog.push({meal:mealSelect.value,name:food.name,protein:food.protein*g,carbs:food.carbs*g,fats:food.fats*g,time:new Date().toLocaleTimeString()});
  save();renderMeals();
};
function renderMeals(){
  const groups=['Breakfast','Lunch','Dinner','Snacks'];
  mealTimeline.innerHTML=groups.map(m=>`<h4>${m}</h4>`+mealLog.filter(x=>x.meal===m).map(x=>`<p>${x.time} - ${x.name} (${x.protein.toFixed(1)}P/${x.carbs.toFixed(1)}C/${x.fats.toFixed(1)}F)</p>`).join('')).join('');
  const total = mealLog.reduce((a,b)=>({protein:a.protein+b.protein,carbs:a.carbs+b.carbs,fats:a.fats+b.fats}),{protein:0,carbs:0,fats:0});
  macroStats.innerHTML=`<p>Protein: ${total.protein.toFixed(1)} / ${targets.protein}g</p><p>Carbs: ${total.carbs.toFixed(1)} / ${targets.carbs}g</p><p>Fats: ${total.fats.toFixed(1)} / ${targets.fats}g</p>`;
  const pct=Math.min(total.protein/targets.protein,1); ringProtein.style.strokeDashoffset=327-(327*pct); ringText.textContent=`Protein ${total.protein.toFixed(0)} / ${targets.protein}g`;
}

simulateAi.onclick=()=>{
  const pick = foods[Math.floor(Math.random()*foods.length)];
  const scale = 0.8 + Math.random()*0.8;
  const res = {protein:(pick.protein*scale).toFixed(1), carbs:(pick.carbs*scale).toFixed(1), fats:(pick.fats*scale).toFixed(1)};
  mealLog.push({meal:'Snacks', name:`AI: ${pick.name}`, ...Object.fromEntries(Object.entries(res).map(([k,v])=>[k,+v])), time:new Date().toLocaleTimeString()});
  save(); renderMeals();
  visionResult.innerHTML=`<h3>Detected: ${pick.name}</h3><span class="badge protein">Protein ${res.protein}g</span><span class="badge carbs">Carbs ${res.carbs}g</span><span class="badge fats">Fats ${res.fats}g</span>`;
};

postForm.onsubmit=e=>{e.preventDefault();posts.unshift({name:profileName.value,image:postImage.value,desc:postDesc.value,votes:80,points:10,comments:[]});save();renderFeed();postForm.reset();};
function addComment(i,val){posts[i].comments.push(val);save();renderFeed();}
function vote(i,d){posts[i].votes=Math.max(1,Math.min(100,posts[i].votes+d));posts[i].points+=d>0?5:0;save();renderFeed();}
window.addComment=addComment; window.vote=vote;
function renderFeed(){
  communityFeed.innerHTML=posts.map((p,i)=>{
    const safeName = escapeHtml(p.name);
    const safeImage = sanitizeImageUrl(p.image);
    const safeDesc = escapeHtml(p.desc);
    const safeComments = p.comments.map(c=>`<div class='comment'>💬 ${escapeHtml(c)}</div>`).join('');
    const imageMarkup = safeImage ? `<img src="${safeImage}" alt="meal">` : '';

    return `<article class="feed-card glass"><h3>${safeName}</h3>${imageMarkup}<p>${safeDesc}</p><p>Protein Score: ${p.votes}</p><button class="neon-btn" onclick="vote(${i},1)">Upvote</button> <button onclick="vote(${i},-1)">Downvote</button><div>${safeComments}</div><input id='c${i}' placeholder='Comment'><button onclick="addComment(${i},document.getElementById('c${i}').value)">Send</button></article>`;
  }).join('');

  const ranks=[...posts].sort((a,b)=>b.points-a.points).slice(0,5);
  leaderboard.innerHTML=`<h3>GOAT Eater Leaderboard</h3>${ranks.map((r,k)=>`<div class='rank'><span>#${k+1} ${escapeHtml(r.name)}</span><strong>${r.points} pts</strong></div>`).join('')}`;
}

function renderTips(){tipsCards.innerHTML=tips.map(t=>`<article class='tip-card glass'><p><strong>Title:</strong> ${t[0]}</p><p><strong>Category:</strong> ${t[1]}</p><p><strong>Tip Description:</strong> ${t[2]}</p></article>`).join('');}

nav.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(btn.dataset.screen).classList.add('active');nav.querySelectorAll('button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');});
cameraButton.onclick=()=>nav.querySelector('[data-screen="camera"]').click();

renderTabs(); renderVault(); renderMeals(); renderFeed(); renderTips();
