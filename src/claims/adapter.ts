import { z } from 'zod';
import { TransactionHashVariant } from 'genlayer-js/types';
import { client } from '../chain';

import { CLAIM_ADDRESS } from './config';
export { CLAIM_ADDRESS, CLAIM_EXPLORER } from './config';
export const categories = ['CODE_FEATURE','CERTIFICATION','COMPATIBILITY','DELIVERABLE','COMPLIANCE','TECHNICAL_CAPABILITY','OTHER'] as const;
export const sourceTypes = ['GITHUB_REPOSITORY','TECHNICAL_DOCUMENTATION','OFFICIAL_WEBSITE','PUBLIC_REPORT','CERTIFICATION_RECORD','RESEARCH_PUBLICATION','OTHER'] as const;
export const outcomes = ['SUPPORTED','PARTIALLY_SUPPORTED','CONTRADICTED','INSUFFICIENT_EVIDENCE','SOURCE_UNAVAILABLE','INCONCLUSIVE'] as const;
const num = z.number().int().nonnegative().safe();
const strings = z.array(z.string());
const nums = z.array(num);
export const claimSchema = z.object({claim_id:num, owner:z.string(), claim:z.string(), category:z.enum(categories), instructions:z.string(), expected_facts:strings, min_sources:num, max_sources:num, external_ref:z.string(), expires_at:num, expired:z.boolean(), source_count:num, status:z.enum(['OPEN','ASSESSED']), assessment_count:num, created_at:z.string(), updated_at:z.string()}).passthrough();
export const sourceSchema = z.object({position:num, source_url:z.string(), source_type:z.enum(sourceTypes), description:z.string(), added_at:z.string()}).passthrough();
const factSchema=z.object({fact:z.string(),status:z.enum(['SUPPORTED','CONTRADICTED','CONFLICT','UNCLEAR','UNVERIFIED']),supporting_sources:nums,contradicting_sources:nums,mentioned_by:nums,independent_support_groups:num,independent_contradiction_groups:num}).passthrough();
const resultSchema=z.object({source_index:num, source_type:z.enum(sourceTypes),url:z.string(),access_status:z.enum(['ACCESSIBLE','EMPTY','UNAVAILABLE']),relevance:z.enum(['DIRECT','INDIRECT','IRRELEVANT']),evidence_result:z.enum(['SUPPORTS','CONTRADICTS','MIXED','NO_EVIDENCE']),facts:strings,key_findings:strings,evidence_excerpt:z.string(),excerpt_verified:z.boolean(),limitations:strings,possible_dependency:z.string()}).passthrough();
const relationshipSchema=z.object({a:num,b:num,relation:z.enum(['POSSIBLY_INDEPENDENT','POSSIBLY_RELATED','DUPLICATE_CONTENT','UNKNOWN'])}).passthrough();
const historySchema=z.object({assessment_number:num,previous_assessment:num,kind:z.enum(['VERIFY','REASSESS']),overall_status:z.enum(outcomes),evidence_strength:z.enum(['STRONG','MODERATE','WEAK','INSUFFICIENT']),confidence:num,source_count:num,observed_at:z.string()}).passthrough();
export const assessmentSchema=historySchema.extend({claim_id:num,claim_summary:z.string(),evidence_set:strings,source_results:z.array(resultSchema),fact_results:z.array(factSchema),source_relationships:z.array(relationshipSchema),supporting_findings:strings,contradictory_findings:strings,unverified_aspects:strings,limitations:strings,requested_by:z.string()}).passthrough();
const integrationSchema=z.object({claim_id:num,claim_owner:z.string(),external_ref:z.string(),claim_status:z.enum(['OPEN','ASSESSED']),verification_status:z.string(),assessment_version:num,source_count:num,latest_assessment:z.object({assessment_number:num,overall_status:z.enum(outcomes),evidence_strength:z.string(),source_count:num,evidence_summary:z.string(),observed_at:z.string()}).nullable(),last_verified_at:z.string(),last_conclusive_assessment:num}).passthrough();
export type Claim=z.infer<typeof claimSchema>; export type Assessment=z.infer<typeof assessmentSchema>;
let epoch=0;const cache=new Map<string,{at:number;value:unknown}>();const flights=new Map<string,Promise<unknown>>();
export function invalidateClaims(){epoch++;cache.clear();flights.clear();}
async function read(name:string,args:number[]=[],fresh=false):Promise<unknown>{
 const key=JSON.stringify([name,args]); if(!fresh){const c=cache.get(key);if(c && Date.now()-c.at<30000)return c.value;const f=flights.get(key);if(f)return f;}
 const e=epoch; const p=client.readContract({address:CLAIM_ADDRESS,functionName:name,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});if(!fresh)flights.set(key,p);
 try{const value=await p;if(e===epoch)cache.set(key,{at:Date.now(),value});return value;}finally{if(flights.get(key)===p)flights.delete(key);}
}
function id(n:number){if(!Number.isSafeInteger(n)||n<1)throw Error('Invalid claim or assessment ID');return n;}
export async function claimCount(fresh=false){const v=await read('get_claim_count',[],fresh);return num.parse(typeof v==='bigint'?Number(v):v);}
export async function getClaim(n:number,fresh=false){return claimSchema.parse(await read('get_claim',[id(n)],fresh));}
export async function getSources(n:number,fresh=false){return z.array(sourceSchema).parse(await read('get_evidence_sources',[id(n)],fresh));}
export async function getLatest(n:number,fresh=false){return assessmentSchema.parse(await read('get_latest_assessment',[id(n)],fresh));}
export async function getAssessment(n:number,version:number,fresh=false){return assessmentSchema.parse(await read('get_assessment',[id(n),id(version)],fresh));}
export async function getHistory(n:number,fresh=false){return z.array(historySchema).parse(await read('get_assessment_history',[id(n)],fresh));}
export async function getIntegration(n:number,fresh=false){return integrationSchema.parse(await read('get_integration_status',[id(n)],fresh));}
export function milestoneRef(n:number){return `proofline:milestone:${id(n)}`;}
export function parseMilestoneRef(ref:string){const m=/^proofline:milestone:([1-9]\d*)$/.exec(ref);if(!m)return null;const n=Number(m[1]);return Number.isSafeInteger(n)?n:null;}
export function validateRegistration(d:{claim:string;category:string;instructions:string;facts:string[];min:number;max:number;ref:string;expires:number}):string[]{
 const errors:string[]=[];const claim=d.claim.trim(), instructions=d.instructions.trim(), facts=d.facts.map(f=>f.trim()).filter(Boolean);
 if(claim.length<25||claim.length>500||claim.split(/\s+/).length<6)errors.push('Claim must be 25–500 characters and at least six words.');
 if(!categories.includes(d.category as typeof categories[number]))errors.push('Choose a valid category.');
 if(instructions.length<20||instructions.length>1000)errors.push('Instructions must be 20–1000 characters.');
 if(facts.length<1||facts.length>6||facts.some(f=>f.length<10||f.length>200||f.split(/\s+/).length<3||/\n|\|\|/.test(f)))errors.push('Add 1–6 facts, each 10–200 characters and at least three words.');
 if(new Set(facts.map(f=>f.toLowerCase())).size!==facts.length)errors.push('Facts must not be duplicates.');
 if(!Number.isInteger(d.min)||!Number.isInteger(d.max)||d.max<2||d.max>5||d.min<1||d.min>d.max)errors.push('Maximum sources must be 2–5; minimum must be between 1 and the maximum.');
 if(!/^[A-Za-z0-9:_./#@-]{0,100}$/.test(d.ref))errors.push('External reference has invalid characters or exceeds 100 characters.');
 if(d.expires!==0&&(!Number.isSafeInteger(d.expires)||d.expires<=Date.now()/1000||d.expires>Date.now()/1000+2*365*86400))errors.push('Expiry must be in the future and within two years.');
 return errors;
}
