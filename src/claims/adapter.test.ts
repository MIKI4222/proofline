import {describe,it,expect,vi,beforeEach} from 'vitest';
vi.mock('../chain',()=>({client:{readContract:vi.fn()}}));
import {client} from '../chain';
import {claimCount,getClaim,getSources,getLatest,getAssessment,getHistory,getIntegration,invalidateClaims,validateRegistration,milestoneRef,parseMilestoneRef,claimSchema,assessmentSchema,outcomes} from './adapter';
import claimFixture from '../../fixtures/claim.json';
import sourcesFixture from '../../fixtures/sources.json';
import assessmentFixture from '../../fixtures/assessment.json';
import historyFixture from '../../fixtures/history.json';
import integrationFixture from '../../fixtures/integration.json';
const mock=vi.mocked(client.readContract);
beforeEach(()=>{mock.mockReset();invalidateClaims()});
describe('ClaimVerifier real schema examples (mocked RPC)',()=>{
 it('reads count and validated claim',async()=>{mock.mockResolvedValueOnce(1).mockResolvedValueOnce(claimFixture);expect(await claimCount()).toBe(1);expect((await getClaim(1)).claim_id).toBe(1);expect(mock).toHaveBeenCalledTimes(2)});
 it('reads sources, latest, historical assessment, history and integration',async()=>{mock.mockResolvedValueOnce(sourcesFixture).mockResolvedValueOnce(assessmentFixture).mockResolvedValueOnce(assessmentFixture).mockResolvedValueOnce(historyFixture).mockResolvedValueOnce(integrationFixture);expect((await getSources(1)).length).toBe(2);expect((await getLatest(1)).overall_status).toBe('SUPPORTED');expect((await getAssessment(1,1)).assessment_number).toBe(1);expect((await getHistory(1)).length).toBe(1);expect((await getIntegration(1)).assessment_version).toBe(1)});
 it('rejects invalid responses, IDs and unknown statuses',async()=>{mock.mockResolvedValueOnce({});await expect(getClaim(1)).rejects.toThrow();await expect(getClaim(0)).rejects.toThrow();expect(()=>claimSchema.parse({...claimFixture,status:'FAKE'})).toThrow();for(const status of outcomes)expect(assessmentSchema.parse({...assessmentFixture,overall_status:status}).overall_status).toBe(status)});
 it('deduplicates cached calls and invalidates reads',async()=>{mock.mockResolvedValue(claimFixture);await Promise.all([getClaim(1),getClaim(1)]);expect(mock).toHaveBeenCalledTimes(1);invalidateClaims();await getClaim(1);expect(mock).toHaveBeenCalledTimes(2)});
});
describe('claim domain',()=>{const good={claim:'The application provides working scheduled automated backups for its users.',category:'TECHNICAL_CAPABILITY',instructions:'Verify the documented backup capability in the evidence.',facts:['Automated backup scheduling is supported'],min:2,max:3,ref:'proofline:milestone:2',expires:0};it('matches milestone references without inventing links',()=>{expect(milestoneRef(2)).toBe(good.ref);expect(parseMilestoneRef(good.ref)).toBe(2);expect(parseMilestoneRef('proofline:milestone:0')).toBeNull();expect(parseMilestoneRef('proofline:milestone:2-other')).toBeNull()});it('enforces contract validation and correct minimum source limit',()=>{expect(validateRegistration(good)).toEqual([]);expect(validateRegistration({...good,min:1})).toEqual([]);expect(validateRegistration({...good,instructions:''}).length).toBeGreaterThan(0);expect(validateRegistration({...good,facts:['short']}).length).toBeGreaterThan(0);expect(validateRegistration({...good,max:6}).length).toBeGreaterThan(0);expect(validateRegistration({...good,ref:'bad reference'}).length).toBeGreaterThan(0)});});
