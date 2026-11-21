
"use strict";
/* NÚCLEO DEMO — Todos los datos y operaciones son ficticios y locales al navegador.
   No se conecta a NÚCLEO productivo, Supabase, Google Drive ni sistemas de pago. */
(function(){
const $=s=>document.querySelector(s);
const navNames={inicio:"Inicio",facturas:"Facturas y pagos",proveedores:"Proveedores",cuentas:"Cuentas corrientes",tesoreria:"Tesorería",caja:"Control de caja",reportes:"Indicadores",documentos:"Documentos ficticios",futuro:"Próximas funciones",apoyar:"Apoyar NÚCLEO"};
const sampleSuppliers=[
 {id:"S01",name:"Patagonia Mayorista",category:"Almacén y secos",city:"Villa del Lago",contact:"Compras"},
 {id:"S02",name:"Frutihue Distribuciones",category:"Frutas y verduras",city:"Lago Azul",contact:"Logística"},
 {id:"S03",name:"Bebidas Cumbre Sur",category:"Bebidas",city:"Bosque Andino",contact:"Comercial"},
 {id:"S04",name:"Pescados del Sur",category:"Pescados y mariscos",city:"Puerto Laguna",contact:"Pedidos"},
 {id:"S05",name:"Limpieza Austral",category:"Higiene",city:"Villa del Lago",contact:"Atención"},
 {id:"S06",name:"Lácteos del Bosque",category:"Lácteos",city:"Valle Verde",contact:"Ventas"}
];

/* COPIAS PÚBLICAS ESTÁTICAS: NINGÚN DOCUMENTO REAL NI ACCESO A GOOGLE DRIVE */
const publicDocs=[
 {id:"rem-0001",supplier:"S01",associated:"A-0003-00001521",number:"DEMO-REM-0001",kind:"Remito de entrega",description:"Recepción completa · cantidades inventadas",date:"04/11/2026"},
 {id:"rem-0002",supplier:"S02",associated:"A-0002-00008215",number:"DEMO-REM-0002",kind:"Remito de entrega",description:"Diferencia de una unidad · caso simulado",date:"05/11/2026"},
 {id:"rem-0003",supplier:"S04",associated:"R-0004-00004211",number:"DEMO-REM-0003",kind:"Remito de mercadería",description:"Control de recepción ficticio",date:"11/11/2026"},
 {id:"rec-0004",supplier:"S03",associated:"A-0001-00003471",number:"DEMO-REC-0004",kind:"Constancia de recepción",description:"Conformidad documental de prueba",date:"07/11/2026"}
];
const demoDocUrl=id=>"./documentos/?doc="+encodeURIComponent(id);
const viewDocButton=(d,label="ABRIR DOCUMENTO FICTICIO ↗")=>'<a class="btn doc-link" href="'+demoDocUrl(d.id)+'" target="_blank" rel="noopener noreferrer">'+label+'</a>';
const docsForSupplier=id=>publicDocs.filter(d=>d.supplier===id);
const docsForInvoice=x=>publicDocs.filter(d=>d.associated===x.number&&d.supplier===x.supplier);

const invoiceSeed=[
 {id:101,supplier:"S01",number:"A-0003-00001521",date:"2026-11-04",due:"2026-11-14",amount:680400,paid:0,type:"Factura"},
 {id:102,supplier:"S02",number:"A-0002-00008215",date:"2026-11-05",due:"2026-11-12",amount:284550,paid:284550,type:"Factura"},
 {id:103,supplier:"S03",number:"A-0001-00003471",date:"2026-11-07",due:"2026-11-17",amount:950800,paid:370000,type:"Factura"},
 {id:104,supplier:"S04",number:"A-0004-00002109",date:"2026-11-08",due:"2026-11-16",amount:1235000,paid:0,type:"Factura"},
 {id:105,supplier:"S05",number:"A-0005-00001424",date:"2026-11-08",due:"2026-11-20",amount:180300,paid:180300,type:"Factura"},
 {id:106,supplier:"S06",number:"A-0002-00001138",date:"2026-11-09",due:"2026-11-19",amount:412000,paid:0,type:"Factura"},
 {id:107,supplier:"S01",number:"A-0003-00001532",date:"2026-11-10",due:"2026-11-22",amount:245600,paid:0,type:"Factura"},
 {id:108,supplier:"S02",number:"A-0002-00008239",date:"2026-11-10",due:"2026-11-18",amount:315700,paid:130000,type:"Factura"},
 {id:109,supplier:"S03",number:"A-0001-00003480",date:"2026-11-11",due:"2026-11-24",amount:325900,paid:325900,type:"Factura"},
 {id:110,supplier:"S04",number:"R-0004-00004211",date:"2026-11-11",due:"2026-11-25",amount:198400,paid:0,type:"Remito"}
];
const treasurySeed=[
 {id:"T1",type:"Visa · POSNET",date:"2026-11-10",gross:785400,fee:24500,status:"Proyección"},
 {id:"T2",type:"QR · Mercado Pago",date:"2026-11-10",gross:410000,fee:9800,status:"Proyección"},
 {id:"T3",type:"Mastercard · POSNET",date:"2026-11-11",gross:690200,fee:20100,status:"Registrado"},
 {id:"T4",type:"MODO · QR",date:"2026-11-11",gross:390500,fee:7450,status:"Proyección"}
];
const cashSeed=[
 {id:1,date:"2026-11-10",detail:"Venta de salón · Ejemplo",kind:"Ingreso",amount:320000},
 {id:2,date:"2026-11-10",detail:"Compra urgente · Ejemplo",kind:"Egreso",amount:48900},
 {id:3,date:"2026-11-11",detail:"Venta de salón · Ejemplo",kind:"Ingreso",amount:270000},
 {id:4,date:"2026-11-11",detail:"Insumos de caja · Ejemplo",kind:"Egreso",amount:35700}
];
let invoices,treasury,cash,log,active="inicio",searchText="",filterStatus="todos";
function initialize(){invoices=invoiceSeed.map(x=>({...x}));treasury=treasurySeed.map(x=>({...x}));cash=cashSeed.map(x=>({...x}));log=[{time:"09:20",detail:"Datos de demostración preparados"},{time:"09:12",detail:"Ejemplo de recepción de documentos"},{time:"08:45",detail:"Ejemplo de control de obligaciones"}];searchText="";filterStatus="todos"}
initialize();
const root=$("#view"),nav=$("#menu"),modal=$("#modal"),modalBody=$("#modal-body"),modalTitle=$("#modal-title"),toastBox=$("#toast");
const money=x=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(x);
const number=x=>new Intl.NumberFormat("es-AR").format(x);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nameOf=id=>(sampleSuppliers.find(x=>x.id===id)||{}).name||"Proveedor ficticio";
const charge=x=>x.type==="Remito"?0:x.amount;
const balance=x=>Math.max(0,charge(x)-x.paid);
const statusOf=x=>x.paid>=x.amount?"paid":x.paid>0?"partial":"pending";
const badge=(text,cls)=>'<span class="tag '+cls+'">'+esc(text)+'</span>';
const badgeInvoice=x=>x.type==="Remito"?badge("Remito · sin deuda","now"):statusOf(x)==="paid"?badge("Pagado","paid"):statusOf(x)==="partial"?badge("Pago parcial","partial"):badge("Pendiente","pending");
const sum=(xs,key)=>xs.reduce((a,x)=>a+Number(typeof key==="function"?key(x):x[key]),0);
const stats=items=>'<div class="grid stats">'+items.map(x=>'<div class="stat '+(x.tone||"info")+'"><small>'+esc(x.label)+'</small><strong>'+esc(x.value)+'</strong><span>'+esc(x.note||"Solo datos de muestra")+'</span></div>').join("")+'</div>';
const button=(label,action,id,cls="")=>'<button class="btn '+cls+'" type="button" data-action="'+esc(action)+'" '+(id!==undefined?'data-id="'+esc(id)+'"':"")+'>'+label+'</button>';
const head=(title,description,buttons="")=>'<div class="pagehead"><div><div class="eyebrow">NÚCLEO · recorrido público</div><h1>'+title+'</h1><p>'+description+'</p></div><div class="actions">'+buttons+'</div></div>';
const panel=(title,description,body,action="")=>'<section class="panel"><div class="panel-header"><div><div class="panel-title">'+title+'</div>'+(description?'<div class="panel-subtitle">'+description+'</div>':"")+'</div>'+action+'</div>'+body+'</section>';
const tr=(cells)=>'<tr>'+cells.map((x,i)=>'<td '+(i===cells.length-2?'class="numeric"':"")+'>'+x+'</td>').join("")+'</tr>';

const labelRows=(rows,columns)=>rows.replace(/<tr>([\s\S]*?)<\/tr>/g,(_,inner)=>{let i=0;return '<tr>'+inner.replace(/<td\b([^>]*)>/g,(tag,attrs)=>'<td'+attrs+' data-label="'+esc(columns[i++]||"Detalle")+'">')+'</tr>'});
const table=(columns,rows)=>'<div class="table-wrap"><table><thead><tr>'+columns.map(x=>'<th>'+x+'</th>').join("")+'</tr></thead><tbody>'+labelRows(rows,columns)+'</tbody></table></div>';

const activity=()=>'<div class="list">'+log.slice(0,5).map(l=>'<div class="listrow"><div><strong>'+esc(l.detail)+'</strong><small>Hoy a las '+esc(l.time)+' · Simulación</small></div>'+badge("Demo","now")+'</div>').join("")+'</div>';
const stamp=()=>new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
function record(detail){log.unshift({time:stamp(),detail});}
function toast(msg){toastBox.textContent=msg;toastBox.classList.add("visible");clearTimeout(toastBox._timer);toastBox._timer=setTimeout(()=>toastBox.classList.remove("visible"),2900)}
function getId(e){return e.closest("[data-id]")?.dataset.id}
function go(page){if(!navNames[page])page="inicio";active=page;searchText="";filterStatus="todos";history.replaceState(null,"","#"+page);render();closeMenu();window.scrollTo({top:0,behavior:"instant"})}

function navUpdate(){
 document.querySelectorAll("[data-page]").forEach(b=>{const selected=b.dataset.page===active;b.classList.toggle("active",selected);b.setAttribute("aria-current",selected?"page":"false")});
 $("#crumb").textContent=navNames[active];
 const more=$("#mobile-more");if(more)more.classList.toggle("section-active",!["inicio","facturas","documentos"].includes(active));
}



/* Los datos operativos de la demo son ficticios. Los aportes aquí indicados son reales, voluntarios y separados de los pagos de la rifa. */
function donationCard(compact=false){
 return '<section class="donation-card" id="apoyar-proyecto" aria-label="Apoyar el desarrollo de NÚCLEO">'+
 '<div class="donation-head"><span class="donation-eyebrow">♥ AYUDANOS A CREAR NÚCLEO</span><h2>Un proyecto para emprendedores, PyMEs y empresas.</h2>'+
 '<p>Estoy construyendo una herramienta para ordenar proveedores, documentos, pagos y procesos de negocios reales. Si querés impulsar su desarrollo, podés colaborar de forma voluntaria.</p></div>'+
 '<div class="donation-grid"><form action="https://www.paypal.com/donate" method="post" target="_blank">'+
 '<input type="hidden" name="hosted_button_id" value="LC22GZCYF8AH4">'+
 '<button class="donation-paypal" type="submit" aria-label="Donar voluntariamente con PayPal">'+
 '<span class="donation-icon">P</span><span><strong>DONAR CON PAYPAL</strong><small>Donación voluntaria ↗</small></span><b aria-hidden="true">↗</b></button></form>'+
 '<button type="button" class="donation-bbva" data-action="copy-alias" aria-label="Copiar alias de Banco Galicia para apoyar NÚCLEO">'+
 '<span class="donation-icon">⧉</span><span><strong>TRANSFERENCIA GALICIA</strong><small>Copiar alias: caye2000</small></span><b aria-hidden="true">↗</b></button></div>'+
 '<div class="bbva-account-details" style="padding:16px;margin:12px 0;background:#fff;color:#072146;border:1px solid #b8cbdc;border-radius:10px;line-height:1.7;overflow-wrap:anywhere"><strong>Banco Galicia · Transferencia</strong><br>Titular: Cayetano Raúl Benítez<br>Alias: <strong>caye2000</strong><br>Antes de enviar, comprobá el titular en tu aplicación bancaria.</div>'+
 '<div class="donation-bank"><div><small>TITULAR</small><strong>Cayetano Raúl Benítez</strong></div><div><small>BANCO</small><strong>Galicia</strong></div><div><small>ALIAS</small><strong>caye2000</strong></div></div>'+
 '<div class="donation-bottom"><span>Las donaciones son reales, opcionales y externas a esta demo. Las facturas, pagos y demás operaciones mostradas son 100% ficticias.</span></div></section>';
}
function viewFunding(){
 return head("Apoyá NÚCLEO","Si te gustaría que esta herramienta llegue a más negocios, podés colaborar con el desarrollo o enviar ideas para hacerla mejor.")+
 '<div class="alert blue"><strong>Transparencia:</strong> esta página solo muestra operaciones ficticias del software; las donaciones desde PayPal o Galicia son voluntarias y reales.</div>'+
 donationCard()+
 panel("También podés aportar sin donar","Tu experiencia puede orientar el proyecto",'<div class="panel-body"><p>Contame qué problema administrativo necesitás resolver, cuál es tu rubro o qué función debería desarrollar primero.</p><div class="actions"><a class="btn primary" href="https://wa.me/5491126830194?text=Hola%20Caye%2C%20prob%C3%A9%20N%C3%9ACLEO%20DEMO%20y%20quiero%20aportar%20una%20idea." target="_blank" rel="noopener noreferrer">Enviar mi idea ↗</a><a class="btn" href="https://cayelab-web.pages.dev/" target="_blank" rel="noopener noreferrer">Conocer CayeLab ↗</a></div></div>');
}
async function copyDonationAlias(){
 const alias="caye2000";let copied=false;
 try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(alias);copied=true}}catch(e){}
 if(!copied){
  const input=document.createElement("textarea");input.value=alias;input.setAttribute("readonly","");input.style.position="fixed";input.style.left="-9999px";document.body.appendChild(input);input.select();
  try{copied=document.execCommand("copy")}catch(e){}
  input.remove();
 }
 if(copied)toast("Alias Galicia copiado: caye2000");
 else toast("Copiá manualmente el alias: caye2000");
}

