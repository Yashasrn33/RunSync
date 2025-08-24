export type Pref = {
  lat: number; lng: number; radiusMiles: number;
  paceMin: number; paceMax: number;
  days: string[]; times: string[];
  goals: string[];
};

const W = { pace: 0.4, schedule: 0.3, geo: 0.2, goal: 0.1 };

export function haversineKm(a:{lat:number,lng:number}, b:{lat:number,lng:number}){
  const R=6371, toRad=(x:number)=>x*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng);
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}

function overlap01(aMin:number,aMax:number,bMin:number,bMax:number){
  const inter = Math.max(0, Math.min(aMax,bMax)-Math.max(aMin,bMin));
  const lenA = aMax-aMin, lenB = bMax-bMin;
  if (lenA<=0 || lenB<=0) return 0;
  const union = lenA+lenB-inter;
  return union>0 ? inter/union : 0;
}

function jaccard(a:Set<string>, b:Set<string>){
  const inter=[...a].filter(x=>b.has(x)).length;
  const union=new Set([...a,...b]).size;
  return union? inter/union : 0;
}

export function score(a:Pref, b:Pref){
  const pace = overlap01(a.paceMin,a.paceMax,b.paceMin,b.paceMax);
  const sched = jaccard(new Set(a.days.flatMap(d=>a.times.map(t=>\`\${d}-\${t}\`))),
                        new Set(b.days.flatMap(d=>b.times.map(t=>\`\${d}-\${t}\`))));
  const dist = haversineKm(a,b);
  const withinA = dist <= a.radiusMiles, withinB = dist <= b.radiusMiles;
  const geo = withinA && withinB ? 1 : Math.max(0, 1 - dist/Math.max(a.radiusMiles,b.radiusMiles,1));
  const goal = jaccard(new Set(a.goals), new Set(b.goals));

  return W.pace*pace + W.schedule*sched + W.geo*geo + W.goal*goal;
}
