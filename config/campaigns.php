<?php

return [
    'post_deadline_hours' => env('CAMPAIGN_POST_DEADLINE_HOURS', 24),
    'min_assignable_views' => env('CAMPAIGN_MIN_ASSIGNABLE_VIEWS', 100),
    'max_assignments_per_run' => env('CAMPAIGN_MAX_ASSIGNMENTS_PER_RUN', 20),

    // How many campaigns an ambassador can have assigned at once
    // (status assigned/posted/submitted, across all campaigns), by level.
    // null means unlimited.
    'level_limits' => [
        1 => ['max_concurrent_assignments' => 1],
        2 => ['max_concurrent_assignments' => 3],
        3 => ['max_concurrent_assignments' => null],
    ],

    // Ambassadors auto-promote once their lifetime count of admin-approved
    // view submissions reaches these thresholds.
    'level_up_thresholds' => [
        2 => 5,
        3 => 20,
    ],
];