function viewHome(){
 const due=sum(invoices,balance);
 const billed=sum(invoices,charge);
 const paid=sum(invoices,"paid");
 const pending=invoices.filter(x=>balance(x)>0).length;
 const partial=invoices.filter(x=>x.type==="Factura"&&x.paid>0&&balance(x)>0).length;
 const paidPct=billed>0?Math.min(100,Math.round(paid/billed*100)):0;
 const featured=invoices.find(x=>x.id===103)||invoices.find(x=>x.type==="Factura")||invoices[0];
 const docs=featured?docsForInvoice(featured):[];
 const weeks=[{d:"Lun",n:24,v:245000},{d:"Mar",n:44,v:481000},{d:"Mié",n:35,v:380000},{d:"Jue",n:78,v:852000},{d:"Vie",n:49,v:537000},{d:"Sáb",n:92,v:1004000},{d:"Dom",n:66,v:719000}];
 const modules=[
  {label:"Facturas · PANTALLAZO",detail:"Documentos, vencimientos y pagos",page:"facturas",icon:"▤",tone:"aqua"},
  {label:"Proveedores",detail:"Cada expediente en un solo lugar",page:"proveedores",icon:"◫",tone:"blue"},
  {label:"Cuentas corrientes",detail:"Cargos, pagos y saldos claros",page:"cuentas",icon:"≋",tone:"mint"},
  {label:"Tesorería",detail:"Vouchers y fechas previstas",page:"tesoreria",icon:"◈",tone:"gold"},
  {label:"Documentos",detail:"Abrí remitos ficticios imprimibles",page:"documentos",icon:"▧",tone:"violet"},
  {label:"Caja e indicadores",detail:"Visualizá movimientos del negocio",page:"reportes",icon:"▥",tone:"rose"}
 ];
 const kpis=[
  {label:"Saldo por revisar",val:money(due),sub:"Monto pendiente · ejemplo",tone:"orange",ico:"↗"},
  {label:"Pagos registrados",val:money(paid),sub:"Solo asientos de esta demo",tone:"mint",ico:"✓"},
  {label:"Facturas pendientes",val:String(pending),sub:partial+" con pagos parciales",tone:"blue",ico:"▤"},
  {label:"Proveedores",val:String(sampleSuppliers.length),sub:"Cuentas y documentos ficticios",tone:"purple",ico:"◫"}
 ];
 return `
 <div class="demo-home">
  <section class="dh-hero">
   <div class="dh-hero-copy">
    <span class="dh-eyebrow"><span class="dh-pulse"></span> NÚCLEO · PANEL DE ADMINISTRACIÓN</span>
    <h1>Todo tu negocio.<br><em>Mucho más claro.</em></h1>
    <p>Una sola vista para tus facturas, proveedores, cuentas corrientes, documentos y tesorería. Explorá cómo se trabaja con información organizada.</p>
    <div class="dh-hero-ctas">
     <button type="button" class="dh-btn dh-btn-bright" data-goto="facturas">Explorar PANTALLAZO <span>→</span></button>
     <button type="button" class="dh-btn dh-btn-glass" data-goto="cuentas">Ver cuentas corrientes <span>↗</span></button>
    </div>
    <div class="dh-trust"><span>✓ Sin registrarte</span><span>✓ 100% datos inventados</span><span>✓ Probá operaciones</span></div>
   </div>
   <div class="dh-preview" aria-label="Vista ilustrativa del funcionamiento de NÚCLEO">
    <div class="dh-preview-top"><div class="dh-preview-brand"><span>N.</span><strong>NÚCLEO</strong><small>Ejemplo de trabajo</small></div><span class="dh-demo-dot">● SIMULACIÓN</span></div>
    <div class="dh-preview-inner">
      <div class="dh-preview-eyebrow">RESUMEN DOCUMENTAL · RESTAURANTE HORIZONTE</div>
      <div class="dh-preview-balance">${money(due)}</div>
      <p>Saldo pendiente en el ejemplo</p>
      <div class="dh-progress-head"><span>Pagos registrados</span><strong>${paidPct}%</strong></div>
      <div class="dh-progress"><i style="width:${paidPct}%"></i></div>
      <div class="dh-preview-row"><span class="dh-mini-icon">▤</span><div><strong>Factura recibida</strong><small>Documento de ejemplo</small></div><span class="dh-mini-tag">Registrada</span></div>
      <div class="dh-preview-row"><span class="dh-mini-icon dh-mini-mint">≋</span><div><strong>Pago parcial</strong><small>Cuenta corriente actualizada</small></div><span class="dh-mini-tag success">En demo</span></div>
      <div class="dh-preview-foot">PANTALLAZO <span>→</span> CUENTA CORRIENTE <span>→</span> CONTROL</div>
    </div>
   </div>
  </section>
  <div class="dh-sim-notice"><strong>Este es el mismo enfoque visual del NÚCLEO de trabajo.</strong> Los nombres, cifras, movimientos y documentos de esta demostración son inventados. No conecta con bases, bancos ni Google Drive reales.</div>
  <section class="dh-section" aria-label="Indicadores principales">
   <div class="dh-section-heading"><div><span class="dh-kicker">EN UN SOLO VISTAZO</span><h2>El pulso de tu administración</h2><p>Los indicadores se actualizan cuando probás un pago o agregás una factura ficticia.</p></div><button type="button" class="dh-link" data-goto="reportes">Abrir indicadores →</button></div>
   <div class="dh-kpi-grid">${kpis.map(k=>`<div class="dh-kpi ${k.tone}"><div class="dh-kpi-top"><span>${k.label}</span><i>${k.ico}</i></div><strong>${k.val}</strong><small>${k.sub}</small></div>`).join("")}</div>
  </section>
  <section class="dh-section">
   <div class="dh-section-heading"><div><span class="dh-kicker">ACCESOS RÁPIDOS</span><h2>¿Qué necesitás resolver hoy?</h2><p>Elegí un módulo. Todas estas secciones se pueden recorrer con datos de muestra.</p></div></div>
   <div class="dh-modules">${modules.map(m=>`<button type="button" class="dh-module" data-goto="${m.page}"><span class="dh-module-icon ${m.tone}">${m.icon}</span><span class="dh-module-text"><strong>${m.label}</strong><small>${m.detail}</small></span><b>→</b></button>`).join("")}</div>
  </section>
  <section class="dh-duo">
   <article class="dh-visual-panel">
    <div class="dh-panel-heading"><div><span class="dh-kicker">TESORERÍA VISUAL</span><h2>Lo que viene, sin planillas</h2><p>Proyección semanal totalmente inventada para mostrar el formato de NÚCLEO.</p></div><button type="button" class="dh-link" data-goto="tesoreria">Ver tesorería →</button></div>
    <div class="dh-forecast-total"><span>TOTAL PROYECTADO EN ESTE EJEMPLO</span><strong>${money(weeks.reduce((s,x)=>s+x.v,0))}</strong><small>No equivale a dinero acreditado</small></div>
    <div class="dh-week">${weeks.map(x=>`<div class="dh-day"><span>${x.d}</span><div class="dh-day-track"><i style="height:${x.n}%"></i></div><strong>${Math.round(x.v/1000)}k</strong></div>`).join("")}</div>
    <p class="dh-panel-foot">Las fechas y barras son ilustrativas. En el sistema real, una proyección no reemplaza la conciliación bancaria.</p>
   </article>
   <article class="dh-visual-panel">
    <div class="dh-panel-heading"><div><span class="dh-kicker">CONTROL INTELIGENTE</span><h2>De la factura al pago</h2><p>Visualizá documentos y saldos sin perder el hilo administrativo.</p></div></div>
    <div class="dh-trace">
     <div class="dh-trace-top"><span>EXPEDIENTE DE MUESTRA</span>${badge("100% FICTICIO","now")}</div>
     <strong class="dh-trace-supplier">${featured?esc(nameOf(featured.supplier)):"Proveedor de ejemplo"}</strong>
     <div class="dh-trace-grid">
      <div class="dh-trace-paper"><span>▤ FACTURA</span><strong>${featured?esc(featured.number):"DEMO-0001"}</strong><small>Total de ejemplo</small><b>${featured?money(featured.amount):money(0)}</b></div>
      <div class="dh-trace-paper"><span>✓ PAGO REGISTRADO</span><strong>Asiento de prueba</strong><small>Sin comprobante bancario real</small><b>${featured?money(featured.paid):money(0)}</b></div>
     </div>
     <div class="dh-trace-balance"><span>Saldo de este ejemplo</span><strong>${featured?money(balance(featured)):money(0)}</strong></div>
     <div class="dh-trace-actions"><button type="button" class="dh-btn dh-btn-dark" data-action="invoice-detail" data-id="${featured?featured.id:0}">Abrir expediente →</button>${docs.length?`<a href="${demoDocUrl(docs[0].id)}" target="_blank" rel="noopener noreferrer" class="dh-text-link">Ver remito ficticio ↗</a>`:`<button type="button" class="dh-text-link" data-goto="documentos">Ver documentos ficticios ↗</button>`}</div>
    </div>
   </article>
  </section>
  <section class="dh-section dh-source-block">
   <div class="dh-section-heading"><div><span class="dh-kicker">LA IDEA DETRÁS DE NÚCLEO</span><h2>Tus fuentes, en un mismo tablero</h2><p>Así se organizan las áreas del sistema privado. En esta versión pública, cada fuente se representa con contenido de muestra.</p></div></div>
   <div class="dh-sources">
    ${[
     {name:"PANTALLAZO",detail:"Facturas, estados y pagos",icon:"▤",page:"facturas"},
     {name:"Remitos",detail:"Entregas y recepción",icon:"▧",page:"documentos"},
     {name:"Cuentas corrientes",detail:"Cargos, abonos y saldo",icon:"≋",page:"cuentas"},
     {name:"Fiserv / QR",detail:"Previsiones de tesorería",icon:"◈",page:"tesoreria"}
    ].map(x=>`<button type="button" class="dh-source" data-goto="${x.page}"><span class="dh-source-icon">${x.icon}</span><div><strong>${x.name}</strong><small>${x.detail}</small></div><span class="dh-source-pill">MUESTRA</span></button>`).join("")}
   </div>
  </section>
  <section class="dh-convert"><div><span class="dh-kicker">CONOCÉ LO QUE ESTAMOS CONSTRUYENDO</span><h2>¿Te imaginás administrar así tu negocio?</h2><p>NÚCLEO está en desarrollo. Si querés conocer el proyecto, probar la demo o contarnos qué necesitás, escribinos.</p></div><div class="dh-convert-actions"><a href="https://wa.me/5491126830194?text=Hola%2C%20vi%20la%20demo%20de%20N%C3%9ACLEO%20y%20quiero%20conocer%20el%20proyecto." target="_blank" rel="noopener noreferrer" class="dh-btn dh-btn-dark">Quiero conocer NÚCLEO ↗</a><button type="button" class="dh-btn dh-btn-outline" data-goto="futuro">Funciones futuras →</button></div></section>
  ${donationCard()}
 </div>`;
}
function invoiceRows(rows,compact=false){return rows.map(x=>'<tr><td><strong>'+esc(nameOf(x.supplier))+'</strong><div class="note">'+esc(x.number)+'</div></td><td>'+esc(x.date)+'</td><td>'+esc(x.due)+'</td><td>'+badgeInvoice(x)+'</td><td class="numeric"><strong>'+money(balance(x))+'</strong><div class="note">Total '+money(x.amount)+'</div></td><td><div class="toolbar">'+button("Ver","invoice-detail",x.id)+(!compact&&balance(x)>0?button("Simular pago","pay",x.id,"primary"):"")+'</div></td></tr>').join("")}
function viewInvoices(){
 const pending=invoices.filter(x=>balance(x)>0),partial=invoices.filter(x=>statusOf(x)==="partial");
 const filtered=invoices.filter(x=>{
   const query=(nameOf(x.supplier)+" "+x.number+" "+x.type).toLowerCase();
   return query.includes(searchText.toLowerCase())&&(filterStatus==="todos"||statusOf(x)===filterStatus);
 });
 const filter='<div class="searchline"><input aria-label="Buscar facturas" id="invoice-search" placeholder="Buscar proveedor o número de factura..." value="'+esc(searchText)+'"><select id="invoice-status" aria-label="Filtrar estado">'+[["todos","Todos los estados"],["pending","Pendientes"],["partial","Pagos parciales"],["paid","Pagadas"]].map(x=>'<option value="'+x[0]+'" '+(filterStatus===x[0]?"selected":"")+'>'+x[1]+'</option>').join("")+'</select>'+button("Exportar CSV de ejemplo","export")+'</div>';
 return head("Facturas y pagos","Buscá documentos, consultá estados y registrá pagos ficticios. Los remitos se muestran separados: no deben interpretarse como deudas conciliadas.",button("+ Agregar factura ficticia","add-invoice",undefined,"primary"))+stats([{label:"Total facturado (demo)",value:money(sum(invoices,charge)),tone:"info"},{label:"Saldo a revisar",value:money(sum(pending,balance)),tone:"critical"},{label:"Pagos parciales",value:partial.length,tone:"gold"},{label:"Documentos de prueba",value:invoices.length,tone:"good"}])+panel("Pantallazo · obligaciones","Filtro por proveedor, número y estado",filter+table(["Proveedor / documento","Emisión","Vence","Estado","Saldo","Acciones"],invoiceRows(filtered))+(filtered.length?"":'<p class="empty">No encontramos documentos para este filtro.</p>'))+'<div class="alert"><strong>Regla demostrada:</strong> marcar pagado en esta pantalla no realiza una transferencia. La imputación documental y la conciliación bancaria real son procesos distintos.</div>';
}
function supplierBalance(id){return sum(invoices.filter(x=>x.supplier===id),balance)}
function viewSuppliers(){
 const cards='<div class="list">'+sampleSuppliers.map(s=>'<div class="listrow"><div><strong>'+esc(s.name)+'</strong><small>'+esc(s.category)+' · '+esc(s.city)+'</small></div><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><span class="detail">'+money(supplierBalance(s.id))+'</span>'+button("Abrir ficha","supplier-detail",s.id)+'</div></div>').join("")+'</div>';
 return head("Proveedores","Un expediente claro por proveedor, con sus documentos, movimientos y referencias, sin mezclar deuda con compras o proyecciones.",button("Ver cuentas corrientes","goto", "cuentas","primary"))+stats([{label:"Proveedores",value:sampleSuppliers.length,tone:"info"},{label:"Saldo documental",value:money(sum(invoices,balance)),tone:"critical"},{label:"Facturas de muestra",value:invoices.filter(x=>x.type==="Factura").length,tone:"gold"},{label:"Remitos de ejemplo",value:invoices.filter(x=>x.type==="Remito").length,tone:"good"}])+panel("Archivo maestro de proveedores","Abrí cada ficha y consultá su historial de documentos",'<div class="panel-body">'+cards+'</div>')+'<div class="alert blue"><strong>Importante:</strong> las fichas de la aplicación real requieren autorización. Esta demostración usa nombres inventados y abre únicamente copias HTML públicas de muestra, nunca carpetas privadas de Drive.</div>';
}
function viewAccounts(){
 const rows=sampleSuppliers.map(s=>'<tr><td><strong>'+esc(s.name)+'</strong></td><td>'+number(invoices.filter(x=>x.supplier===s.id).length)+'</td><td class="numeric">'+money(sum(invoices.filter(x=>x.supplier===s.id),charge))+'</td><td class="numeric">'+money(sum(invoices.filter(x=>x.supplier===s.id),"paid"))+'</td><td class="numeric"><strong>'+money(supplierBalance(s.id))+'</strong></td><td>'+button("Ver movimientos","supplier-detail",s.id)+'</td></tr>').join("");
 return head("Cuentas corrientes","Vista ejemplo de cargos, pagos, saldo por proveedor y remitos. La conciliación final siempre requiere verificar documentos originales.")+stats([{label:"Total de cargos",value:money(sum(invoices,charge)),tone:"info"},{label:"Pagos registrados (demo)",value:money(sum(invoices,"paid")),tone:"good"},{label:"Saldo pendiente",value:money(sum(invoices,balance)),tone:"critical"},{label:"Cuentas de ejemplo",value:sampleSuppliers.length,tone:"gold"}])+panel("Cuentas por proveedor","El saldo se recalcula cuando simulás pagos",table(["Proveedor","Documentos","Cargos","Pagos","Saldo",""],rows))+'<div class="alert"><strong>Función en evolución:</strong> la aplicación productiva todavía requiere completar asignaciones de pagos parciales, notas de crédito y conciliaciones. Este panel presenta la experiencia deseada con datos simulados.</div>';
}
function viewTreasury(){
 const rows=treasury.map(x=>'<tr><td><strong>'+esc(x.type)+'</strong></td><td>'+esc(x.date)+'</td><td class="numeric">'+money(x.gross)+'</td><td class="numeric">'+money(x.fee)+'</td><td class="numeric">'+money(x.gross-x.fee)+'</td><td>'+(x.status==="Registrado"?badge("Registro demo","paid"):badge("Estimado","partial"))+'</td></tr>').join("");
 return head("Tesorería","Control de vouchers, POSNET y QR. Distinguí importes brutos, netos esperados y acreditaciones efectivamente verificadas.",button("Ver roadmap","goto","futuro"))+stats([{label:"Bruto registrado en ejemplo",value:money(sum(treasury,"gross")),tone:"info"},{label:"Costos estimados",value:money(sum(treasury,"fee")),tone:"gold"},{label:"Neto esperado",value:money(sum(treasury,x=>x.gross-x.fee)),tone:"good"},{label:"Acreditaciones bancarias verificadas",value:"$ 0",note:"Esta demo no conecta bancos",tone:"critical"}])+panel("Movimientos de tarjetas y QR · muestra","No se realiza ninguna conexión a procesadores de pago",table(["Medio","Fecha","Bruto","Costos","Neto estimado","Estado"],rows))+'<div class="alert"><strong>Importante:</strong> «registrado» es un estado ficticio dentro del ejemplo, no una confirmación bancaria. Una proyección de Fiserv/QR no equivale a una acreditación conciliada.</div>';
}
function viewCash(){
 const entries=cash.map(x=>'<tr><td>'+esc(x.date)+'</td><td><strong>'+esc(x.detail)+'</strong></td><td>'+badge(x.kind,x.kind==="Ingreso"?"paid":"pending")+'</td><td class="numeric">'+money(x.amount)+'</td></tr>').join("");
 const received=sum(cash.filter(x=>x.kind==="Ingreso"),"amount"),spent=sum(cash.filter(x=>x.kind==="Egreso"),"amount");
 return head("Control de caja","Simulación de ingresos, egresos y movimientos de efectivo. Todo se calcula en esta página, sin operaciones reales.",button("+ Movimiento ficticio","add-cash",undefined,"primary"))+stats([{label:"Ingresos",value:money(received),tone:"good"},{label:"Egresos",value:money(spent),tone:"critical"},{label:"Resultado ilustrativo",value:money(received-spent),tone:"info"},{label:"Movimientos",value:cash.length,tone:"gold"}])+panel("Movimientos de caja · muestra","Prueba las altas desde el botón superior",table(["Fecha","Concepto","Tipo","Importe"],entries))+'<div class="alert blue">Este ejemplo no representa una caja arqueada ni vinculada con una cuenta bancaria.</div>';
}
function viewReports(){
 const chart=[{day:"Lun",n:48},{day:"Mar",n:58},{day:"Mié",n:44},{day:"Jue",n:69},{day:"Vie",n:81},{day:"Sáb",n:94},{day:"Dom",n:73}];
 const bars='<div class="chart-bars">'+chart.map(x=>'<div class="chart-bar"><div class="bar" style="height:'+Math.round(100*x.n/100)+'%"></div><small>'+x.day+'</small></div>').join("")+'</div><div class="note">Datos inventados de ocupación. No son ventas de ningún restaurante real.</div>';
 return head("Reportes e indicadores","Un panel ejecutivo pensado para visualizar lo importante sin revisar diez planillas. Los indicadores de esta vista son completamente simulados.",button("Exportar facturas ficticias","export"))+stats([{label:"Documentos",value:invoices.length,tone:"info"},{label:"Saldo documental",value:money(sum(invoices,balance)),tone:"critical"},{label:"Caja · ejemplo",value:money(sum(cash.filter(x=>x.kind==="Ingreso"),"amount")-sum(cash.filter(x=>x.kind==="Egreso"),"amount")),tone:"good"},{label:"Proveedores",value:sampleSuppliers.length,tone:"gold"}])+'<div class="split equal">'+panel("Actividad semanal ilustrativa","Ocupación ficticia (no conectada con FUDO)",'<div class="panel-body">'+bars+'</div>')+panel("Actividad de la demostración","Cambios simulados en esta sesión",'<div class="panel-body">'+activity()+'</div>')+'</div>';
}
const futureItems=[
["Cuentas corrientes completas","Notas de crédito, anticipos, remitos, pagos parciales e imputación trazable con saldo conciliado.","En desarrollo","future","▤"],
["Conciliación bancaria y tarjetas","Cruce de extractos con Fiserv, QR, vouchers, retenciones, comisiones y acreditaciones verificadas.","Planificado","future","≋"],
["Stock, inventario y vencimientos","Control de existencias, depósitos, lotes, alertas de vencimiento y movimientos por sucursal.","Concepto","future","▥"],
["Órdenes de compra y pedidos","Solicitudes por sector, aprobaciones, comparativas de proveedores y seguimiento de entregas.","Planificado","future","◫"],
["Cierres de ventas y FUDO","Consolidar ventas, tickets, personas y medios de pago sin duplicar operaciones.","Planificado","future","◷"],
["CMV, gramajes y costeo","Fichas técnicas, consumo de insumos, evolución de precios y análisis de costo de mercadería.","Concepto","future","◈"],
["Viandas y consumo de personal","Control de vales, pedidos, consumos y ajustes de gasto por unidad o empleado.","Planificado","future","▣"],
["Nómina, adelantos y colectivos","Seguimiento de adelantos, asistencias, boletos y reportes para revisión administrativa.","Planificado","future","♙"],
["Alertas administrativas inteligentes","Detectar pagos vencidos, duplicados, comprobantes faltantes y diferencias a revisar.","En evolución","now","✳"],
["Recepción con fotos y firma","Registro de entrega de mercadería con observaciones, fotos, cantidades y conformidad.","Planificado","future","▧"],
["Documentos con permisos y trazabilidad","Expediente seguro por proveedor, versiones, respaldo e historial de acceso.","En evolución","now","▤"],
["Tesorería con acreditaciones verificadas","Comparar cada proyección con el extracto real y distinguir pendiente de acreditado.","Planificado","future","◉"],
["Asistente administrativo con IA","Sugerencias para clasificar facturas, buscar incidencias y armar informes con aprobación humana.","Concepto","future","✦"],
["Aplicación instalable y perfiles","Acceso cómodo desde PC y celular, cuentas de usuario y roles con permisos delimitados.","En pruebas privadas","now","▣"],
["Auditoría y exportación","Historial de modificaciones, reportes, exportación de datos y respaldo verificable.","En desarrollo","now","⇩"],
["Multiempresa y sucursales","Un mismo entorno para distintas unidades con usuarios, presupuestos y reportes independientes.","Concepto","future","⌘"],
["Integraciones autorizadas","Conectores con Sheets, bancos, facturación y sistemas de gestión, según permisos y compatibilidad.","Planificado","future","⤳"],
["Edición de código abierto","Documentación, licenciamiento y comunidad para una versión separada de cualquier dato privado.","Objetivo futuro","future","♧"]
];
function viewFuture(){
 const planned=futureItems.filter(x=>!x[2].includes("pruebas")&&!x[2].includes("desarrollo")&&!x[2].includes("evolución")).length;
 const features='<div class="feature-grid">'+futureItems.map(x=>'<article class="feature"><div class="feature-ico">'+x[4]+'</div>'+badge(x[2]+' · NO disponible en esta demo',x[3])+'<h3>'+x[0]+'</h3><p>'+x[1]+'</p></article>').join("")+'</div>';
 const intro='<div class="roadmap-intro"><div class="roadmap-step"><strong>● Lo que se puede probar</strong><p>Panel, facturas ficticias, remitos de muestra, pagos simulados, caja, proveedores y visualización de indicadores.</p></div><div class="roadmap-step"><strong>✳ Lo que se proyecta</strong><p>'+planned+' iniciativas futuras o conceptuales, además de funcionalidades en desarrollo o pruebas privadas, sin fechas prometidas.</p></div></div>';
 return head("Todo el potencial de NÚCLEO","HOJA DE RUTA · Funcionalidades proyectadas o en pruebas privadas. Ninguna tarjeta implica disponibilidad comercial ni lanzamiento confirmado.",'<a class="btn primary" href="https://cayelab-web.pages.dev/#apoyar-nucleo" target="_blank" rel="noopener noreferrer">♡ Apoyar NÚCLEO ↗</a>')+
 '<div class="alert blue"><strong>Lo que ves es una visión de producto.</strong> La demo es una simulación con datos completamente inventados. Las funciones de abajo NO se pueden usar todavía aquí y su desarrollo depende de las pruebas y prioridades.</div>'+intro+
 panel("Módulos para próximas versiones",futureItems.length+' ideas, desarrollos y pruebas a explorar', '<div class="panel-body">'+features+'</div>')+
 panel("¿Qué problema debería resolver primero?","Participá en las decisiones",'<div class="panel-body"><p>Contame qué herramienta te quitaría más trabajo o qué te falta en tu negocio. La opinión de emprendedores, contadores, gastronómicos y desarrolladores ayuda a decidir prioridades.</p><div class="actions"><a class="btn primary" href="https://wa.me/5491126830194?text=Hola%20Caye%2C%20prob%C3%A9%20la%20demo%20de%20N%C3%9ACLEO%20y%20quiero%20sugerir%20una%20funci%C3%B3n." target="_blank" rel="noopener noreferrer">Enviar mi idea ↗</a><a class="btn" href="https://cayelab-web.pages.dev/" target="_blank" rel="noopener noreferrer">Conocer CayeLab ↗</a></div></div>');
}

