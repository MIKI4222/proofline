import {beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('../chain',()=>({client:{readContract:vi.fn()}}));
import {client} from '../chain';
import {CONFIG,clearCache,count,getMetric,getSources,getHistory,getObservation} from './contract';
const read=vi.mocked(client.readContract);
const metric={metric_id:1,metric_name:'Price',owner:'0x1111111111111111111111111111111111111111',description:'Current product price across stores',category:'FINANCIAL',data_type:'DECIMAL',metric_unit:'USD',extraction_instructions:'Extract the current listed price.',min_sources:2,max_sources:5,max_age_hours:24,max_deviation_bps:500,aggregation_method:'MEDIAN',outlier_policy:'FLAG',external_ref:'',source_count:0,observation_count:0,created_at:'2026-11-15',updated_at:'2026-11-15'};
beforeEach(()=>{read.mockReset();clearCache()});
describe('Metric adapter (mocked RPC)',()=>{
 it('reads exact contract count',async()=>{read.mockResolvedValue(1);expect(await count()).toBe(1);expect(read).toHaveBeenCalledWith(expect.objectContaining({address:CONFIG.address,functionName:'get_metric_count',args:[]}))});
 it('validates metric and routes views with correct argument order',async()=>{read.mockResolvedValueOnce(metric).mockResolvedValueOnce([]).mockResolvedValueOnce([]);expect((await getMetric(1)).metric_name).toBe('Price');expect(await getSources(1)).toEqual([]);expect(await getHistory(1)).toEqual([]);expect(read).toHaveBeenNthCalledWith(3,expect.objectContaining({functionName:'get_observation_history',args:[1]}))});
 it('rejects malformed data and invalid IDs',async()=>{read.mockResolvedValue({});await expect(getMetric(1)).rejects.toThrow();await expect(getMetric(0)).rejects.toThrow();await expect(getObservation(1,0)).rejects.toThrow()});
 it('propagates missing methods and RPC errors',async()=>{read.mockRejectedValue(Error('RPC unavailable'));await expect(count()).rejects.toThrow('RPC unavailable');read.mockRejectedValue(Error('unsupported method'));await expect(getSources(2)).rejects.toThrow('unsupported method')});
 it('deduplicates reads and invalidates cache',async()=>{read.mockResolvedValue(metric);await Promise.all([getMetric(1),getMetric(1)]);await getMetric(1);expect(read).toHaveBeenCalledTimes(1);clearCache();await getMetric(1);expect(read).toHaveBeenCalledTimes(2)});
});
