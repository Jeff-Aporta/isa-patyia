import{mdToHtml as E}from"../core/platform.js";import{PROMPT_VAR_PATTERN as f,repairPromptVarBraces as g,varToneStyleAttr as T}from"../core/promptVariables.js";function o(t){return String(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function b(t,r={}){const e=r.editable!==!1?`<button type="button" class="prompt-var-chip__del" data-var-del="${o(t)}" aria-label="Eliminar variable ${o(t)}" tabindex="-1">\xD7</button>`:"";return`<span class="prompt-var-chip" contenteditable="false" data-var="${o(t)}" style="${T(t)}" title="${o(t)}"><span class="prompt-var-chip__label">{{${o(t)}}}</span>${e}</span>`}function m(t,r={}){const n=g(String(t??""));if(!n)return"";const e=[];let a=0;const s=n.replace(f,(d,l)=>{const p=`\uE000PV${a++}\uE001`;return e.push({token:p,name:l}),p});let c=E(s);for(const{token:d,name:l}of e)c=c.split(d).join(b(l,r));return c}function _(t){return m(t,{editable:!1})}function v(t){return m(t,{editable:!0})||"<p><br></p>"}function i(t){if(t.nodeType===Node.TEXT_NODE)return t.textContent||"";if(t.nodeType!==Node.ELEMENT_NODE)return"";const r=t;if(r.classList?.contains("prompt-var-chip")&&r.dataset.var)return`{{${r.dataset.var}}}`;const n=r.tagName.toLowerCase(),e=()=>[...r.childNodes].map(i).join("");switch(n){case"strong":case"b":return`**${e()}**`;case"em":case"i":return`*${e()}*`;case"code":return`\`${e()}\``;case"a":return e();case"img":{const a=r.getAttribute("alt")||"imagen",s=r.getAttribute("src")||"";return s?`![${a}](${s})`:""}case"br":return`
`;default:return e()}}function u(t){const r=t.tagName.toLowerCase(),n=()=>[...t.childNodes].map(e=>(e.nodeType===Node.ELEMENT_NODE,i(e))).join("");if(t.classList?.contains("prompt-var-chip")&&t.dataset.var)return`{{${t.dataset.var}}}`;switch(r){case"h1":return`# ${n().trim()}

`;case"h2":return`## ${n().trim()}

`;case"h3":return`### ${n().trim()}

`;case"h4":return`#### ${n().trim()}

`;case"h5":return`##### ${n().trim()}

`;case"h6":return`###### ${n().trim()}

`;case"p":return`${n()}

`;case"li":return`${t.parentElement?.tagName.toLowerCase()==="ol"?"1.":"-"} ${n().trimStart()}
`;case"ul":case"ol":return[...t.children].map(e=>u(e)).join("")+`
`;case"pre":return`\`\`\`
${t.querySelector("code")?.textContent??t.textContent??""}
\`\`\`

`;case"blockquote":return n().split(`
`).filter(Boolean).map(e=>`> ${e}`).join(`
`)+`

`;case"hr":return`---

`;case"img":{const e=t.getAttribute("alt")||"imagen",a=t.getAttribute("src")||"";return a?`![${e}](${a})

`:""}case"div":return t.classList.contains("md-table-wrap")?t.innerHTML?`${t.textContent?.trim()||""}

`:"":[...t.childNodes].map(e=>e.nodeType===Node.ELEMENT_NODE?u(e):i(e)).join("");default:return n()}}function x(t){let r="";for(const n of t.childNodes)n.nodeType===Node.ELEMENT_NODE?r+=u(n):n.nodeType===Node.TEXT_NODE&&(r+=n.textContent||"");return r.replace(/\n{3,}/g,`

`).trimEnd()}const h=/\{\{\s*[A-Za-z_]\w*\s*\}\}/;function L(t){if(!t)return!1;const r=document.createTreeWalker(t,NodeFilter.SHOW_TEXT);let n;for(;n=r.nextNode();)if(!n.parentElement?.closest(".prompt-var-chip")&&h.test(n.textContent??""))return!0;return!1}export{_ as bodyPreviewHtml,v as bodyToEditorHtml,x as editorHtmlToBody,L as surfaceHasRawVarTokens,b as varChipHtml};