function viewDocuments(){
 const rows=publicDocs.map(d=>'<tr><td><strong>'+esc(d.number)+'</strong><div class="note">100% FICTICIO · SIN VALIDEZ</div></td><td>'+esc(nameOf(d.supplier))+'</td><td>'+esc(d.kind)+'</td><td>'+esc(d.date)+'</td><td>'+badge("Muestra","now")+'</td><td>'+viewDocButton(d,"Abrir copia ↗")+'</td></tr>').join("");
 const cards='<div class="docs-grid">'+publicDocs.map(d=>'<article class="doc-card">'+badge("DOCUMENTO FICTICIO","future")+'<h3>'+esc(d.kind)+'</h3><p><strong>'+esc(d.number)+'</strong> · '+esc(nameOf(d.supplier))+'</p><p>'+esc(d.description)+'</p>'+viewDocButton(d,"Ver documento / imprimir ↗")+'</article>').join("")+'</div>';
 return head("Remitos y documentos ficticios","Abrí constancias de recepción y remitos inventados. Estos enlaces llevan a copias públicas de muestra en Cloudflare, no al Drive privado del proyecto.",button("Funciones futuras","goto","futuro"))
 +'<div class="alert"><strong>DOCUMENTACIÓN 100% INVENTADA:</strong> ninguna empresa, importe, compra, entrega, firma, responsable, mercadería o control fue real. Estos documentos no sirven para pagar, facturar ni recibir mercadería.</div>'
 +stats([{label:"Muestras públicas",value:publicDocs.length,tone:"info"},{label:"Remitos inventados",value:3,tone:"good"},{label:"Constancias inventadas",value:1,tone:"gold"},{label:"Archivos reales publicados",value:0,tone:"critical"}])
 +panel("Abrir remitos y constancias","Se abren en otra pestaña. Podés imprimir o guardar PDF localmente.",'<div class="panel-body">'+cards+'</div>')
 +panel("Archivo documental ficticio","Vinculaciones de ejemplo para mostrar el recorrido",table(["Número","Proveedor inventado","Documento","Fecha","Estado","Acción"],rows))
 +'<div class="alert blue"><strong>Funciones en desarrollo o futuras:</strong> vincular archivos reales de cada empresa con sus permisos, firmar recepciones, validar documentos y conciliar saldos. Nada de eso se ejecuta sobre Drive o bases reales desde esta demo.</div>';
}

