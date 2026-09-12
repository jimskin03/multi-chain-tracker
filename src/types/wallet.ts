export type ChainId = 'bitcoin' | 'solana' | 'xrp' | 'ethereum';
export type Direction = 'incoming' | 'outgoing' | 'self' | 'activity';
export interface WalletTransaction { hash:string; direction:Direction; amount?:string; timestamp?:number; confirmations?:number; status:'confirmed'|'pending'|'failed'; counterparty?:string; type:string; fee?:string; explorerUrl:string; }
export interface WalletSnapshot { chain:ChainId; address:string; balance:{native:string; symbol:string; usd?:number}; transactions:WalletTransaction[]; received?:string; sent?:string; transactionCount?:number; pendingCount?:number; explorerUrl:string; notice?:string; }
export interface ChainAdapter { id:ChainId; name:string; symbol:string; placeholder:string; validateAddress(address:string):boolean; lookupWallet(address:string):Promise<WalletSnapshot>; explorerAddress(address:string):string; }
