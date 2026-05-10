const warrior = {hp:125, atk:12, def:8, crit:5};
const skeleton = {hp:52, atk:8, def:3};

let turns = 0;
let skelHp = skeleton.hp;
let warHp = warrior.hp;

while(skelHp > 0 && warHp > 0) {
  turns++;
  let baseDmg = Math.max(2, Math.round((warrior.atk * 1.15) - (skeleton.def * 0.75)));
  let dmg = Math.max(2, Math.round(baseDmg * (0.9 + Math.random() * 0.2)));
  if (Math.random() < warrior.crit / 100) dmg = Math.round(dmg * 1.75);
  skelHp -= dmg;
  
  if (skelHp <= 0) break;
  
  let mBaseDmg = Math.max(2, Math.round((skeleton.atk * 1.15) - (warrior.def * 0.75)));
  let mDmg = Math.max(2, Math.round(mBaseDmg * (0.9 + Math.random() * 0.2)));
  warHp -= mDmg;
}
console.log('Warrior vs Skeleton: ' + turns + ' turns. Warrior remaining HP: ' + warHp);
