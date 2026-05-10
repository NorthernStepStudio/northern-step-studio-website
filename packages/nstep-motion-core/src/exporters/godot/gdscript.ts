import { CharacterProject } from '../../schema/types';

export function exportToGDScript(project: CharacterProject): string {
  let lines: string[] = [];
  lines.push(`extends Node2D`);
  lines.push(``);
  lines.push(`# NStep Code Motion - Generated GDScript`);
  lines.push(`# Project: ${project.name}`);
  lines.push(`# Note: Ensure your Godot scene nodes are named to match the sanitized part names.`);
  lines.push(`# Sanitization: Only a-z, A-Z, 0-9, and _ are kept.`);
  lines.push(``);
  
  // Create variables for base values
  lines.push(`var time: float = 0.0`);
  lines.push(`var speed_multiplier: float = 1.0`);
  lines.push(`var current_animation: String = "${project.animations[0]?.id || ''}"`);
  lines.push(``);
  
  lines.push(`@onready var parts = {}`);
  lines.push(`var base_transforms = {}`);
  lines.push(``);

  lines.push(`func _ready():`);
  project.parts.forEach(p => {
    // Sanitize node name
    const nodeName = p.name.replace(/[^a-zA-Z0-9_]/g, '');
    lines.push(`  var node_${p.id} = get_node_or_null("${nodeName}")`);
    lines.push(`  if node_${p.id}:`);
    lines.push(`    parts["${p.id}"] = node_${p.id}`);
    lines.push(`    base_transforms["${p.id}"] = {`);
    lines.push(`      "position": node_${p.id}.position,`);
    lines.push(`      "rotation": node_${p.id}.rotation,`);
    lines.push(`      "scale": node_${p.id}.scale`);
    lines.push(`    }`);
    lines.push(`  else:`);
    lines.push(`    push_warning("NStep Code Motion: Missing child node '${nodeName}' for part '${p.name}'.")`);
  });
  lines.push(``);
  
  lines.push(`func play_animation(anim_id: String):`);
  lines.push(`  current_animation = anim_id`);
  lines.push(`  time = 0.0`);
  lines.push(``);

  lines.push(`func _process(delta: float):`);
  lines.push(`  time += delta * speed_multiplier`);
  lines.push(`  var anim_loop = true`);
  lines.push(`  var anim_duration = 1.0`);
  lines.push(`  match current_animation:`);
  project.animations.forEach(a => {
    lines.push(`    "${a.id}":`);
    lines.push(`      anim_loop = ${a.loop ? 'true' : 'false'}`);
    lines.push(`      anim_duration = ${a.duration}`);
  });
  lines.push(`  `);
  lines.push(`  if not anim_loop and time > anim_duration:`);
  lines.push(`    time = anim_duration`);
  lines.push(`  `);
  lines.push(`  match current_animation:`);
  
  if (project.animations.length === 0) {
     lines.push(`    _: pass`);
  }

  for (const anim of project.animations) {
    lines.push(`    "${anim.id}":`);
    
    // Group controllers by part
    const controllersByPart = new Map<string, any[]>();
    for (const c of anim.controllers) {
      if (!c.enabled) continue;
      if (!controllersByPart.has(c.targetPartId)) {
        controllersByPart.set(c.targetPartId, []);
      }
      controllersByPart.get(c.targetPartId)!.push(c);
    }

    if (controllersByPart.size === 0) {
      lines.push(`      pass`);
      continue;
    }

    for (const [partId, controllers] of controllersByPart.entries()) {
      const part = project.parts.find(p => p.id === partId);
      if (!part) continue;

      lines.push(`      # Part: ${part.name}`);
      lines.push(`      if parts.has("${partId}"):`);
      lines.push(`        var base_${partId} = base_transforms["${partId}"]`);
      
      lines.push(`        var cur_x_${partId} = base_${partId}.position.x`);
      lines.push(`        var cur_y_${partId} = base_${partId}.position.y`);
      lines.push(`        var cur_rot_${partId} = base_${partId}.rotation`);
      lines.push(`        var cur_scale_x_${partId} = base_${partId}.scale.x`);
      lines.push(`        var cur_scale_y_${partId} = base_${partId}.scale.y`);
      
      lines.push(`        var anim_dur = ${anim.duration || 1.0}`);
      
      for (const c of controllers) {
        const p = c.params;
        const t = `(time * ${p.speed} * PI * 2 + ${p.phase})`;
        
        let expr = '';
        switch (c.formulaPreset) {
          case 'breathingY':
            expr = `(sin(${t}) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'walkCycle':
          case 'legCycle':
            expr = `(sin(${t}) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'runCycle':
            expr = `((sin(${t}) + sin(${t} * 2.0) * 0.5) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'weaponSwing':
            expr = `((${p.amplitude} * (-sin(fmod(time, anim_dur)/anim_dur * PI * 2.5) * 0.3 if fmod(time, anim_dur)/anim_dur < 0.2 else sin((fmod(time, anim_dur)/anim_dur - 0.2) * PI * 3.33) if fmod(time, anim_dur)/anim_dur < 0.5 else cos((fmod(time, anim_dur)/anim_dur - 0.5) * PI))) + ${p.offset})`;
            break;
          case 'recoil':
            expr = `(sin(time * 20.0) * exp(-time * 10.0) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'impactShake':
            expr = `((randf() * 2.0 - 1.0) * exp(-time * 8.0) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'capeLag':
            expr = `(sin(${t} - 0.5) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'staffSway':
            expr = `(sin(${t} - 0.3) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'shieldBrace':
            expr = `((${p.amplitude} * (time / 0.3) if time < 0.3 else ${p.amplitude}) + ${p.offset})`;
            break;
          case 'deathFall':
            expr = `(min(1.0, time / anim_dur) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'blinkScale':
            expr = `(-${p.amplitude} if sin(${t}) < -0.8 else 0.0) + ${p.offset}`;
            break;
          case 'hoverFloat':
            expr = `(sin(${t} * 0.5) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'runLean':
            expr = `${p.offset}`;
            break;
          case 'attackStrike':
            expr = `(sin(${t}) * exp(-time * 2.0) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'hurtShake':
            expr = `(sin(time * 30.0) * exp(-time * 5.0) * ${p.amplitude}) + ${p.offset}`;
            break;
          case 'deathCollapse':
            expr = `((time / anim_dur) * ${p.amplitude}) + ${p.offset}`;
            break;
          default:
            expr = `(sin(${t}) * ${p.amplitude}) + ${p.offset}`;
        }
        
        if (c.property === 'x') lines.push(`        cur_x_${partId} += ${expr}`);
        if (c.property === 'y') lines.push(`        cur_y_${partId} += ${expr}`);
        if (c.property === 'rotation') lines.push(`        cur_rot_${partId} += deg_to_rad(${expr})`);
        if (c.property === 'scaleX') lines.push(`        cur_scale_x_${partId} += ${expr}`);
        if (c.property === 'scaleY') lines.push(`        cur_scale_y_${partId} += ${expr}`);
      }
      
      for (const c of controllers) {
          if (c.params.min !== c.params.max) {
             const p = c.property;
             let varName = '';
             if (p === 'x') varName = `cur_x_${partId}`;
             if (p === 'y') varName = `cur_y_${partId}`;
             if (p === 'rotation') varName = `cur_rot_${partId}`;
             if (p === 'scaleX') varName = `cur_scale_x_${partId}`;
             if (p === 'scaleY') varName = `cur_scale_y_${partId}`;
             
             if (varName) {
               if (p === 'rotation') {
                   lines.push(`        ${varName} = clamp(${varName}, deg_to_rad(${c.params.min} + rad_to_deg(base_${partId}.rotation)), deg_to_rad(${c.params.max} + rad_to_deg(base_${partId}.rotation)))`);
               } else {
                   let baseStr = `base_${partId}.position.x`;
                   if(p == 'y') baseStr = `base_${partId}.position.y`;
                   if(p == 'scaleX') baseStr = `base_${partId}.scale.x`;
                   if(p == 'scaleY') baseStr = `base_${partId}.scale.y`;
                   lines.push(`        ${varName} = clamp(${varName}, ${c.params.min} + ${baseStr}, ${c.params.max} + ${baseStr})`);
               }
             }
          }
      }

      lines.push(`        parts["${partId}"].position = Vector2(cur_x_${partId}, cur_y_${partId})`);
      lines.push(`        parts["${partId}"].rotation = cur_rot_${partId}`);
      lines.push(`        parts["${partId}"].scale = Vector2(cur_scale_x_${partId}, cur_scale_y_${partId})`);
      lines.push(``);
    }
  }

  return lines.join('\n');
}
