# Audited contract interface

Repository: https://github.com/MIKI4222/milestone-judge-genlayer, root source `milestone_judge.py`, commit `c705894883e20c67b841b29fe41ecfb2b9ae0ab5`. README references directories not present in that checkout. No local upstream tests were present to execute.

Writes, positional order: `create_milestone(project_name, task_description, expected_deliverable, acceptance_criteria, reference_url, deadline, max_submissions, executor)`; `submit_evidence(id, url, explanation, supplementary_url)`; `submit_revision(id, url, explanation, supplementary_url)`; `evaluate_milestone(id)`. Criteria are newline-separated; deadline is Unix seconds; other IDs and limits are integers. Executor is empty or a 20-byte address. Frontend role checks do not replace contract authorization.

Views: `get_milestone_count`, `get_milestone(id)`, `get_status(id)`, `get_submission(id, attempt)`, `get_verification(id, attempt)`. Attempt 0 means latest submission, or latest attempt with verification for the verification view. The latter returns only the latest run for an attempt.

Initial evidence is allowed only while OPEN and before deadline, from the assigned executor or the first valid non-creator if unassigned. Only the executor may revise REVISION_REQUIRED or INCONCLUSIVE subject to deadline and attempts. Creator or executor may evaluate SUBMITTED or INCONCLUSIVE, with at most three runs per submission. APPROVED, REJECTED and EXHAUSTED are final. An undetermined consensus transaction leaves state unchanged. An inconclusive result may be re-evaluated or revised if permitted.

Criteria: 1–10, at least 15 characters and 3 words, at most 300 characters, no duplicates. Project: 1–120 characters; task 20–2000; deliverable 10–1000. Maximum submissions 1–5; future deadline within 2×365 days. URLs are public HTTP(S), up to 500 characters; explanation at most 1500. See source for the definitive validation rules.
