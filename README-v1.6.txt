PROJECT YIELD v1.6 - CREATOR VALUE + WORKFLOW

Adds:
- Full workflow controls: Received -> Need to Film -> Filmed -> Editing -> Ready to Post -> Posted -> Waiting on Payment -> Complete
- Back/Next workflow controls in Content Workspace
- Product value kept separate from cash compensation
- Product value counts toward received value only after physical receipt
- Posted URL, payment status, and paid timestamp tracking
- Total Creator Value = cash actually paid + product value actually received
- Money dashboard separates cash paid, product value received, products received, and awaiting payment
- Recordkeeping note: Project Yield does not determine taxable income

DEPLOY
1. npx supabase db push
2. npm run build
3. git add .
4. git commit -m "Project Yield v1.6 Creator Value and Workflow"
5. git push

No paid APIs or services added.
