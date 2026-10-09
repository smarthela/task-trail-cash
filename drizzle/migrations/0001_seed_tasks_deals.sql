INSERT INTO public.tasks (title, description, instructions, category, reward, estimated_minutes, verification_method, status, sponsor, external_url) VALUES
('Rate a new mobile banking app','Try the onboarding flow of a new Kenyan banking app and share honest feedback.','Install the app, complete signup, then describe your experience in 3+ sentences.','App testing',120,10,'text','active','Partner Bank',null),
('Follow SmartHELA on X','Follow our official account and paste your profile link.','Follow @smarthela and submit the link to your profile.','Social',20,2,'link','active','SmartHELA','https://x.com'),
('Snap a supermarket shelf photo','Help a FMCG brand audit cooking oil prices near you.','Take a clear photo of the cooking oil shelf showing prices and describe the shelf.','Field research',80,15,'text','active','Retail Insights Co',null),
('Translate 10 phrases to Swahili','Short translation job for a health awareness campaign.','Translate the phrases into natural Swahili.','Translation',150,20,'text','active','HealthReach',null),
('Mobile money habits survey','5-minute survey about how you use mobile money.','Answer every question honestly.','Survey',60,5,'text','active','FinResearch Africa',null);
INSERT INTO public.deals (title, description, provider, deal_type, reward_text, promo_code, url) VALUES
('KES 200 off first ride','New riders get KES 200 off their first trip.','RideNow','Cashback','KES 200 off','HELA200','https://example.com'),
('Free 1GB data bundle','Activate a new line and get 1GB free.','NetTel','Bonus','1GB free',null,'https://example.com'),
('10% off groceries','Online grocery delivery discount for new customers.','FreshCart','Discount','10% off','SMART10','https://example.com');