<?php

namespace App\Payments;

interface PaymentGateway
{
    /**
     * Start a payment: returns the authority (tracking code) the gateway
     * assigned and the URL to redirect the payer to.
     *
     * @return array{authority: string, redirect_url: string}
     */
    public function request(string $amount, string $description, string $callbackUrl): array;

    /**
     * Confirm a payment after the payer returns from the gateway.
     *
     * @return array{success: bool, ref_id: ?string}
     */
    public function verify(string $authority, string $amount): array;
}
