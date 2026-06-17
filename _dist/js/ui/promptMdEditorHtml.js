import{mdToHtml as E}from"../core/platform.js";import{PROMPT_VAR_PATTERN as f,repairPromptVarBraces as T,varToneStyleAttr as h}from"../core/promptVariables.js";function a(t){return String(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function N(t,r={}){const n=r.editable!==!1?`<button type="button" class="prompt-var-chip__del" data-var-del="${a(t)}" aria-label="Eliminar variable ${a(t)}" tabindex="-1">\xD7</button>`:"";return`<span class="prompt-var-chip" contenteditable="false" data-var="${a(t)}" style="${h(t)}" title="${a(t)}"><span class="prompt-var-chip__label">{{${a(t)}}}</span>${n}</span>`}function p(t,r={}){const e=T(String(t??""));if(!e)return"";const n=[];let s=0;const m=e.replace(f,(u,c)=>{const d=`\uE000PV${s++}\uE001`;return n.push({token:d,name:c}),d});let i=E(m);for(const{token:u,name:c}of n)i=i.split(u).join(N(c,r));return i}function _(t){return p(t,{editable:!1})}function v(t){return p(t,{editable:!0})||"<p><br></p>"}function o(t){if(t.nodeType===Node.TEXT_NODE)return t.textContent||"";if(t.nodeType!==Node.ELEMENT_NODE)return"";const r=t;if(r.classList?.contains("prompt-var-chip")&&r.dataset.var)return`{{${r.dataset.var}}}`;const e=r.tagName.toLowerCase(),n=()=>[...r.childNodes].map(o).join("");switch(e){case"strong":case"b":return`**${n()}**`;case"em":case"i":return`*${n()}*`;case"code":return`\`${n()}\``;case"a":return n();case"br":return`
`;default:return n()}}function l(t){const r=t.tagName.toLowerCase(),e=()=>[...t.childNodes].map(n=>(n.nodeType===Node.ELEMENT_NODE,o(n))).join("");if(t.classList?.contains("prompt-var-chip")&&t.dataset.var)return`{{${t.dataset.var}}}`;switch(r){case"h1":return`# ${e().trim()}

`;case"h2":return`## ${e().trim()}

`;case"h3":return`### ${e().trim()}

`;case"h4":return`#### ${e().trim()}

`;case"h5":return`##### ${e().trim()}

`;case"h6":return`###### ${e().trim()}

`;case"p":return`${e()}

`;case"li":return`${t.parentElement?.tagName.toLowerCase()==="ol"?"1.":"-"} ${e().trimStart()}
`;case"ul":case"ol":return[...t.children].map(n=>l(n)).join("")+`
`;case"pre":return`\`\`\`
${t.querySelector("code")?.textContent??t.textContent??""}
\`\`\`

`;case"blockquote":return e().split(`
`).filter(Boolean).map(n=>`> ${n}`).join(`
`)+`

`;case"hr":return`---

`;case"div":return t.classList.contains("md-table-wrap")?t.innerHTML?`${t.textContent?.trim()||""}

`:"":[...t.childNodes].map(n=>n.nodeType===Node.ELEMENT_NODE?l(n):o(n)).join("");default:return e()}}function x(t){let r="";for(const e of t.childNodes)e.nodeType===Node.ELEMENT_NODE?r+=l(e):e.nodeType===Node.TEXT_NODE&&(r+=e.textContent||"");return r.replace(/\n{3,}/g,`

`).trimEnd()}const b=/\{\{\s*[A-Za-z_]\w*\s*\}\}/;function L(t){if(!t)return!1;const r=document.createTreeWalker(t,NodeFilter.SHOW_TEXT);let e;for(;e=r.nextNode();)if(!e.parentElement?.closest(".prompt-var-chip")&&b.test(e.textContent??""))return!0;return!1}export{_ as bodyPreviewHtml,v as bodyToEditorHtml,x as editorHtmlToBody,L as surfaceHasRawVarTokens,N as varChipHtml};
