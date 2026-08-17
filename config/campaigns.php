<?php

return [
    'post_deadline_hours' => env('CAMPAIGN_POST_DEADLINE_HOURS', 24),
    'min_assignable_views' => env('CAMPAIGN_MIN_ASSIGNABLE_VIEWS', 100),
    'max_assignments_per_run' => env('CAMPAIGN_MAX_ASSIGNMENTS_PER_RUN', 20),
];