const views={inicio:viewHome,facturas:viewInvoices,proveedores:viewSuppliers,cuentas:viewAccounts,tesoreria:viewTreasury,caja:viewCash,reportes:viewReports,documentos:viewDocuments,futuro:viewFuture,apoyar:viewFunding};
function render(){navUpdate();root.innerHTML=views[active]();}
function openModal(title,html){modalTitle.textContent=title;modalBody.innerHTML=html;modal.classList.add("open");modal.setAttribute("aria-hidden","false");$("#modal-close").focus();}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");modalBody.innerHTML="";}

function closeMenu(){
 const sheet=$("#mobile-module-sheet"),backdrop=$("#mobile-sheet-backdrop"),more=$("#mobile-more");
 if(sheet)sheet.hidden=true;
 if(backdrop)backdrop.hidden=true;
 if(more){more.setAttribute("aria-expanded","false");more.classList.remove("expanded")}
 document.body.classList.remove("sheet-open");
 const sidebar=$("#sidebar");if(sidebar)sidebar.classList.remove("open");
}
function openMobileSheet(){
 const sheet=$("#mobile-module-sheet"),backdrop=$("#mobile-sheet-backdrop"),more=$("#mobile-more");
 if(!sheet||!backdrop||!more)return;
 sheet.hidden=false;backdrop.hidden=false;more.setAttribute("aria-expanded","true");more.classList.add("expanded");
 document.body.classList.add("sheet-open");
 const title=$("#mobile-sheet-close");if(title)title.focus();
}

