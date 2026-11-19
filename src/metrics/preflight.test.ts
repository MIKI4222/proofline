import {beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('../chain',()=>({client:{getContractSchema:vi.fn(),readContract:vi.fn()}}));
vi.mock('./contract',()=>({getMetric:vi.fn(),getSources:vi.fn(),categories:['OTHER'],units:['USD']}));
import {client} from '../chain';import {getMetric,getSources} from './contract';import {verifyMetricWrite} from './preflight';
const owner='0x1111111111111111111111111111111111111111';
const schema=(name:string,params:string[][])=>({methods:{[name]:{readonly:false,params}}} as never);
beforeEach(()=>vi.clearAllMocks());
describe('Metric write preflight (mocked)',()=>{
 it('fails closed on missing or mismatched method',async()=>{vi.mocked(client.getContractSchema).mockResolvedValue(schema('verify_metric',[['bad','int']]));await expect(verifyMetricWrite({target:'metric',functionName:'verify_metric',args:[1]},owner)).rejects.toThrow('schema')});
 it('enforces owner, source minimum, and observation cap',async()=>{vi.mocked(client.getContractSchema).mockResolvedValue(schema('verify_metric',[['metric_id','int']]));const w={target:'metric' as const,functionName:'verify_metric' as const,args:[1]};vi.mocked(getMetric).mockResolvedValue({owner:'someone',source_count:2,min_sources:2,observation_count:0} as never);await expect(verifyMetricWrite(w,owner)).rejects.toThrow('owner');vi.mocked(getMetric).mockResolvedValue({owner,source_count:1,min_sources:2,observation_count:0} as never);await expect(verifyMetricWrite(w,owner)).rejects.toThrow('enough sources');vi.mocked(getMetric).mockResolvedValue({owner,source_count:2,min_sources:2,observation_count:50} as never);await expect(verifyMetricWrite(w,owner)).rejects.toThrow('fewer than 50');vi.mocked(getMetric).mockResolvedValue({owner,source_count:2,min_sources:2,observation_count:0} as never);await expect(verifyMetricWrite(w,owner)).resolves.toBeUndefined()});
 it('rejects duplicate added sources',async()=>{vi.mocked(client.getContractSchema).mockResolvedValue(schema('add_metric_source',[['metric_id','int'],['source_url','string'],['label','string']]));vi.mocked(getMetric).mockResolvedValue({owner,source_count:2,max_sources:5} as never);vi.mocked(getSources).mockResolvedValue([{source_url:'https://example.com/a'}] as never);await expect(verifyMetricWrite({target:'metric',functionName:'add_metric_source',args:[1,'https://example.com/a','']},owner)).rejects.toThrow('Duplicate')});
});
