-- How many postings the public JSON listed vs how many we kept as US tech.
-- classifier_rev lets a filter change recrawl boards on the next page load.

alter table companies add column if not exists listed_count int;
alter table companies add column if not exists classifier_rev int not null default 0;
