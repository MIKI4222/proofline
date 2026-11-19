import {METRIC_ADDRESS} from './metrics/config';
import {CLAIM_ADDRESS} from './claims/config';
import {createClient,isSuccessful} from 'genlayer-js';
import {studioDevnet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import {CONFIG,milestoneSchema,statusSchema,submissionSchema,verificationSchema,type Milestone,type Status,type Submission,type Verification} from './domain';
export type Provider={request:(arg:{method:string;params?:unknown[]|object})=>Promise<unknown>;on?:(event:string,fn:(...args:unknown[])=>void)=>void;removeListener?:(event:string,fn:(...args:unknown[])=>void)=>void;isMetaMask?:boolean;providers?:Provider[]};
declare global {interface Window {ethereum?:Provider}}
export const client=createClient({chain:studioDevnet});
const cache=new Map<string,{at:number;value:unknown}>();const inflight=new Map<string,Promise<unknown>>();
let cacheEpoch=0;export function invalidateReads(){cacheEpoch++;cache.clear();inflight.clear();}
async function read(functionName:string,args:(number|string)[]=[],fresh=false):Promise<unknown>{const key=JSON.stringify([functionName,args]);if(!fresh){const hit=cache.get(key);if(hit&&Date.now()-hit.at<30000)return hit.value;const pending=inflight.get(key);if(pending)return pending;}const epoch=cacheEpoch;const request=client.readContract({address:CONFIG.contract,functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});if(!fresh)inflight.set(key,request);try{const value=await request;if(epoch===cacheEpoch)cache.set(key,{at:Date.now(),value});return value;}finally{if(!fresh&&inflight.get(key)===request)inflight.delete(key);}}

export async function count(fresh=false){const x=Number(await read('get_milestone_count',[],fresh));if(!Number.isSafeInteger(x)||x<0)throw Error('Unexpected milestone count');return x;}
export async function milestone(id:number,fresh=false):Promise<Milestone>{return milestoneSchema.parse(await read('get_milestone',[id],fresh));}
export async function status(id:number,fresh=false):Promise<Status>{return statusSchema.parse(await read('get_status',[id],fresh));}
export async function submission(id:number,n:number,fresh=false):Promise<Submission>{return submissionSchema.parse(await read('get_submission',[id,n],fresh));}
export async function verification(id:number,n:number,fresh=false):Promise<Verification>{return verificationSchema.parse(await read('get_verification',[id,n],fresh));}
export type WriteName='create_milestone'|'submit_evidence'|'submit_revision'|'evaluate_milestone';
export type Write={functionName:WriteName;args:(string|number|bigint)[];target?:'milestone'} | {functionName:'register_claim'|'add_evidence_source'|'verify_claim'|'reassess_claim';args:(string|number|bigint)[];target:'claim'} | {functionName:'register_metric'|'add_metric_source'|'verify_metric';args:(string|number|bigint)[];target:'metric'};
// SDK's EIP-1193 provider has a broader structural type; cast at this boundary only.
export function walletClient(provider:Provider,account:`0x${string}`){return createClient({chain:studioDevnet,account,provider:provider as NonNullable<Parameters<typeof createClient>[0]>['provider']});}
export async function estimate(provider:Provider,account:`0x${string}`,write:Write){return walletClient(provider,account).estimateTransactionFeesForWrite({address:write.target==='claim'?CLAIM_ADDRESS:write.target==='metric'?METRIC_ADDRESS:CONFIG.contract,functionName:write.functionName,args:write.args});}
export async function submit(provider:Provider,account:`0x${string}`,write:Write,fees:Awaited<ReturnType<typeof estimate>>){return walletClient(provider,account).writeContract({address:write.target==='claim'?CLAIM_ADDRESS:write.target==='metric'?METRIC_ADDRESS:CONFIG.contract,functionName:write.functionName,args:write.args,fees:{distribution:fees.distribution,feeValue:fees.feeValue}}) as Promise<`0x${string}`>;}
export {isSuccessful};
