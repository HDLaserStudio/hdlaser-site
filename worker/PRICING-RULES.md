# Pricing rules from Hugh

Every price rule Hugh gives, in his words, with the date and how it landed in the price book. The code's starting numbers (`DEFAULT_BOOK` in `src/index.js`) are kept in step with this file; "Load the starting numbers" on the money page applies them.

| Date | Hugh said | How it is priced now |
|---|---|---|
| 2026-10-01 | UV print, 2.5 in design, customer's own item: starts from $35. No sales tax when they bring the item. | Own items carry no tax. Starting prices are all in (setup 0). |
| 2026-10-01 | Text only (nothing to digitize), customer's own item, engraving or UV: $25. | Flat `text_only_own_cents` = $25, any size. |
| 2026-10-01 | Smallest job, up to 2 in: $35 engraving, $40 UV. | Ladders are flat to 2 in, then climb. |
| 2026-10-02 | Cutting bed is 15 x 28 in. One cut filling the bed: about $100, depending on complexity and time. | Cutting ladder $35 flat to 2 in, straight line to $100 at 28 in; detail multipliers simple x1, detailed x1.5, intricate x2. |
| 2026-10-02 | Custom plaque with a 7 x 9 metal plate, logo and text engraved: $125. | New item "Wood plaque with 7 x 9 metal plate" at $53 plus 9 in engraving at $72 = $125 before tax. Engraving ladder eased above 2 in ($2 a step, growing 10 cents) so a 9 in logo lands near $72 and 12 in near $94. |
