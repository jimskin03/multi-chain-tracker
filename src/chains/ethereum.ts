import type { ChainAdapter, WalletTransaction } from '../types/wallet';
import { getPrices } from '../services/priceService';
import { isEthereumAddress } from './validators';

const DEFAULT_RPC='https://ethereum-rpc.publicnode.com';
const DEFAULT_BLOCKSCOUT='https://eth.blockscout.com/api/v2';
const rpcUrl=import.meta.env.VITE_ETHEREUM_RPC_URL||DEFAULT_RPC;
const blockscoutUrl=(import.meta.env.VITE_ETHEREUM_BLOCKSCOUT_URL||DEFAULT_BLOCKSCOUT).replace(/\/$/,'');
const timeout=async<T>(p:Promise<T>,ms=15000):Promise<T>=>Promise.race([p,new Promise<T>((_,rej)=>setTimeout(()=>rej(new Error('Request timed out')),ms))]);

async function rpcCall<T>(method:string,params:unknown[]):Promise<T>{
 const endpoints=[rpcUrl,DEFAULT_RPC].filter((v,i,a)=>v&&!a.slice(0,i).includes(v));let last:unknown;
 for(const endpoint of endpoints){try{const r=await timeout(fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})}));if(!r.ok){last=Error(`Ethereum RPC HTTP ${r.status}`);continue;}const j=await r.json() as {result?:T;error?:{message?:string}};if(j.error)throw Error(j.error.message||'Ethereum RPC error');if(j.result===undefined)throw Error('Ethereum RPC returned no result');return j.result;}catch(err){last=err;}}
 throw last instanceof Error?last:Error('Unable to reach Ethereum RPC');
}

async function blockscout<T>(path:string):Promise<T>{const r=await timeout(fetch(`${blockscoutUrl}${path}`,{headers:{accept:'application/json'}}));if(!r.ok)throw Error(`Blockscout HTTP ${r.status}`);return r.json() as Promise<T>;}

export function weiToEth(value:string|number|bigint,maxFraction=8):string{
 let wei:bigint;try{wei=typeof value==='bigint'?value:BigInt(value);}catch{return '0';}
 const negative=wei<0n;if(negative)wei=-wei;const scale=1_000_000_000_000_000_000n;const whole=wei/scale;const fraction=(wei%scale).toString().padStart(18,'0').slice(0,maxFraction).replace(/0+$/,'');
 return `${negative?'-':''}${whole}${fraction?`.${fraction}`:''}`;
}

function partyLabel(p:any):string|undefined{return p?.ens_domain_name||p?.name||p?.hash||undefined;}

export function normalizeEthereumTransaction(tx:any,address:string):WalletTransaction{
 const wallet=address.toLowerCase();const from=tx.from?.hash?.toLowerCase();const to=tx.to?.hash?.toLowerCase();
 const direction=from===wallet&&to===wallet?'self':to===wallet?'incoming':from===wallet?'outgoing':'activity';
 let amount: string|undefined;try{const value=BigInt(tx.value||'0');if(value>0n)amount=weiToEth(value);}catch{/* leave amount undefined */}
 let fee: string|undefined;try{const feeWei=BigInt(tx.fee?.value||'0');if(feeWei>0n)fee=weiToEth(feeWei);}catch{/* leave fee undefined */}
 const confirmations=Number(tx.confirmations);const parsedTime=Date.parse(tx.timestamp||'');
 return {hash:tx.hash,direction,amount,timestamp:Number.isNaN(parsedTime)?undefined:Math.floor(parsedTime/1000),confirmations:Number.isFinite(confirmations)?confirmations:undefined,status:tx.status==='ok'?'confirmed':tx.status==='error'?'failed':'pending',counterparty:direction==='incoming'?partyLabel(tx.from):direction==='outgoing'?partyLabel(tx.to):direction==='self'?address:partyLabel(tx.to)||partyLabel(tx.from),type:tx.method||((tx.to?.is_contract||tx.created_contract)?'Contract call':'Ethereum transfer'),fee,explorerUrl:`https://eth.blockscout.com/tx/${tx.hash}`};
}

type HistoryResponse={items?:any[]};
type CounterResponse={transactions_count?:string};

export const ethereum:ChainAdapter={
 id:'ethereum',name:'Ethereum',symbol:'ETH',placeholder:'0x0000000000000000000000000000000000000000',validateAddress:isEthereumAddress,explorerAddress:a=>`https://eth.blockscout.com/address/${a}`,
 async lookupWallet(address){
  const balanceHex=await rpcCall<string>('eth_getBalance',[address,'latest']);const balanceWei=BigInt(balanceHex);const eth=Number(balanceWei)/1e18;
  const encoded=encodeURIComponent(address);const [historyResult,counterResult]=await Promise.allSettled([blockscout<HistoryResponse>(`/addresses/${encoded}/transactions`),blockscout<CounterResponse>(`/addresses/${encoded}/counters`)]);
  const transactions=historyResult.status==='fulfilled'?(historyResult.value.items||[]).slice(0,20).map(tx=>normalizeEthereumTransaction(tx,address)):[];
  const countRaw=counterResult.status==='fulfilled'?Number(counterResult.value.transactions_count):NaN;const transactionCount=Number.isFinite(countRaw)?countRaw:undefined;
  const price=(await getPrices(['ethereum'])).ethereum;const notice=historyResult.status==='rejected'?'ETH balance loaded from public Ethereum RPC. Indexed transaction history is temporarily unavailable.':undefined;
  return {chain:'ethereum',address,balance:{native:weiToEth(balanceWei),symbol:'ETH',usd:price?eth*price:undefined},transactionCount,transactions,explorerUrl:this.explorerAddress(address),notice};
 }
};
