export enum SubscriptionTypeEnum {
	PRO = "pro",
}

export const TRIAL_CREDITS = 10;

export class Subscription {
	public is_trial_activated: boolean;
	public credits: number;
	public subscription_type: SubscriptionTypeEnum | undefined;
	public last_credits_update: Date;
	public stripe_customer_id: string;
}

export const subscriptionDefaultObject: Subscription = {
	is_trial_activated: false,
	credits: 0,
	subscription_type: undefined,
	last_credits_update: new Date(),
	stripe_customer_id: undefined,
};
