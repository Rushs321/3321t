import{createHmac as H}from"crypto";import{createReadStream as F,existsSync as v}from"fs";import{mkdir as B,rm as S}from"fs/promises";import b from"lodash";import{join as w}from"path";import z from"sharp";function l(t,e){for(let[r,o]of Object.entries(t.headers))try{e.setHeader(r,o)}catch{}}import x from"user-agents";function m(){return new x().toString()}import y from"axios";var R=y.create({}),f=R;function a(t,e){e.headersSent||(e.setHeader("content-length",0),e.removeHeader("cache-control"),e.removeHeader("expires"),e.removeHeader("date"),e.removeHeader("etag"),e.setHeader("location",encodeURI(t.params.url)),e.status(302).end(),gc&&gc(),global.gc&&global.gc())}async function A(t,e){try{let r={...b.pick(t.headers,["cookie","dnt","referer"]),"User-Agent":m(),"Accept-Encoding":"*","x-forwarded-for":t.headers["x-forwarded-for"]||t.ip},o=await f({headers:r,url:t.params.url,responseType:"stream"});l(o,e);let i=t.params.webp?"webp":"jpeg",d=parseInt(t.params.quality),g=o.headers["Content-Type"]?o.headers["Content-Type"].toString().includes("gif"):o.config.url?.endsWith("gif"),u=H("sha512",Date.now().toString()+o.config.url).digest("hex"),n="./tmp",s=w(n,u);v(n)||await B(n,{recursive:!0}),o.data.pipe(z({animated:g,limitInputPixels:!1,failOn:"none",unlimited:!0}).toFormat(i,{quality:d,effort:6,progressive:!0,optimizeScans:!0,mozjpeg:!0}).toFile(s,async function(h,{size:p}){if(h)return a(t,e);e.setHeader("content-encoding","identity"),e.setHeader("content-type",`image/${i}`),e.setHeader("content-length",p),e.setHeader("x-original-size",0),e.setHeader("x-bytes-saved",p);let c=F(s);c.pipe(e).on("finish",async function(){c.close(),await S(s,{force:!0}),gc&&gc(),global.gc&&global.gc()})}))}catch{return a(t,e)}finally{gc&&gc(),global.gc&&global.gc()}}export{A as default};
