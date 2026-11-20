// Preparation checklist, not a quality assessment or professional capability score.
function readinessDimensions(){
 const x=state.answers||{},e=state.extra||{},checks=state.readinessChecks||{};
 const present=v=>{const s=String(v??'').trim();return s.length>0&&!/^(暂无|暂未|暂不|不清楚|不知道|待补充|没有|无$)/.test(s)};
 const any=(...v)=>v.some(present);
 return [
 {name:'执业基础',group:1,items:[['执业城市已填写',any(x.city,e.N003)],['执业身份与年限已填写',present(e.N007)&&any(x.years,e.N004)],['本人已核对执业信息与实际情况一致',!!checks.foundation,'foundation']]},
 {name:'专业信任',group:3,items:[['已记录一段经历或代表事项',any(x.story,e.N027,e.N015)],['已记录支撑证据或专业优势',any(e.N026,e.N025)],['本人已核验依据，并确认素材使用权限',!!checks.evidence,'evidence']]},
 {name:'业务聚焦',group:6,items:[['已填写优先业务',any(x.priority,e.N036)],['已填写业务边界与收费参考',any(x.excluded,e.N037)&&present(e.N041)],['本人已确认业务方向与实际服务能力匹配',!!checks.focus,'focus']]},
 {name:'客户洞察',group:6,items:[['已描述目标客户',any(x.client,e.N043)],['已记录客户原话、触发事件与顾虑',any(x.question,e.N045)&&present(e.N044)&&present(e.N046)],['本人已通过真实客户沟通核对这些描述',!!checks.customer,'customer']]},
 {name:'获客经营',group:6,items:[['已记录服务名称与收费',present(e.N047)&&present(e.N049)],['已记录咨询、付费基线与数据准确程度',present(e.N051)&&present(e.N053)&&present(e.N054)],['本人已核对统计口径与数据来源',!!checks.business,'business']]},
 {name:'内容表达',group:8,items:[['已选择表达风格与内容形式',present(e.N063)&&present(e.N064)],['已记录表达样本与内容边界',present(e.N065)&&present(e.N066)],['本人已确认表达适合自己，且能持续投入',!!checks.expression,'expression']]}
 ].map(d=>({...d,score:Math.round(d.items.filter(i=>i[1]).length/3*100)}));
}
function renderReadiness(){
 const root=document.querySelector('#readiness');if(!root)return;
 const dims=readinessDimensions(),selected=Number.isInteger(state.radarDimension)?Math.max(0,Math.min(5,state.radarDimension)):0;
 root.innerHTML=`<h2>你的定位，准备到哪一步了？</h2><p class="muted">每个维度 3 个检查项：2 项检查是否已记录，1 项由你确认。每项等权，完成 1 / 2 / 3 项分别为 33 / 67 / 100 分。</p><p class="small">这是准备度，不是能力评分。自动检查不验证内容质量或真实性；空白表示尚未准备，示例数据不算真实证据。</p><div class="readiness-layout"><div id="readiness-plot"></div><div><div class="radar-buttons" role="group" aria-label="选择准备度维度">${dims.map((d,i)=>`<button data-dimension="${i}" aria-pressed="${i===selected}" class="${i===selected?'selected':''}">${d.name} <b>${d.score}</b></button>`).join('')}</div><div class="radar-detail" aria-live="polite"><h3>${dims[selected].name} · ${dims[selected].items.filter(i=>i[1]).length}/3 项</h3>${dims[selected].items.map(([label,pass,key])=>key?`<label class="readiness-check"><input type="checkbox" data-readiness="${key}" ${pass?'checked':''}><span>${label}<small>本人确认${state.demo?'（此处仅模拟勾选，不构成事实核验）':''}</small></span></label>`:`<div class="readiness-item"><span aria-hidden="true">${pass?'✓':'○'}</span><span>${label}<small>${pass?'已记录，尚未验证内容':'待补充'}</small></span></div>`).join('')}<button id="readiness-fill" class="primary">补充${dims[selected].name}资料</button></div></div></div>`;
 const width=360,height=350,cx=180,cy=170,r=105;
 const xy=(i,f)=>[cx+Math.sin(i*Math.PI/3)*r*f,cy-Math.cos(i*Math.PI/3)*r*f];
 const pts=f=>dims.map((_,i)=>xy(i,f).join(',')).join(' ');
 let svg=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="定位准备度：${dims.map(d=>d.name+d.score+'分').join('，')}">`;
 for(const tick of [33,67,100]){const p=xy(0,tick/100);svg+=`<polygon class="radar-grid" points="${pts(tick/100)}"/><text class="radar-tick" x="${p[0]+5}" y="${p[1]+12}">${tick}</text>`;}
 dims.forEach((d,i)=>{const p=xy(i,1);svg+=`<line class="radar-grid" x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}"/>`;});
 svg+=`<polygon class="radar-area" points="${dims.map((d,i)=>xy(i,d.score/100).join(',')).join(' ')}"/>`;
 dims.forEach((d,i)=>{const p=xy(i,d.score/100),l=xy(i,1.33);svg+=`<circle class="radar-point" cx="${p[0]}" cy="${p[1]}" r="${i===selected?5:3}"/><text x="${l[0]}" y="${l[1]}" text-anchor="middle">${d.name}</text><text x="${l[0]}" y="${l[1]+19}" text-anchor="middle">${d.score} 分</text>`;});
 root.querySelector('#readiness-plot').innerHTML=svg+'</svg>';
 root.querySelectorAll('[data-dimension]').forEach(b=>b.onclick=()=>{state.radarDimension=+b.dataset.dimension;save();renderReadiness();});
 root.querySelector('[data-readiness]').onchange=e=>{state.readinessChecks={...state.readinessChecks,[e.target.dataset.readiness]:e.target.checked};save();renderReadiness();root.querySelector('[data-readiness]').focus();};
 root.querySelector('#readiness-fill').onclick=()=>{state.openGroup=dims[selected].group;go('library');};
}
