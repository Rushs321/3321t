import{createServer as b}from"http";import h from"axios";import y from"lodash";import w from"sharp";function n(a,e){if(a==0)return"0 B";let t=1024,o=e||2,r=["B","KB","MB","GB","TB","PB","EB","ZB","YB"],l=Math.floor(Math.log(a)/Math.log(t));return parseFloat((a/Math.pow(t,l)).toFixed(o))+" "+r[l]}function s(a,e){for(let[t,o]of Object.entries(a.headers))try{e.setHeader(t,o?.toString())}catch(r){console.log(r)}}function f(){return new Intl.DateTimeFormat("hu-HU",{timeZone:"Europe/Budapest",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date)}function m(a){let e=new URL("http://"+a.headers.host+a.url).searchParams,t=e.get("url");return Array.isArray(t)&&(t=t.join("&url=")),t?(t=t.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i,"http://"),{url:t,format:e.get("jpg")!="1"?"webp":"jpeg",grayscale:e.get("bw")!="0",quality:parseInt(e.get("l"))}):"bandwidth-hero-proxy"}function g(a,e,t){e.headersSent||(e.setHeader("content-length",0),e.removeHeader("cache-control"),e.removeHeader("expires"),e.removeHeader("date"),e.removeHeader("etag"),e.setHeader("location",encodeURI(t.url)),e.statusCode=302,e.end(),e.flushHeaders(),e.destroy(),a.drop(1/0),a.destroy(),gc?gc():global.gc&&global.gc())}async function u(a,e){let t=m(a);if(typeof t=="string"){e.write(t),e.end(),e.flushHeaders(),e.destroy(),a.drop(1/0),a.destroy(),gc?gc():global.gc&&global.gc();return}try{let o={...y.pick(a.headers,["cookie","dnt","referer"]),"accept-encoding":"*","user-agent":"Bandwidth-Hero Compressor","x-forwarded-for":a.headers["x-forwarded-for"]?.toString(),via:"1.1 bandwidth-hero"},r=await h({method:"get",headers:o,url:t.url,responseType:"arraybuffer"});if(!r)throw new Error("no response (1)");let l=r.data.length;w(r.data,{animated:t.format==="webp",limitInputPixels:!1,failOn:"none",unlimited:!0}).grayscale(t.grayscale).toFormat(t.format,{quality:t.quality,effort:6,mozjpeg:!0,progressive:!0,optimiseScans:!0,optimiseCoding:!0}).toBuffer(function(p,i,c){if(p||!r||typeof t=="string")throw e.write(t),e.end(),e.flushHeaders(),e.destroy(),a.drop(1/0),a.destroy(),r?.data.set([]),r?.data.fill(0),i.set([]),i.fill(0),r.data=null,gc?gc():global.gc&&global.gc(),p??new Error("this should not happen");let d=l-c.size;if(console.log(" "),console.log(f(),JSON.stringify({params:t,headers:o,body:{originalSize:n(l),compressedSize:n(c.size),savedSize:d<0?`-${n(Math.abs(d))}`:n(d)}},null,1).replace(/\"/g,"")),d<0)return r?.data.set([]),r?.data.fill(0),i.set([]),i.fill(0),r.data=null,gc?gc():global.gc&&global.gc(),g(a,e,t);s(r,e),e.setHeader("content-encoding","identity"),e.setHeader("content-type",`image/${t.format}`),e.setHeader("content-length",c.size),e.setHeader("x-original-size",l),e.setHeader("x-bytes-saved",d),e.statusCode=200,e.write(i),e.end().on("close",function(){e.flushHeaders(),e.destroy(),a.drop(1/0),a.destroy(),r?.data.set([]),r?.data.fill(0),i.set([]),i.fill(0),r.data=null,gc?gc():global.gc&&global.gc()})})}catch(o){return console.error("[proxy]","Cannot compress,",o.message??o),g(a,e,t)}finally{gc?gc():global.gc&&global.gc()}}b(function(a,e){let t=new URL("http://"+a.headers.host+a.url);switch(t.pathname.endsWith("/")?t.pathname.slice(-1):t.pathname){case"/":{u(a,e);break}case"/favicon.ico":{e.statusCode=204,e.end();break}default:{e.statusCode=404,e.end();break}}}).listen(16406);
