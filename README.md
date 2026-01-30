Auto-DNP templates for Roam Research daily notes.

Auto-inserts a template into today's Daily Note Page (DNP) the first time the page is created or opened. Choose a template per weekday or a single weekday/weekend split, and reinsert manually if you delete the template and want to restore it.

## Features
- Auto-insert a template into today's DNP once per day
- Per-day templates (Mon–Sun) or Weekday/Weekend mode
- Preserves block open/closed state, headings, and text alignment
- Manual command to force re-insert today's template
- Uses a lightweight page property marker to prevent duplicates

## How it works
- On load, the extension checks today's DNP.
  - If the page exists, it inserts the template (once).
  - If the page does not exist yet, it sets a watch and inserts as soon as the page is created.
- After inserting today's template, it schedules a check for tomorrow so the next day's insertion is ready.
- A page property marker (auto-dnp-template) prevents re-inserting the same template on reload.

## Settings
Open the Roam Depot settings panel for the extension.

### Preferred Mode
- Daily: Set a unique template block reference for each day of the week.
- Weekday/Weekend: Set one template for weekdays and another for weekends.

### Insert position
- Bottom: Insert the template after any existing content (default).
- Top: Insert the template at the top of the page.

### Template block references
Paste a block reference (with or without (( ))) that points to the root of your template.

Example (Weekday/Weekend mode):
![image](https://user-images.githubusercontent.com/6857790/221770057-f2adeb75-f89c-4687-baf8-9c1b6a14156b.png)

## Commands
Manually trigger this day's DNP template
- Forces the template to be inserted for the current page's DNP, even if it was inserted before.
- Use this if you deleted today's template and want to restore it.

## Notes and behavior
- Templates only auto-insert for today's DNP.
- If your DNP already has content, the template is inserted at the configured position (top or bottom).
- A marker is stored on the page as a property:
  - Key: auto-dnp-template
  - Value: the template block UID used for insertion

## Troubleshooting
- Template didn't insert: Ensure your template block reference is set in settings and points to a block that exists.
- Manual insert does nothing: The command only works on a DNP page or the log page.
- Template inserted twice: Clear the auto-dnp-template page property and try again.
