# Sunday Robot Assets Needed

## Required Images for Onboarding

The onboarding page expects these robot sprite images:

### `/public/assets/sunday_idle.png`
- Sunday robot in neutral/idle pose
- Size: 200x200px recommended
- Should show Sunday looking friendly and welcoming
- Used for blinking animation during dialogue

### `/public/assets/sunday_happy.png` 
- Sunday robot in happy/excited pose
- Size: 200x200px recommended
- Should show Sunday smiling or with happy expression
- Used for final greeting with bounce animation

## Current Status
The onboarding page is fully functional but will show broken images until these assets are added.

## Fallback Option
You can temporarily use the existing living room background or create simple colored rectangles as placeholders:

```css
/* Temporary placeholder styles */
.sunday-placeholder {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #4ade80, #22c55e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}
```

## Next Steps
1. Create or source Sunday robot sprite images
2. Place them in `/public/assets/` directory
3. Update image paths in onboarding page if needed
