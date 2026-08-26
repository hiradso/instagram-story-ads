<?php

namespace App\Http\Controllers;

use App\Http\Requests\Conversation\SendMessageRequest;
use App\Http\Requests\Conversation\StoreConversationRequest;
use App\Models\AmbassadorProfile;
use App\Models\Campaign;
use App\Models\CampaignAssignment;
use App\Models\Conversation;
use App\Models\Message;
use App\Notifications\CampaignAssignedNotification;
use App\Notifications\ConversationStartedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->with(['campaign', 'advertiser', 'ambassador'])
            ->where($user->role === 'advertiser' ? 'advertiser_id' : 'ambassador_id', $user->id)
            ->latest('updated_at')
            ->paginate(20);

        return response()->json($conversations);
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $advertiser = $request->user();

        $campaign = Campaign::findOrFail($data['campaign_id']);
        abort_unless($campaign->advertiser_id === $advertiser->id, 403, 'این کمپین مال تو نیست.');
        abort_unless($campaign->assignment_mode === 'manual', 422, 'این کمپین رو تخصیص خودکار انجام می‌ده، نه گفت‌وگوی دستی.');

        $profile = AmbassadorProfile::with('user')->findOrFail($data['ambassador_profile_id']);
        abort_unless($profile->verified_at, 422, 'این سفیر هنوز تاییدشده نیست.');

        if (Conversation::where('campaign_id', $campaign->id)->where('ambassador_id', $profile->user_id)->exists()) {
            throw ValidationException::withMessages([
                'ambassador_profile_id' => ['قبلاً برای این کمپین با این سفیر گفت‌وگو شروع کردی.'],
            ]);
        }

        $briefPath = $request->hasFile('brief_file')
            ? $request->file('brief_file')->store('conversation-briefs', 'public')
            : null;

        $conversation = DB::transaction(function () use ($campaign, $profile, $advertiser, $data, $briefPath) {
            $conversation = Conversation::create([
                'campaign_id' => $campaign->id,
                'advertiser_id' => $advertiser->id,
                'ambassador_id' => $profile->user_id,
                'status' => 'open',
                'brief_file_path' => $briefPath,
            ]);

            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $advertiser->id,
                'body' => $data['message'],
            ]);

            return $conversation;
        });

        $profile->user->notify(new ConversationStartedNotification($conversation));

        return response()->json($conversation->load(['campaign', 'advertiser', 'ambassador']), 201);
    }

    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        Gate::authorize('view', $conversation);

        $messages = $conversation->messages()
            ->with('sender:id,name,role')
            ->when(
                $request->filled('after_id'),
                fn ($query) => $query->where('id', '>', $request->integer('after_id'))
            )
            ->oldest()
            ->get();

        return response()->json($messages);
    }

    public function sendMessage(SendMessageRequest $request, Conversation $conversation): JsonResponse
    {
        Gate::authorize('view', $conversation);
        abort_if($conversation->status !== 'open', 422, 'این گفت‌وگو دیگه باز نیست.');

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);
        $conversation->touch();

        return response()->json($message->load('sender:id,name,role'), 201);
    }

    // Advertiser confirms they want to work with this ambassador — creates
    // the real CampaignAssignment (same row/status the automatic engine
    // would create) so the ambassador's existing assignments flow (post
    // deadline, screenshot submission, approval) just picks it up unchanged.
    public function agree(Request $request, Conversation $conversation): JsonResponse
    {
        abort_unless($request->user()->id === $conversation->advertiser_id, 403);
        abort_if($conversation->status !== 'open', 422, 'این گفت‌وگو دیگه باز نیست.');

        $campaign = $conversation->campaign;
        abort_unless($campaign->status === 'active', 422, 'کمپین باید فعال باشه تا بشه همکاری رو شروع کرد.');

        $ambassadorProfile = AmbassadorProfile::where('user_id', $conversation->ambassador_id)->firstOrFail();
        $remainingCapacity = $campaign->capacity_views - $campaign->views_delivered - $campaign->reservedViews();
        abort_if(
            $ambassadorProfile->avg_views_7d > $remainingCapacity,
            422,
            'ظرفیت باقی‌مونده‌ی کمپین برای میانگین بازدید این سفیر کافی نیست.'
        );

        $assignment = DB::transaction(function () use ($conversation) {
            $conversation->update(['status' => 'agreed']);

            return CampaignAssignment::create([
                'campaign_id' => $conversation->campaign_id,
                'ambassador_id' => $conversation->ambassador_id,
                'status' => 'assigned',
                'assigned_at' => now(),
                'post_deadline_at' => now()->addHours((int) config('campaigns.post_deadline_hours')),
            ]);
        });

        $conversation->ambassador->notify(new CampaignAssignedNotification($conversation->campaign));

        return response()->json($assignment);
    }

    public function decline(Request $request, Conversation $conversation): JsonResponse
    {
        Gate::authorize('view', $conversation);
        abort_if($conversation->status !== 'open', 422, 'این گفت‌وگو دیگه باز نیست.');

        $conversation->update(['status' => 'declined']);

        return response()->json($conversation);
    }
}