function invoiceDetail(id){
 const x=invoices.find(x=>x.id===Number(id));if(!x)return;
 openModal("Documento ficticio "+x.number,'<div class="alert blue"><strong>Vista ilustrativa.</strong> No existe PDF real ni se consulta ningún servidor.</div><div class="list">'+[
 ["Proveedor",nameOf(x.supplier)],["Tipo",x.type],["Número",x.number],["Fecha",x.date],["Vencimiento",x.due],["Importe",money(x.amount)],["Pagado en la demo",money(x.paid)],["Saldo del ejemplo",money(balance(x))]
 ].map(v=>'<div class="listrow"><small>'+esc(v[0])+'</small><strong>'+esc(v[1])+'</strong></div>').join("")+'</div>'+(docsForInvoice(x).length?'<div class="doc-linked"><strong>Remito o constancia asociada · 100% FICTICIO</strong><p>Copia pública estática, no Google Drive productivo.</p>'+docsForInvoice(x).map(d=>viewDocButton(d)).join("")+'</div>':'<div class="alert blue" style="margin-top:12px">Sin remito asociado en este ejemplo. La integración con documentos reales es una función futura.</div>')+'<div class="modal-foot" style="margin-top:19px">'+(balance(x)>0?button("Simular pago","pay",x.id,"primary"):"")+button("Cerrar","close")+'</div>');
}
function supplierDetail(id){
 const s=sampleSuppliers.find(x=>x.id===id);if(!s)return;const lines=invoices.filter(x=>x.supplier===id);
 const body='<div class="alert blue">Expediente inventado: las copias públicas son estáticas; no se accede a Google Drive privado.</div><p><strong>'+esc(s.name)+'</strong> · '+esc(s.category)+'</p>'+stats([{label:"Cargos",value:money(sum(lines,charge)),tone:"info"},{label:"Pagado",value:money(sum(lines,"paid")),tone:"good"},{label:"Saldo",value:money(sum(lines,balance)),tone:"critical"},{label:"Documentos",value:lines.length,tone:"gold"}])+'<div class="list">'+lines.map(x=>'<div class="listrow"><div><strong>'+esc(x.number)+'</strong><small>'+esc(x.date)+' · '+esc(x.type)+'</small></div><div><strong>'+money(balance(x))+'</strong>'+badgeInvoice(x)+'</div></div>').join("")+'</div>'+(docsForSupplier(s.id).length?'<div class="doc-linked"><strong>Remitos y constancias simulados</strong><p>Archivos ficticios que se pueden abrir e imprimir.</p>'+docsForSupplier(s.id).map(d=>viewDocButton(d,d.number+" ↗")).join("")+'</div>':'<div class="alert blue" style="margin-top:12px">Sin remitos de muestra para este proveedor. Esta vinculación está proyectada.</div>')+'<div class="modal-foot" style="margin-top:16px">'+button("Cerrar","close")+'</div>';
 openModal("Cuenta corriente · "+s.name,body);
}
function paymentForm(id){const x=invoices.find(x=>x.id===Number(id));if(!x||!balance(x))return;
 openModal("Simular pago · "+x.number,'<div class="alert"><strong>Solo simulación:</strong> este formulario no mueve dinero ni modifica una base de datos.</div><p>'+esc(nameOf(x.supplier))+' · Saldo disponible: <strong>'+money(balance(x))+'</strong></p><form id="payment-form" data-id="'+x.id+'"><div class="field"><label for="pay-amount">Importe ficticio en pesos</label><input id="pay-amount" name="amount" type="number" step="1" min="1" max="'+balance(x)+'" value="'+balance(x)+'" required></div><div class="modal-foot"><button type="button" class="btn" data-action="close">Cancelar</button><button type="submit" class="btn primary">Registrar pago de prueba</button></div></form>');
}
function invoiceForm(){openModal("Agregar factura ficticia",'<p class="note">Se agregará únicamente a esta demostración en tu navegador. Los datos se pierden al actualizar.</p><form id="invoice-form"><div class="field"><label for="new-supplier">Proveedor de muestra</label><select id="new-supplier" name="supplier" required>'+sampleSuppliers.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("")+'</select></div><div class="field"><label for="new-number">Número de factura inventado</label><input id="new-number" name="number" maxlength="32" required placeholder="A-0001-00000001"></div><div class="field"><label for="new-amount">Importe ficticio (ARS)</label><input id="new-amount" name="amount" type="number" min="1" max="100000000" step="1" required placeholder="150000"></div><div class="field"><label for="new-due">Vencimiento</label><input id="new-due" name="due" type="date" value="2026-11-24" required></div><div class="modal-foot"><button type="button" class="btn" data-action="close">Cancelar</button><button type="submit" class="btn primary">Agregar a la demo</button></div></form>');}
function cashForm(){openModal("Agregar movimiento ficticio",'<p class="note">No modifica caja real ni genera pagos.</p><form id="cash-form"><div class="field"><label for="cash-detail">Concepto inventado</label><input name="detail" id="cash-detail" maxlength="75" placeholder="Compra de muestra" required></div><div class="field"><label for="cash-type">Tipo</label><select name="type" id="cash-type"><option>Ingreso</option><option>Egreso</option></select></div><div class="field"><label for="cash-amount">Importe (ARS)</label><input name="amount" id="cash-amount" type="number" min="1" max="100000000" step="1" required></div><div class="modal-foot"><button type="button" class="btn" data-action="close">Cancelar</button><button type="submit" class="btn primary">Agregar movimiento de prueba</button></div></form>');}
function exportCsv(){
 const headers=["Proveedor","Documento","Fecha","Vencimiento","Tipo","Importe ARS","Pagado demo ARS","Saldo demo ARS"];
 const rows=invoices.map(x=>[nameOf(x.supplier),x.number,x.date,x.due,x.type,x.amount,x.paid,balance(x)]);
 const quoted=v=>'"'+String(v).replace(/"/g,'""')+'"';
 const csv="\uFEFF"+[headers,...rows].map(row=>row.map(quoted).join(";")).join("\r\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="NUCLEO_DEMO_DATOS_FICTICIOS.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast("Archivo CSV ficticio preparado");
}
document.addEventListener("click",e=>{
 const navButton=e.target.closest("[data-page]");if(navButton){go(navButton.dataset.page);return}
 const to=e.target.closest("[data-goto]");if(to){go(to.dataset.goto);return}
 const el=e.target.closest("[data-action]");if(!el)return;
 const action=el.dataset.action,id=el.dataset.id;
 if(action==="goto"){go(id);return}
 if(action==="close"){closeModal();return}
 if(action==="copy-alias"){copyDonationAlias();return}
 if(action==="invoice-detail"){invoiceDetail(id);return}
 if(action==="supplier-detail"){supplierDetail(id);return}
 if(action==="pay"){paymentForm(id);return}
 if(action==="add-invoice"){invoiceForm();return}
 if(action==="add-cash"){cashForm();return}
 if(action==="export"){exportCsv();return}
 if(action==="reset"){if(window.confirm("¿Restablecer todos los datos ficticios de la demostración?")){initialize();render();toast("Demostración reiniciada")}}
});
document.addEventListener("submit",e=>{
 const form=e.target;if(!["payment-form","invoice-form","cash-form"].includes(form.id))return;
 e.preventDefault();if(!form.reportValidity())return;
 const fd=new FormData(form);
 if(form.id==="payment-form"){
   const x=invoices.find(i=>i.id===Number(form.dataset.id));if(!x)return;
   const amount=Number(fd.get("amount"));if(!Number.isInteger(amount)||amount<1||amount>balance(x)){toast("El importe supera el saldo de la demo");return}
   x.paid+=amount;record("Pago ficticio por "+money(amount)+" · "+nameOf(x.supplier));closeModal();render();toast("Pago simulado. Los saldos se actualizaron.");
 }else if(form.id==="invoice-form"){
   const amount=Number(fd.get("amount")),supplier=String(fd.get("supplier")),number=String(fd.get("number")).trim(),due=String(fd.get("due"));
   if(!sampleSuppliers.some(s=>s.id===supplier)||!Number.isInteger(amount)||amount<1||amount>100000000||number.length<3||!/^\d{4}-\d\d-\d\d$/.test(due)){toast("Revisá los campos de la factura");return}
   invoices.unshift({id:Math.max(...invoices.map(x=>x.id))+1,supplier,number,date:"2026-11-12",due,amount,paid:0,type:"Factura"});record("Factura ficticia "+number+" agregada");closeModal();render();toast("Factura de prueba agregada");
 }else{
   const amount=Number(fd.get("amount")),kind=String(fd.get("type")),detail=String(fd.get("detail")).trim();
   if(!Number.isInteger(amount)||amount<1||amount>100000000||!["Ingreso","Egreso"].includes(kind)||detail.length<2){toast("Revisá los campos de caja");return}
   cash.unshift({id:Date.now(),date:"2026-11-12",detail,kind,amount});record("Movimiento ficticio de caja: "+kind+" · "+money(amount));closeModal();render();toast("Movimiento de caja simulado");
 }
});
document.addEventListener("input",e=>{if(e.target.id==="invoice-search"){searchText=e.target.value;const parent=e.target.closest(".panel");if(parent){const tbody=parent.querySelector("tbody");if(tbody){const filtered=invoices.filter(x=>(nameOf(x.supplier)+" "+x.number+" "+x.type).toLowerCase().includes(searchText.toLowerCase())&&(filterStatus==="todos"||statusOf(x)===filterStatus));tbody.innerHTML=labelRows(invoiceRows(filtered),["Proveedor / documento","Emisión","Vence","Estado","Saldo","Acciones"])}}}});
document.addEventListener("change",e=>{if(e.target.id==="invoice-status"){filterStatus=e.target.value;const panelElement=e.target.closest(".panel"),tbody=panelElement?.querySelector("tbody");if(tbody){const filtered=invoices.filter(x=>(nameOf(x.supplier)+" "+x.number+" "+x.type).toLowerCase().includes(searchText.toLowerCase())&&(filterStatus==="todos"||statusOf(x)===filterStatus));tbody.innerHTML=labelRows(invoiceRows(filtered),["Proveedor / documento","Emisión","Vence","Estado","Saldo","Acciones"])}}});
$("#modal-close").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();closeMenu()}});
$("#mobile-more").addEventListener("click",()=>{$("#mobile-module-sheet").hidden?openMobileSheet():closeMenu()});
$("#mobile-sheet-close").addEventListener("click",()=>{closeMenu();$("#mobile-more").focus()});
$("#mobile-sheet-backdrop").addEventListener("click",closeMenu);
const first=(location.hash||"#inicio").slice(1);active=navNames[first]?first:"inicio";render();
})();