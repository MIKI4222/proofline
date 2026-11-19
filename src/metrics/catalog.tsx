import {useCallback,useEffect,useRef,useState} from 'react';
import {count,getMetric,getIntegration,clearCache,errorMessage,type Metric,type Integration} from './contract';
export type CatalogItem={metric:Metric;integration:Integration|null;integrationError?:string};

// Sequential IDs are read newest-first in bounded pages, with at most three in flight.
export function useCatalog(){
  const [items,setItems]=useState<CatalogItem[]>([]),[total,setTotal]=useState<number|null>(null),[next,setNext]=useState(0),[loading,setLoading]=useState(false),[error,setError]=useState(''),[failures,setFailures]=useState<number[]>([]),[version,setVersion]=useState(0);
  const generation=useRef(0),busy=useRef(false);
  const load=useCallback(async(start:number|null,reset=false)=>{
    if(busy.current&&!reset)return;
    if(reset){generation.current++;setItems([]);setTotal(null);setNext(0);setFailures([])}
    const token=generation.current;
    busy.current=true;setLoading(true);setError('');
    try{
      const n=await count(reset);if(token!==generation.current)return;
      setTotal(n);
      const first=start===null?n:Math.min(start,n);
      const ids=Array.from({length:Math.min(12,first)},(_,i)=>first-i);
      const all:CatalogItem[]=[],bad:number[]=[];
      for(let i=0;i<ids.length;i+=3){
        await Promise.all(ids.slice(i,i+3).map(async id=>{
          try{
            const metric=await getMetric(id,reset);let integration:Integration|null=null;let integrationError='';
            if(metric.observation_count){try{integration=await getIntegration(id)}catch(e){integrationError=errorMessage(e)}}
            all.push({metric,integration,integrationError});
          }catch{bad.push(id)}
        }));
        if(token!==generation.current)return;
      }
      setItems(prev=>reset?all:[...prev,...all]);setFailures(prev=>reset?bad:[...prev,...bad]);setNext(Math.max(0,first-ids.length));
    }catch(e){
      if(token===generation.current){setError(errorMessage(e));if(reset){setItems([]);setTotal(null);setNext(0)}}
    }finally{if(token===generation.current){busy.current=false;setLoading(false)}}
  },[]);
  useEffect(()=>{void load(null,true);return()=>{generation.current++;busy.current=false}},[load,version]);
  useEffect(()=>{const f=()=>{clearCache();setVersion(x=>x+1)};window.addEventListener('proofline-refresh',f);return()=>window.removeEventListener('proofline-refresh',f)},[]);
  return {items,total,next,loading,error,failures,more:()=>void load(next),refresh:()=>{clearCache();setVersion(x=>x+1)}};
}
