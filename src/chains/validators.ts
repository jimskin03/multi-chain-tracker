const B58='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function decode58(s:string):Uint8Array{if(/^1+$/.test(s))return new Uint8Array(s.length);const bytes=[0];for(const c of s){const v=B58.indexOf(c);if(v<0)throw Error('base58');let carry=v;for(let i=0;i<bytes.length;i++){carry+=bytes[i]*58;bytes[i]=carry&255;carry>>=8;}while(carry) {bytes.push(carry&255);carry>>=8;}}for(let i=0;i<s.length&&s[i]==='1';i++)bytes.push(0);return Uint8Array.from(bytes.reverse());}
export function isSolanaAddress(s:string):boolean{try{const t=s.trim();return t.length>=32&&t.length<=44&&decode58(t).length===32;}catch{return false;}}
export function isBitcoinAddress(s:string):boolean{const t=s.trim();return /^(bc1|tb1|bcrt1)[ac-hj-np-z02-9]{11,87}$/.test(t.toLowerCase())||/^[13mn2][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(t);}
export function isXrpAddress(s:string):boolean{return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(s.trim());}
export const short=(s:string)=>s.length>18?`${s.slice(0,8)}…${s.slice(-6)}`:s;
