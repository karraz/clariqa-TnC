-- Sample content so the site has something to show. Safe to edit or delete.

insert into public.courses (slug, title, category, summary, description_md, price_myr, start_date, end_date, mode, venue, seats, status)
values
('spss-for-beginners', 'SPSS for Beginners: From Data Entry to Reporting', 'SPSS',
 'Two days of hands-on SPSS: clean your data, run descriptive and inferential tests, and write up results.',
 E'## What you will learn\n\n- Setting up variables and entering data correctly\n- Descriptive statistics, charts and frequency tables\n- t-tests, ANOVA, chi-square and correlation\n- Interpreting and reporting output in APA style\n\n## Who should attend\n\nPostgraduate students, lecturers and analysts who are new to SPSS.',
 450.00, current_date + 21, current_date + 22, 'hybrid', 'Shah Alam, Selangor + Zoom', 30, 'published'),
('r-programming-for-data-analysis', 'R Programming for Data Analysis', 'R',
 'Learn R and RStudio from scratch: tidyverse, ggplot2 and reproducible reports with Quarto.',
 E'## Modules\n\n1. R and RStudio basics\n2. Data wrangling with dplyr and tidyr\n3. Visualisation with ggplot2\n4. Regression models\n5. Reproducible reports with Quarto',
 650.00, current_date + 35, current_date + 37, 'online', 'Zoom', 40, 'published'),
('advanced-excel-dashboards', 'Advanced Excel: PivotTables, Power Query & Dashboards', 'Excel',
 'Automate reporting and build interactive dashboards in Excel.',
 E'## Highlights\n\n- XLOOKUP, dynamic arrays and LET\n- Power Query for cleaning data\n- PivotTables and PivotCharts\n- Building a one-page interactive dashboard',
 380.00, current_date + 14, current_date + 14, 'physical', 'Kuala Lumpur', 25, 'published'),
('ai-for-data-analysis', 'AI for Data Analysis: ChatGPT, Claude & Copilot for Researchers', 'AI',
 'Use generative AI responsibly to speed up cleaning, coding, analysis and write-up.',
 E'## You will practise\n\n- Prompting AI assistants to write and explain R, Python and Excel formulas\n- Checking AI output for statistical errors\n- AI-assisted literature review and reporting\n- Ethics, privacy and academic integrity',
 520.00, current_date + 28, current_date + 28, 'online', 'Zoom', 50, 'published'),
('structural-equation-modelling-smartpls', 'Structural Equation Modelling with SmartPLS', 'Statistics',
 'Measurement and structural models, bootstrapping, mediation and moderation with SmartPLS 4.',
 E'Designed for postgraduate researchers preparing thesis chapters.',
 750.00, current_date + 49, current_date + 50, 'hybrid', 'Shah Alam, Selangor + Zoom', 30, 'published');

insert into public.posts (slug, title, excerpt, body_md, tags, status, published_at)
values
('choosing-the-right-statistical-test', 'Choosing the Right Statistical Test: A Quick Guide',
 'A plain-language flowchart for picking between t-tests, ANOVA, chi-square and correlation.',
 E'Picking a test starts with two questions: **what type is your outcome variable**, and **how many groups are you comparing?**\n\n| Outcome | Groups | Test |\n|---|---|---|\n| Continuous | 2 | Independent t-test |\n| Continuous | 3+ | One-way ANOVA |\n| Categorical | 2+ | Chi-square |\n| Two continuous | – | Pearson correlation |\n\nCheck assumptions (normality, equal variances) before you report results.',
 '{statistics,spss}', 'published', now() - interval '7 days'),
('using-ai-safely-in-research', 'Using AI Assistants Safely in Your Research',
 'Generative AI can write code and explain output, but it can also be confidently wrong. Here is how to check it.',
 E'AI assistants are excellent at drafting R code or explaining an SPSS table. Always:\n\n1. Run the code yourself and inspect the output.\n2. Never paste identifiable participant data into a public AI tool.\n3. Declare AI use according to your university policy.',
 '{ai,research}', 'published', now() - interval '2 days');
