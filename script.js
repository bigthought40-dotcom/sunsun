(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const USERS_KEY = 'moa_demo_users_v1';
  const POSTS_KEY = 'moa_demo_posts_v1';
  const SESSION_KEY = 'moa_demo_session_v1';
  const icons = ['🌱','💡','🎨','☕','🌷','🪴','🦋','🌙'];
  const seedPosts = [
    {id:'seed1',category:'아이디어',title:'요즘 새롭게 배우고 싶은 건 무엇인가요?',content:'요즘은 평소에 관심만 갖고 있던 것들을 하나씩 배워 보고 싶어요. 여러분이 최근에 도전해 보고 싶은 일이 있나요?',author:'모아지기',createdAt:Date.now()-3600000,likes:4,likedBy:[]},
    {id:'seed2',category:'질문',title:'집중이 잘되는 나만의 방법이 있나요?',content:'해야 할 일은 많은데 집중이 잘 안 될 때가 있어요. 음악을 듣거나 잠깐 산책하는 것처럼 여러분만의 작은 팁을 공유해 주세요!',author:'초록별',createdAt:Date.now()-86400000,likes:7,likedBy:[]},
    {id:'seed3',category:'일상',title:'오늘의 작은 행복 기록 ☁️',content:'창문을 열었더니 바람이 시원하게 불어왔어요. 별일 아닌 순간인데 기분이 좋아져서 기록해 봅니다. 오늘 여러분의 작은 행복은 무엇이었나요?',author:'하루한줌',createdAt:Date.now()-172800000,likes:12,likedBy:[]}
  ];
  let currentFilter = 'all';
  let authMode = 'login';
  let toastTimer;
  const safeRead = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
  const getUsers = () => safeRead(USERS_KEY, []);
  const getPosts = () => safeRead(POSTS_KEY, null) || seedPosts;
  const getSession = () => safeRead(SESSION_KEY, null);
  const savePosts = posts => localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const currentUser = () => { const session=getSession(); return session ? getUsers().find(u=>u.email===session.email) || null : null; };
  function showToast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
  function openModal(id){$('#'+id).classList.remove('hidden');document.body.style.overflow='hidden';}
  function closeModal(id){$('#'+id).classList.add('hidden');if($$('.modal-backdrop:not(.hidden)').length===0)document.body.style.overflow='';}
  function formatDate(time){const date=new Date(time);return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;}
  function renderAccount(){const user=currentUser();$('#accountArea').innerHTML=user?`<span class="user-greeting" style="font-size:12px;color:#77748e;margin-right:5px">반가워요, <strong style="color:#7658e8">${escapeHTML(user.name)}</strong></span><button class="btn btn-ghost" id="logoutButton">로그아웃</button><button class="btn btn-primary" id="writeHeader">＋ 글쓰기</button>`:`<button class="btn btn-ghost" id="loginOpen">로그인</button><button class="btn btn-primary" id="signupOpen">회원가입 <span>↗</span></button>`;}
  function renderPosts(){
    const user=currentUser(), search=$('#searchInput').value.trim().toLowerCase();
    const posts=getPosts().filter(post=>(currentFilter==='all'||post.category===currentFilter)&&(!search||`${post.title} ${post.content} ${post.author}`.toLowerCase().includes(search))).sort((a,b)=>b.createdAt-a.createdAt);
    $('#postGrid').innerHTML=posts.map((post,index)=>{const liked=!!(user&&post.likedBy&&post.likedBy.includes(user.email));const avatar=icons[(post.author.charCodeAt(0)||index)%icons.length];return `<article class="post-card"><div class="post-top"><span class="category ${escapeHTML(post.category)}">${escapeHTML(post.category)}</span><span class="post-date">${formatDate(post.createdAt)}</span></div><h3>${escapeHTML(post.title)}</h3><p class="post-content">${escapeHTML(post.content)}</p><div class="post-meta"><div class="author"><span class="author-avatar">${avatar}</span>${escapeHTML(post.author)}</div><div class="post-actions"><button class="action-btn ${liked?'liked':''}" data-like="${escapeHTML(post.id)}" aria-label="좋아요">♡ ${post.likes||0}</button>${user&&post.author===user.name?`<button class="action-btn" data-delete="${escapeHTML(post.id)}" aria-label="삭제">삭제</button>`:''}</div></div></article>`;}).join('');
    $('#emptyState').classList.toggle('hidden',posts.length!==0);
  }
  function openAuth(mode){authMode=mode;updateAuthMode();openModal('authModal');}
  function updateAuthMode(){const signup=authMode==='signup';$('#authTitle').textContent=signup?'모아의 새 멤버가 되어 보세요!':'다시 만나요!';$('#authSubtitle').textContent=signup?'닉네임과 이메일로 간단하게 시작해요.':'로그인하고 커뮤니티에 참여해 보세요.';$('#nameLabel').classList.toggle('hidden',!signup);$('#authName').classList.toggle('hidden',!signup);$('#authName').required=signup;$('#authEmail').autocomplete=signup?'email':'username';$('#authPassword').autocomplete=signup?'new-password':'current-password';$('#authSubmit').innerHTML=signup?'계정 만들기 <span>↗</span>':'로그인하기 <span>↗</span>';$('#switchText').textContent=signup?'이미 계정이 있나요?':'아직 계정이 없나요?';$('#switchAuth').textContent=signup?'로그인':'회원가입';}
  function openComposer(){if(!currentUser()){showToast('게시물을 작성하려면 먼저 로그인해 주세요.');openAuth('login');return;}$('#postForm').reset();openModal('postModal');}
  document.addEventListener('click',e=>{
    const target=e.target.closest('button');if(!target)return;
    if(target.id==='loginOpen')openAuth('login');
    if(target.id==='signupOpen')openAuth('signup');
    if(target.id==='switchAuth') {authMode=authMode==='login'?'signup':'login';updateAuthMode();}
    if(target.id==='writeButton'||target.id==='writeHero'||target.id==='bannerWrite'||target.id==='writeHeader')openComposer();
    if(target.id==='logoutButton'){localStorage.removeItem(SESSION_KEY);renderAccount();renderPosts();showToast('로그아웃했어요. 다음에 또 만나요!');}
    if(target.dataset.close)closeModal(target.dataset.close);
    if(target.dataset.filter){currentFilter=target.dataset.filter;$$('.tab').forEach(t=>t.classList.toggle('active',t===target));renderPosts();}
    if(target.dataset.like){const user=currentUser();if(!user){showToast('좋아요를 누르려면 로그인해 주세요.');openAuth('login');return;}const posts=getPosts(),post=posts.find(p=>p.id===target.dataset.like);if(!post)return;post.likedBy=post.likedBy||[];if(post.likedBy.includes(user.email)){post.likedBy=post.likedBy.filter(email=>email!==user.email);post.likes=Math.max(0,(post.likes||0)-1);}else{post.likedBy.push(user.email);post.likes=(post.likes||0)+1;}savePosts(posts);renderPosts();}
    if(target.dataset.delete){const post=getPosts().find(p=>p.id===target.dataset.delete);const user=currentUser();if(post&&user&&post.author===user.name&&confirm('이 게시물을 삭제할까요?')){savePosts(getPosts().filter(p=>p.id!==post.id));renderPosts();showToast('게시물을 삭제했어요.');}}
  });
  $$('.modal-backdrop').forEach(backdrop=>backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal(backdrop.id);}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal-backdrop:not(.hidden)').forEach(m=>closeModal(m.id));});
  $('#searchInput').addEventListener('input',renderPosts);
  $('#authForm').addEventListener('submit',e=>{
    e.preventDefault();const email=$('#authEmail').value.trim().toLowerCase(),password=$('#authPassword').value;
    if(authMode==='signup'){const name=$('#authName').value.trim();if(name.length<2){showToast('닉네임은 두 글자 이상 입력해 주세요.');return;}const users=getUsers();if(users.some(u=>u.email===email)){showToast('이미 가입된 이메일이에요. 로그인해 주세요.');return;}users.push({name,email,password});localStorage.setItem(USERS_KEY,JSON.stringify(users));localStorage.setItem(SESSION_KEY,JSON.stringify({email}));showToast(`${name}님, 모아에 오신 걸 환영해요!`);}
    else{const user=getUsers().find(u=>u.email===email&&u.password===password);if(!user){showToast('이메일 또는 비밀번호를 확인해 주세요.');return;}localStorage.setItem(SESSION_KEY,JSON.stringify({email}));showToast(`${user.name}님, 다시 만나서 반가워요!`);}
    closeModal('authModal');$('#authForm').reset();renderAccount();renderPosts();
  });
  $('#postForm').addEventListener('submit',e=>{e.preventDefault();const user=currentUser();if(!user){closeModal('postModal');openAuth('login');return;}const title=$('#postTitle').value.trim(),content=$('#postContent').value.trim();if(!title||!content){showToast('제목과 내용을 모두 입력해 주세요.');return;}const posts=getPosts();posts.push({id:`post_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,category:$('#postCategory').value,title,content,author:user.name,createdAt:Date.now(),likes:0,likedBy:[]});savePosts(posts);currentFilter='all';$$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.filter==='all'));$('#searchInput').value='';closeModal('postModal');renderPosts();showToast('새 게시물을 올렸어요!');$('#feed').scrollIntoView({behavior:'smooth'});});
  // Seed demo posts on first visit; posts created later are stored in this browser.
  if(!localStorage.getItem(POSTS_KEY))savePosts(seedPosts);
  renderAccount();renderPosts();
})();