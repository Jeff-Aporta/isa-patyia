import{mdToHtml as E}from"../core/platform.js";import{PROMPT_VAR_PATTERN as T,repairPromptVarBraces as b,varToneStyleAttr as $}from"../core/promptVariables.js";function l(t){return String(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}const h=new Set(["h1","h2","h3","h4","h5","h6","p","ul","ol","li","pre","blockquote","hr"]),N=new Set(["strong","b","em","i","code","a","br","img"]);function a(t){return t.outerHTML}function _(t,e={}){return`<span class="prompt-var-chip" contenteditable="false" data-var="${l(t)}" style="${$(t)}" title="${l(t)}"><span class="prompt-var-chip__label">{{${l(t)}}}</span></span>`}function f(t,e={}){const n=b(String(t??""));if(!n)return"";const r=[];let o=0;const s=n.replace(T,(m,c)=>{const d=`\uE000PV${o++}\uE001`;return r.push({token:d,name:c}),d});let i=E(s);for(const{token:m,name:c}of r)i=i.split(m).join(_(c,e));return i}function w(t){return f(t,{editable:!1})}function H(t){return f(t,{editable:!0})||"<p><br></p>"}function g(t){return t.dataset.var?`{{${t.dataset.var}}}`:""}function u(t){if(t.nodeType===Node.TEXT_NODE)return t.textContent||"";if(t.nodeType!==Node.ELEMENT_NODE)return"";const e=t;if(e.classList?.contains("prompt-var-chip"))return g(e);const n=e.tagName.toLowerCase(),r=()=>[...e.childNodes].map(u).join("");if(!N.has(n))return a(e);switch(n){case"strong":case"b":return`**${r()}**`;case"em":case"i":return`*${r()}*`;case"code":return`\`${r()}\``;case"a":{const o=e.getAttribute("href")||"",s=r();return o?`[${s||o}](${o})`:s}case"img":{const o=e.getAttribute("alt")||"imagen",s=e.getAttribute("src")||"";return s?`![${o}](${s})`:""}case"br":return`
`;default:return a(e)}}function p(t){const e=t.tagName.toLowerCase(),n=()=>[...t.childNodes].map(r=>(r.nodeType===Node.ELEMENT_NODE,u(r))).join("");if(t.classList?.contains("prompt-var-chip"))return g(t);if(!h.has(e)){if(e==="div"&&t.classList.contains("md-table-wrap")){const r=t.querySelector(":scope > table");if(r)return`${a(r)}

`}return e==="table"?`${a(t)}

`:`${a(t)}

`}switch(e){case"h1":return`# ${n().trim()}

`;case"h2":return`## ${n().trim()}

`;case"h3":return`### ${n().trim()}

`;case"h4":return`#### ${n().trim()}

`;case"h5":return`##### ${n().trim()}

`;case"h6":return`###### ${n().trim()}

`;case"p":return`${n()}

`;case"li":return`${t.parentElement?.tagName.toLowerCase()==="ol"?"1.":"-"} ${n().trimStart()}
`;case"ul":case"ol":return[...t.children].map(r=>p(r)).join("")+`
`;case"pre":return`\`\`\`
${t.querySelector("code")?.textContent??t.textContent??""}
\`\`\`

`;case"blockquote":return n().split(`
`).filter(Boolean).map(r=>`> ${r}`).join(`
`)+`

`;case"hr":return`---

`;case"div":{const r=[...t.children];return t.attributes.length>0||t.classList.length>0||r.some(o=>!h.has(o.tagName.toLowerCase()))?`${a(t)}

`:r.map(o=>p(o)).join("")}default:return`${a(t)}

`}}function M(t){let e="";for(const n of t.childNodes)n.nodeType===Node.ELEMENT_NODE?e+=p(n):n.nodeType===Node.TEXT_NODE&&(e+=n.textContent||"");return e.replace(/\n{3,}/g,`

`).trimEnd()}const L=/\{\{\s*[A-Za-z_]\w*\s*\}\}/;function y(t){if(!t)return!1;const e=document.createTreeWalker(t,NodeFilter.SHOW_TEXT);let n;for(;n=e.nextNode();)if(!n.parentElement?.closest(".prompt-var-chip")&&L.test(n.textContent??""))return!0;return!1}export{w as bodyPreviewHtml,H as bodyToEditorHtml,M as editorHtmlToBody,y as surfaceHasRawVarTokens,_ as varChipHtml};
