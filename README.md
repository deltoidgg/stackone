
# Approach
- Key difficulty was trying to think about what users actually want from this page
- Had to make assumptions based on what I would find useful
- Identified debugging and investigation as main concern
- So thought of ways to aid deeper discovery into the logs (beyond the details of an individual log which appear in the modal)

# Improvements
- Date represented in relative terms (e.g. 23s ago)
- Chart functionality improved with filtering on click
- Added table for aggregate account insights
- Expanded view of api endpoint to make it easier to read
- Ensure filtering state across graph and tables is consistent
- Began work on log detail slider card with improved animation

# Design & technical decisions

- Filtering was probably the most complex thing to implement here 
- First filter by time (chart selection), then apply account/method/status filters on top
- Top Accounts ranking is computed from the time-filtered set only, so clicking a chart bar updates the ranking, but clicking an account doesn't collapse the table to one row
- Filters are composable and independent, time chip and account chip can be added/removed without affecting each other
- "Showing X of Y" always reflects the final combined result of all active filters
- Used html portal for tooltips so they're not bound by the container

# TODOs
- Apply more suitable max width to accounts table
- Refine animation and page layout related to log detail slider card
- Chart tooltips should better track mouse movement

# Libraries/tools used
- Motion lib for animations
- Figma MCP to duplicate existing design (although this hit rate limits v quickly so didn't get much use out of it)
- Then just pasted screenshots into Cursor to try and replicate more of the design
- That didn't work that well either so had to refine the implementation a lot to match the design
- Wasted more time on this initial setup than I would have liked...

