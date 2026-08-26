<?php

namespace Database\Seeders;

use App\Models\AmbassadorProfile;
use App\Models\Campaign;
use App\Models\CampaignAssignment;
use App\Models\Category;
use App\Models\City;
use App\Models\Province;
use App\Models\User;
use App\Models\ViewSubmission;
use App\Models\WithdrawalRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

/**
 * Local-only sample data: one advertiser, three ambassadors (with
 * profiles, campaigns, assignments, a view submission at each status,
 * and a withdrawal) — enough to click through every screen without
 * starting from an empty database. Never run in production (see
 * DatabaseSeeder, which only calls this when app()->environment('local')).
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::where('slug', 'fashion')->firstOrFail();
        $province = Province::where('name', 'آذربایجان شرقی')->firstOrFail();
        $city = City::where('province_id', $province->id)->where('name', 'تبریز')->firstOrFail();

        $advertiser = $this->user('advertiser@test.local', 'آگهی‌دهنده دمو', '09120000010', 'advertiser');

        $ambassador1 = $this->user('ambassador0@test.local', 'سارا رضایی', '09131000000', 'ambassador', level: 2);
        $ambassador2 = $this->user('ambassador1@test.local', 'نیما احمدی', '09131000001', 'ambassador', level: 1);
        $ambassador3 = $this->user('ambassador2@test.local', 'مریم کریمی', '09131000002', 'ambassador', level: 1);

        $profile1 = $this->profile($ambassador1, 'sara_style', $category, $province, $city, 50000, 7000, '0.00');
        $profile2 = $this->profile($ambassador2, 'nima_fit', $category, $province, $city, 28000, 3500, '266000.00');
        $profile3 = $this->profile($ambassador3, 'maryam_beauty', $category, $province, $city, 62000, 8000, '0.00');

        $activeCampaign = $this->campaign(
            $advertiser,
            $category,
            'کمپین تبلیغاتی کفش ورزشی',
            budgetTotal: '2000000.00',
            pricePer1000: '60000.00',
            status: 'active',
        );

        $this->campaign(
            $advertiser,
            $category,
            'کمپین معرفی عطر جدید',
            budgetTotal: '1500000.00',
            pricePer1000: '75000.00',
            status: 'pending_review',
        );

        // One assignment per ambassador on the active campaign, each parked
        // at a different stage of the review pipeline.
        $submittedAssignment1 = $this->assignment($activeCampaign, $ambassador1, 'submitted');
        $approvedAssignment = $this->assignment($activeCampaign, $ambassador2, 'approved');
        $submittedAssignment2 = $this->assignment($activeCampaign, $ambassador3, 'submitted');

        $this->submission($submittedAssignment1, 5120, status: 'pending');
        $this->submission($submittedAssignment2, 5200, status: 'pending');
        $this->submission($approvedAssignment, 6100, approvedViews: 6100, status: 'approved');

        $this->withdrawal($ambassador2, '100000.00', 'approved');
    }

    private function user(string $email, string $name, string $phone, string $role, int $level = 1): User
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'phone' => $phone,
                'password' => Hash::make('password'),
            ],
        );

        $user->forceFill(['role' => $role, 'level' => $level])->save();

        return $user;
    }

    private function profile(
        User $user,
        string $instagramUsername,
        Category $category,
        Province $province,
        City $city,
        int $followerCount,
        int $avgViews7d,
        string $walletBalance,
    ): AmbassadorProfile {
        $profile = AmbassadorProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'category_id' => $category->id,
                'province_id' => $province->id,
                'city_id' => $city->id,
                'instagram_username' => $instagramUsername,
                'instagram_url' => "https://instagram.com/{$instagramUsername}",
                'follower_count' => $followerCount,
                'avg_views_7d' => $avgViews7d,
            ],
        );

        $profile->forceFill(['wallet_balance' => $walletBalance, 'verified_at' => now()])->save();

        return $profile;
    }

    private function campaign(
        User $advertiser,
        Category $category,
        string $title,
        string $budgetTotal,
        string $pricePer1000,
        string $status,
    ): Campaign {
        $capacityViews = (int) bcmul(bcdiv($budgetTotal, $pricePer1000, 10), '1000', 0);

        $campaign = Campaign::where('advertiser_id', $advertiser->id)->where('title', $title)->first();

        if (! $campaign) {
            $campaign = new Campaign([
                'advertiser_id' => $advertiser->id,
                'category_id' => $category->id,
                'title' => $title,
                'creative_path' => 'campaign-creatives/demo.jpg',
                'price_per_1000_views' => $pricePer1000,
                'budget_total' => $budgetTotal,
                'assignment_mode' => 'auto',
            ]);
        }

        $campaign->forceFill([
            'status' => $status,
            'budget_remaining' => $budgetTotal,
            'capacity_views' => $capacityViews,
            'views_delivered' => 0,
        ])->save();

        return $campaign;
    }

    private function assignment(Campaign $campaign, User $ambassador, string $status): CampaignAssignment
    {
        return CampaignAssignment::firstOrCreate(
            ['campaign_id' => $campaign->id, 'ambassador_id' => $ambassador->id],
            [
                'status' => $status,
                'assigned_at' => now()->subDays(2),
                'post_deadline_at' => now()->addDay(),
            ],
        );
    }

    private function submission(
        CampaignAssignment $assignment,
        int $claimedViews,
        string $status,
        ?int $approvedViews = null,
    ): ViewSubmission {
        return ViewSubmission::firstOrCreate(
            ['campaign_assignment_id' => $assignment->id],
            [
                'screenshot_path' => 'view-submissions/demo.jpg',
                'image_hash' => hash('sha256', "demo-{$assignment->id}"),
                'claimed_views' => $claimedViews,
                'approved_views' => $approvedViews,
                'status' => $status,
            ],
        );
    }

    private function withdrawal(User $ambassador, string $amount, string $status): WithdrawalRequest
    {
        return WithdrawalRequest::firstOrCreate(
            ['user_id' => $ambassador->id, 'amount' => $amount],
            ['status' => $status],
        );
    }
}
