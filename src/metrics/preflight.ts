import {client} from '../chain';
import {METRIC_ADDRESS} from './config';
import {getMetric,getSources} from './contract';
import {validate,validateSource,type Draft} from './validation';
import type {Write} from '../chain';
type MetricWrite=Extract<Write,{target:'metric'}>;
const expected={
 register_metric:[['metric_name','string'],['description','string'],['category','string'],['data_type','string'],['expected_unit','string'],['extraction_instructions','string'],['source_urls','string'],['min_sources','int'],['max_sources','int'],['max_age_hours','int'],['max_deviation_bps','int'],['aggregation_method','string'],['outlier_policy','string'],['external_ref','string']],
 add_metric_source:[['metric_id','int'],['source_url','string'],['label','string']],
 verify_metric:[['metric_id','int']],
} as const;
export async function verifyMetricWrite(w:MetricWrite,account:string){
 const schema=await client.getContractSchema(METRIC_ADDRESS);const method=schema.methods[w.functionName],params=expected[w.functionName];
 if(!method||method.readonly||method.params.length!==params.length||w.args.length!==params.length||params.some(([name,type],i)=>method.params[i]?.[0]!==name||method.params[i]?.[1]!==type))throw Error('Metric contract schema does not match the expected write method.');
 if(w.functionName==='register_metric'){
  const a=w.args;
  const d:Draft={name:String(a[0]),description:String(a[1]),category:String(a[2]),dataType:String(a[3]),unit:String(a[4]),instructions:String(a[5]),sources:String(a[6]).split('||'),min:Number(a[7]),max:Number(a[8]),age:Number(a[9]),deviation:Number(a[10]),aggregation:String(a[11]),outlier:String(a[12]),ref:String(a[13])};
  const errors=validate(d);if(errors.length)throw Error(errors.join(' '));return;
 }
 const id=Number(w.args[0]);if(!Number.isSafeInteger(id)||id<1)throw Error('Invalid metric ID.');const m=await getMetric(id,true);
 if(m.owner.toLowerCase()!==account.toLowerCase())throw Error('Only the metric owner can perform this action.');
 if(w.functionName==='add_metric_source'){const sources=await getSources(id,true);if(m.source_count>=m.max_sources)throw Error('The source limit has been reached.');const error=validateSource(String(w.args[1]),sources.map(s=>s.source_url));if(error)throw Error(error);if(String(w.args[2]).length>120)throw Error('Label must be at most 120 characters.');}
 if(w.functionName==='verify_metric'&&(m.source_count<m.min_sources||m.observation_count>=50))throw Error('Verification requires enough sources and fewer than 50 observations.');
}
