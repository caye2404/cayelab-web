
"use strict";
/* NÚCLEO DEMO — Todos los datos y operaciones son ficticios y locales al navegador.
   No se conecta a NÚCLEO productivo, Supabase, Google Drive ni sistemas de pago. */
(function(){
const $=s=>document.querySelector(s);
const navNames={inicio:"Inicio",facturas:"Facturas y pagos",proveedores:"Proveedores",cuentas:"Cuentas corrientes",tesoreria:"Tesorería",caja:"Control de caja",reportes:"Indicadores",documentos:"Documentos ficticios",futuro:"Próximas funciones"};
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
const table=(columns,rows)=>'<div class="table-wrap"><table><thead><tr>'+columns.map(x=>'<th>'+x+'</th>').join("")+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
const activity=()=>'<div class="list">'+log.slice(0,5).map(l=>'<div class="listrow"><div><strong>'+esc(l.detail)+'</strong><small>Hoy a las '+esc(l.time)+' · Simulación</small></div>'+badge("Demo","now")+'</div>').join("")+'</div>';
const stamp=()=>new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
function record(detail){log.unshift({time:stamp(),detail});}
function toast(msg){toastBox.textContent=msg;toastBox.classList.add("visible");clearTimeout(toastBox._timer);toastBox._timer=setTimeout(()=>toastBox.classList.remove("visible"),2900)}
function getId(e){return e.closest("[data-id]")?.dataset.id}
function go(page){if(!navNames[page])page="inicio";active=page;searchText="";filterStatus="todos";history.replaceState(null,"","#"+page);render();closeMenu();window.scrollTo({top:0,behavior:"instant"})}
function navUpdate(){document.querySelectorAll("[data-page]").forEach(b=>{b.classList.toggle("active",b.dataset.page===active);b.setAttribute("aria-current",b.dataset.page===active?"page":"false")});$("#crumb").textContent=navNames[active]}
function viewHome(){
 const due=sum(invoices,balance),pending=invoices.filter(x=>balance(x)>0).length,partial=invoices.filter(x=>statusOf(x)==="partial").length;
 const intro='<div class="alert blue"><strong>Estás recorriendo una simulación pública.</strong> TODOS los proveedores, comercios, remitos, facturas, importes, fechas, pagos y movimientos son INVENTADOS. No se modifica ningún sistema real. Las funciones pendientes se identifican como futuras.</div>';
 const summary=stats([{label:"Saldo pendiente · ejemplo",value:money(due),note:"Incluye pagos parciales",tone:"critical"},{label:"Facturas por revisar",value:number(pending),note:partial+" con pagos parciales",tone:"gold"},{label:"Proveedores de prueba",value:number(sampleSuppliers.length),note:"Fichas y cuentas corrientes",tone:"info"},{label:"Documentos simulados",value:number(invoices.length),note:"Con historial demostrativo",tone:"good"}]);
 const quick='<div class="quick">'+[['Ver facturas','Revisá saldos, registrá pagos ficticios y agregá una factura.','facturas'],['Abrir remitos de muestra','Consultá documentos inventados imprimibles, sin Drive privado.','documentos'],['Cuentas corrientes','Explorá movimientos y saldos por proveedor.','cuentas'],['Proyectar el futuro','Conocé funciones que todavía están planificadas.','futuro']].map(x=>'<button type="button" data-goto="'+x[2]+'"><b>'+x[0]+' →</b><small>'+x[1]+'</small></button>').join("")+'</div>';
 const alerts='<div class="list">'+invoices.filter(x=>balance(x)>0).slice(0,4).map(x=>'<div class="listrow"><div><strong>'+esc(nameOf(x.supplier))+'</strong><small>'+esc(x.number)+' · '+esc(x.due)+'</small></div><span class="detail">'+money(balance(x))+'</span></div>').join("")+'</div>';
 const steps='<div class="steps">'+[['1','Ingresá a Facturas','Buscá una factura y simulá un pago total o parcial.'],['2','Revisá Cuentas corrientes','Mirá cómo cambian los saldos por proveedor.'],['3','Abrí un documento ficticio','Entrá a Documentos ficticios y abrí una recepción inventada.'],['4','Probá un alta','Agregá una factura inventada y consultá el panel de Inicio.']].map(x=>'<div class="step"><span class="step-num">'+x[0]+'</span><div><strong>'+x[1]+'</strong><p>'+x[2]+'</p></div></div>').join("")+'</div>';
 return head("Bienvenido a NÚCLEO","Un recorrido interactivo por una herramienta administrativa pensada para negocios, PyMEs y emprendedores.",button("↺ Reiniciar demostración","reset"))+intro+summary+panel("Probá las funciones","Hacé clic y experimentá, sin registros reales.",'<div class="panel-body">'+quick+'</div>')+'<div class="split">'+panel("Obligaciones con saldo","Ejemplo de prioridades de trabajo",alerts)+panel("Cómo recorrer la demo","Cuatro pasos para conocer la experiencia",'<div class="panel-body">'+steps+'</div>')+'</div>'+panel("Actividad simulada","Los cambios que hagas quedan visibles durante esta visita",'<div class="panel-body">'+activity()+'</div>');
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
["Conciliación bancaria asistida","Cruce documentado con extractos BBVA, Mercado Pago, vouchers y facturas; requiere reglas y verificaciones reales.","Proyecto futuro","future","≋"],
["Cuentas corrientes completas","Notas de crédito, anticipos, remitos, pagos parciales y saldo validado con historial y adjuntos.","En evolución","future","▤"],
["Cierre de ventas y FUDO","Lectura de cierres diarios, tickets y medios de cobro sin duplicar ventas.","Proyecto futuro","future","◷"],
["Alertas inteligentes","Detectar vencimientos, documentos sin PDF, duplicados y diferencias importantes.","En evolución","future","✳"],
["Asistente administrativo con IA","Ayuda para clasificar documentos, buscar incidencias y preparar reportes, siempre con revisión humana.","Concepto","future","◆"],
["App instalable y acceso por roles","Experiencia más cómoda para celular y computadora, con permisos para cada usuario.","En pruebas","now","▣"],
["Exportación y auditoría","Historial de cambios, reportes claros y registros verificables para cada acción.","En desarrollo","now","⇩"],
["Base abierta y colaborativa","Preparar una edición de código abierto separada de los datos privados de cualquier negocio.","Objetivo futuro","future","♧"]
];
function viewFuture(){
 const features='<div class="feature-grid">'+futureItems.map(x=>'<article class="feature"><div class="feature-ico">'+x[4]+'</div>'+badge(x[2]+' · NO disponible en demo pública',x[3])+'<h3>'+x[0]+'</h3><p>'+x[1]+'</p></article>').join("")+'</div>';
 return head("Presente y futuro de NÚCLEO","HOJA DE RUTA ILUSTRATIVA: algunos módulos están en pruebas privadas, otros todavía no se implementaron. Este panel no representa funciones disponibles ni una fecha de lanzamiento.",'<a class="btn primary" href="https://caye2404.github.io/todo-vuelve/" target="_blank" rel="noopener noreferrer">Apoyar el proyecto ↗</a>')+'<div class="alert blue"><strong>Transparencia:</strong> la demo permite experimentar con experiencias de producto, incluso si todavía no están implementadas en la plataforma privada. Cada propuesta está identificada.</div>'+panel("Hoja de ruta","Para emprendedores, PyMEs y empresas que quieran aportar ideas",'<div class="panel-body">'+features+'</div>')+panel("¿Qué función te serviría?","Tu opinión puede orientar las prioridades",'<div class="panel-body"><p>Contame qué módulo necesitás, cuánto tiempo te hace perder hoy y qué resultado esperás. No hace falta ser programador.</p><div class="actions"><a class="btn primary" href="https://wa.me/5491126830194?text=Hola%20Caye%2C%20prob%C3%A9%20la%20demo%20de%20N%C3%9ACLEO%20y%20quiero%20sugerir%20una%20funci%C3%B3n." target="_blank" rel="noopener noreferrer">Sugerir una mejora ↗</a><a class="btn" href="https://cayelab-web.pages.dev/" target="_blank" rel="noopener noreferrer">Conocer CayeLab ↗</a></div></div>');
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

const views={inicio:viewHome,facturas:viewInvoices,proveedores:viewSuppliers,cuentas:viewAccounts,tesoreria:viewTreasury,caja:viewCash,reportes:viewReports,documentos:viewDocuments,futuro:viewFuture};
function render(){navUpdate();root.innerHTML=views[active]();}
function openModal(title,html){modalTitle.textContent=title;modalBody.innerHTML=html;modal.classList.add("open");modal.setAttribute("aria-hidden","false");$("#modal-close").focus();}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");modalBody.innerHTML="";}
function closeMenu(){$("#sidebar").classList.remove("open");$("#menu-toggle").setAttribute("aria-expanded","false")}
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
document.addEventListener("input",e=>{if(e.target.id==="invoice-search"){searchText=e.target.value;const parent=e.target.closest(".panel");if(parent){const tbody=parent.querySelector("tbody");if(tbody){const filtered=invoices.filter(x=>(nameOf(x.supplier)+" "+x.number+" "+x.type).toLowerCase().includes(searchText.toLowerCase())&&(filterStatus==="todos"||statusOf(x)===filterStatus));tbody.innerHTML=invoiceRows(filtered)}}}});
document.addEventListener("change",e=>{if(e.target.id==="invoice-status"){filterStatus=e.target.value;const panelElement=e.target.closest(".panel"),tbody=panelElement?.querySelector("tbody");if(tbody){const filtered=invoices.filter(x=>(nameOf(x.supplier)+" "+x.number+" "+x.type).toLowerCase().includes(searchText.toLowerCase())&&(filterStatus==="todos"||statusOf(x)===filterStatus));tbody.innerHTML=invoiceRows(filtered)}}});
$("#modal-close").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();closeMenu()}});
$("#menu-toggle").addEventListener("click",()=>{const o=$("#sidebar").classList.toggle("open");$("#menu-toggle").setAttribute("aria-expanded",String(o))});
const first=(location.hash||"#inicio").slice(1);active=navNames[first]?first:"inicio";render();
})();