CREATE OR REPLACE FUNCTION public.validate_survey_response() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sv public.surveys; q public.survey_questions; a jsonb; option_value jsonb;
BEGIN
 SELECT * INTO sv FROM public.surveys WHERE id = NEW.survey_id;
 IF sv.closes_at IS NOT NULL AND sv.closes_at <= now() THEN RAISE EXCEPTION 'This survey has closed'; END IF;
 IF jsonb_typeof(NEW.answers) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Answers must be an object'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.survey_questions WHERE survey_id = sv.id) THEN RAISE EXCEPTION 'This survey has no questions'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_object_keys(NEW.answers) k WHERE NOT EXISTS (SELECT 1 FROM public.survey_questions WHERE survey_id=sv.id AND id::text=k)) THEN RAISE EXCEPTION 'Unknown survey question'; END IF;
 FOR q IN SELECT * FROM public.survey_questions WHERE survey_id=sv.id LOOP
  a := NEW.answers->q.id::text;
  IF a IS NULL OR a = 'null'::jsonb OR a = '""'::jsonb OR a = '[]'::jsonb THEN
   IF q.required THEN RAISE EXCEPTION 'Please answer every required question'; END IF;
   CONTINUE;
  END IF;
  IF q.kind IN ('single_choice','multiple_choice') THEN
   IF q.kind='single_choice' THEN
    IF jsonb_typeof(a)<>'string' OR NOT q.options @> jsonb_build_array(a) THEN RAISE EXCEPTION 'Invalid choice'; END IF;
   ELSE
    IF jsonb_typeof(a)<>'array' THEN RAISE EXCEPTION 'Choose valid options'; END IF;
    FOR option_value IN SELECT value FROM jsonb_array_elements(a) LOOP
     IF jsonb_typeof(option_value)<>'string' OR NOT q.options @> jsonb_build_array(option_value) THEN RAISE EXCEPTION 'Invalid choice'; END IF;
    END LOOP;
    IF (SELECT count(*) FROM jsonb_array_elements(a)) <> (SELECT count(DISTINCT value) FROM jsonb_array_elements(a)) THEN RAISE EXCEPTION 'Duplicate choice'; END IF;
   END IF;
  ELSIF q.kind='rating' THEN
   IF jsonb_typeof(a)<>'number' THEN RAISE EXCEPTION 'Invalid rating'; END IF;
   IF (a::text)::numeric NOT IN (1,2,3,4,5) THEN RAISE EXCEPTION 'Rating must be between 1 and 5'; END IF;
  ELSIF q.kind='text' THEN
   IF jsonb_typeof(a)<>'string' OR length(trim(a #>> '{}'))=0 OR length(a #>> '{}')>5000 THEN RAISE EXCEPTION 'Please enter a valid text answer'; END IF;
  ELSE RAISE EXCEPTION 'Unsupported question type';
  END IF;
 END LOOP;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.validate_survey_response() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER validate_survey_response_before_insert BEFORE INSERT ON public.survey_responses FOR EACH ROW EXECUTE FUNCTION public.validate_survey_response();

CREATE OR REPLACE FUNCTION public.admin_create_survey(_survey jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE task_id uuid; survey_id uuid; q jsonb; pos integer := 0; reward_amount numeric; closing timestamptz;
BEGIN
 PERFORM public._require_admin();
 IF jsonb_typeof(_survey) IS DISTINCT FROM 'object' OR length(trim(coalesce(_survey->>'title','')))=0 OR length(trim(coalesce(_survey->>'description','')))=0 THEN RAISE EXCEPTION 'Title and description are required'; END IF;
 reward_amount := (_survey->>'reward')::numeric;
 IF reward_amount IS NULL OR reward_amount<=0 THEN RAISE EXCEPTION 'Reward must be positive'; END IF;
 IF public.setting_num('task_reward_max')>0 AND reward_amount>public.setting_num('task_reward_max') THEN RAISE EXCEPTION 'Reward exceeds the configured limit'; END IF;
 IF jsonb_typeof(_survey->'questions') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Questions are required'; END IF;
 IF jsonb_array_length(_survey->'questions') NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'Provide 1 to 50 questions'; END IF;
 closing := nullif(_survey->>'closes_at','')::timestamptz;
 IF closing IS NOT NULL AND closing<=now() THEN RAISE EXCEPTION 'Closing date must be in the future'; END IF;
 IF coalesce((_survey->>'estimated_minutes')::integer,0)<=0 THEN RAISE EXCEPTION 'Estimated time must be positive'; END IF;
 INSERT INTO public.tasks(title,description,instructions,category,reward,estimated_minutes,verification_method,status,created_by,ends_at,per_user_limit)
 VALUES(trim(_survey->>'title'),trim(_survey->>'description'),coalesce(_survey->>'instructions','Answer each question honestly.'),'surveys',reward_amount,(_survey->>'estimated_minutes')::integer,'survey','draft',auth.uid(),closing,1) RETURNING id INTO task_id;
 INSERT INTO public.surveys(task_id,title,closes_at) VALUES(task_id,trim(_survey->>'title'),closing) RETURNING id INTO survey_id;
 FOR q IN SELECT value FROM jsonb_array_elements(_survey->'questions') LOOP
  IF length(trim(coalesce(q->>'prompt','')))=0 OR coalesce(q->>'kind','') NOT IN ('text','single_choice','multiple_choice','rating') THEN RAISE EXCEPTION 'Invalid question'; END IF;
  IF q->>'kind' IN ('single_choice','multiple_choice') THEN
   IF jsonb_typeof(q->'options') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Choices are required'; END IF;
   IF jsonb_array_length(q->'options')<2 OR EXISTS(SELECT 1 FROM jsonb_array_elements(q->'options') o WHERE jsonb_typeof(o)<>'string' OR length(trim(o #>> '{}'))=0) THEN RAISE EXCEPTION 'Provide at least two nonempty choices'; END IF;
  END IF;
  INSERT INTO public.survey_questions(survey_id,position,kind,prompt,options,required) VALUES(survey_id,pos,q->>'kind',trim(q->>'prompt'),coalesce(q->'options','[]'::jsonb),coalesce((q->>'required')::boolean,true));
  pos := pos+1;
 END LOOP;
 PERFORM public._log_admin('create_survey','survey',survey_id,jsonb_build_object('task_id',task_id));
 RETURN survey_id;
END $$;
REVOKE ALL ON FUNCTION public.admin_create_survey(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_create_survey(jsonb) TO authenticated,service_role;