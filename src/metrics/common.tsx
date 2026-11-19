import {useEffect,useState,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,ExternalLink} from 'lucide-react';
import {errorMessage} from './contract';
export function useLoad<T>(loader:()=>Promise<T>,deps:unknown[]){const [data,setData]=useState<T|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[version,setVersion]=useState(0);useEffect(()=>{let cancelled=false;setLoading(true);setData(null);setError('');loader().then(x=>{if(!cancelled)setData(x)}).catch(e=>{if(!cancelled)setError(errorMessage(e))}).finally(()=>{if(!cancelled)setLoading(false)});return()=>{cancelled=true}},[...deps,version]);return {data,error,loading,refresh:()=>setVersion(v=>v+1)}}
export function External({href,children}:{href:string;children:ReactNode}){return <a href={href} target="_blank" rel="noopener noreferrer">{children} <ExternalLink size={14}/></a>}
export function Badge({value}:{value:string}){return <span className={'metric-badge '+(/FAIL|ERROR|NO_CONSENSUS/.test(value)?'red':/CONSENSUS_REACHED/.test(value)?'green':/UNCLEAR|INCONCLUSIVE|CONFLICT/.test(value)?'amber':'')}>{value.replaceAll('_',' ')}</span>}
export function ButtonLink({to,children,secondary=false}:{to:string;children:ReactNode;secondary?:boolean}){return <Link className={'button '+(secondary?'button-outline':'button-lime')} to={to}>{children}<ArrowRight size={16}/></Link>}
export function Notice({children,error=false}:{children:ReactNode;error?:boolean}){return <div className={'notice '+(error?'error':'')}>{children}</div>}
export function PageIntro({eyebrow,title,description,action}:{eyebrow:string;title:string;description?:string;action?:ReactNode}){return <div className="metric-intro"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{action}</div>}
